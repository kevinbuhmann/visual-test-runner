import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as ProgressBar from 'progress';
import * as puppeteer from 'puppeteer';

import { VisualTestRunnerExpandedConfig } from './config';
import { chunk } from './helpers/array.helpers';
import { ensureDirectoryExists } from './helpers/fs.helpers';
import { compareImages, generateDiffImage } from './helpers/image-diff.helpers';
import { execute } from './helpers/shell.helpers';
import { ReportConfig, ReportConfigTest } from './report-config';

const glob = require('glob-promise');

export type ScreenshotPageFn = (page: puppeteer.Page) => Promise<Buffer>;

export interface Scenario {
  page: string;
  name: string;
  screenshotPage: ScreenshotPageFn;

  // result info
  pass?: boolean;
  error?: string;
}

const scenarios: Scenario[] = [];

export function describePage(page: string, defineScenarios: (defineScenario: (name: string, setupPage: ScreenshotPageFn) => void) => void) {
  defineScenarios((name, screenshotPage) => {
    if (scenarios.find(s => s.page === page && s.name === name)) {
      scenarios.push({ page, name, screenshotPage, pass: false, error: `duplicate scenario: ${page}: ${name}` });
    } else {
      scenarios.push({ page, name, screenshotPage });
    }
  });
}

export async function runVisualTests(config: VisualTestRunnerExpandedConfig) {
  console.log('getting scenarios...');
  const specFilePaths = (await glob(config.specFileGlobPath, { cwd: config.projectPath })).map((specFilePath: string) =>
    path.resolve(path.join(config.projectPath, specFilePath))
  );

  for (const specFilePath of specFilePaths) {
    const relativeSpecFilePath = path.relative(__dirname, specFilePath);

    require(relativeSpecFilePath);
  }

  const pendingScenarios = scenarios.filter(scenario => scenario.pass === undefined);

  if (pendingScenarios.length) {
    console.log('launching browser...');
    const browser = await puppeteer.launch();

    try {
      console.log(`running ${pendingScenarios.length} scenarios...`);
      await runScenarios(config, browser, pendingScenarios);
    } finally {
      console.log('closing browser...');
      await browser.close();
    }
  }

  console.log('');
  console.log('generating report...');
  await generateReport(config);

  console.log('');
  console.log('finishing up...');
  const unmatchedReferenceScreenshots = checkForUnmatchedScreenshots(config);

  return !unmatchedReferenceScreenshots && scenarios.every(scenario => scenario.pass);
}

async function runScenarios(config: VisualTestRunnerExpandedConfig, browser: puppeteer.Browser, pendingScenarios: Scenario[]) {
  const progressBar = new ProgressBar('[:bar] :percent', { total: scenarios.length, width: process.stdout.columns - 10 });
  progressBar.render();

  for (const set of chunk(pendingScenarios, 5)) {
    await Promise.all(
      set.map(scenario =>
        (async () => {
          try {
            await runScenario(config, browser, scenario);
          } catch (error) {
            scenario.pass = false;
            scenario.error = `error running scenario: ${error.toString()}`;
          }

          progressBar.tick();
        })()
      )
    );
  }
}

async function runScenario(config: VisualTestRunnerExpandedConfig, browser: puppeteer.Browser, scenario: Scenario) {
  const page = await browser.newPage();
  let testScreenshotBuffer: Buffer;

  try {
    testScreenshotBuffer = await scenario.screenshotPage(page);
  } catch (error) {
    scenario.pass = false;
    scenario.error = `error taking test screenshot: ${error.toString()}`;
  } finally {
    await page.close();
  }

  const { referenceFilePath, testScreenshotFilePath, diffFilePath } = getImageFilePaths(config, scenario);

  ensureDirectoryExists(testScreenshotFilePath);
  fs.writeFileSync(testScreenshotFilePath, testScreenshotBuffer);

  const referenceFileExists = fs.existsSync(referenceFilePath);

  if (referenceFileExists) {
    scenario.pass = await compareImages(referenceFilePath, testScreenshotFilePath);

    if (scenario.pass === false) {
      ensureDirectoryExists(diffFilePath);
      await generateDiffImage(referenceFilePath, testScreenshotFilePath, diffFilePath);
    }
  } else {
    scenario.pass = false;
    scenario.error = `Reference file (${referenceFilePath}) does not exist.`;
  }
}

async function generateReport(config: VisualTestRunnerExpandedConfig) {
  for (const scenario of scenarios) {
    const label = `${scenario.page}: ${scenario.name}`;
    const result = scenario.pass ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(`  ${label} --> ${result}`);
  }

  const reportConfig: ReportConfig = {
    id: '',
    testSuite: '',
    tests: scenarios.map(scenario => {
      const { referenceFilePath, testScreenshotFilePath, diffFilePath } = getImageFilePaths(config, scenario);

      const test: ReportConfigTest = {
        status: scenario.pass ? 'pass' : 'fail',
        pair: {
          fileName: path.basename(referenceFilePath),
          label: `${scenario.page}: ${scenario.name}`,
          reference: path.relative(config.reportPath, referenceFilePath),
          test: path.relative(config.reportPath, testScreenshotFilePath),
          diffImage: scenario.pass ? undefined : path.relative(config.reportPath, diffFilePath),
          error: scenario.error
        }
      };

      return test;
    })
  };

  ensureDirectoryExists(config.reportPath);
  await execute(`ncp ${__dirname}/assets/report-template ${config.reportPath}`);
  fs.writeFileSync(`${config.reportPath}/config.js`, `report(${JSON.stringify(reportConfig)})`);
}

function checkForUnmatchedScreenshots(config: VisualTestRunnerExpandedConfig) {
  const referenceScreenshotFilenames = fs.existsSync(config.referenceScreenshotsPath)
    ? fs.readdirSync(config.referenceScreenshotsPath)
    : [];
  const matchedReferenceScreenshotFilenames = scenarios.map(scenario =>
    path.basename(getImageFilePaths(config, scenario).referenceFilePath)
  );

  const unmatchedReferenceScreenshots = referenceScreenshotFilenames.filter(
    referenceScreenshot => !matchedReferenceScreenshotFilenames.includes(referenceScreenshot)
  );

  if (unmatchedReferenceScreenshots.length) {
    console.log('unmatched reference screenshots: ', unmatchedReferenceScreenshots);
  }

  return !!unmatchedReferenceScreenshots.length;
}

function getImageFilePaths(config: VisualTestRunnerExpandedConfig, scenario: Scenario) {
  const screenshotFilename = `${scenario.page} ${scenario.name}`.replace(/\s+/g, '-');

  return {
    referenceFilePath: path.resolve(config.referenceScreenshotsPath, `${screenshotFilename}.png`),
    testScreenshotFilePath: path.resolve(config.testScreenshotsPath, `${screenshotFilename}.png`),
    diffFilePath: path.resolve(config.testScreenshotDiffsPath, `${screenshotFilename}.png`)
  };
}
