#! /usr/bin/env node

import chalk from 'chalk';
import * as tsNode from 'ts-node';
import * as yargs from 'yargs';

import { getConfig } from './config';
import { execute } from './helpers/shell.helpers';
import { runVisualTests } from './visual-test-runner';

const version = require('./../package.json').version;

interface Options {
  config: string;
}

const defaultConfigFilename = 'visual-test-runner.json';

tsNode.register();

// tslint:disable-next-line:no-unused-expression
yargs
  .version(version)
  .command('test', 'run tests', () => undefined, args => test(args as any))
  .command('approve', 'approve test screenshots', () => undefined, args => approve(args as any)).argv;

async function test(options: Options) {
  const config = getConfig(options.config || defaultConfigFilename);
  let pass: boolean;

  try {
    await execute(`rimraf ${config.temporaryTestDataPath}`);

    console.log();
    console.log(chalk.green('starting tests...'));
    pass = await runVisualTests(config);
  } catch (error) {
    console.error();
    console.error(`Fatal Error: ${error.stack || error.toString()}`);
    process.exit(1);
  }

  if (pass) {
    console.log();
    console.log(chalk.green('Visual regression test passed!'));
    process.exit(0);
  } else {
    await execute(`opn ${config.reportPath}/index.html`);

    console.log();
    console.log(chalk.red('Visual regression test failed!'));
    console.log(`Review the report and run '${chalk.gray(config.approveCommand)}' if the changes were intended.`);
    console.log('');
    process.exit(1);
  }
}

async function approve(options: Options) {
  const config = getConfig(options.config || defaultConfigFilename);

  await execute(`rimraf ${config.referenceScreenshotsPath}`);
  await execute(`ncp ${config.testScreenshotsPath} ${config.referenceScreenshotsPath}`);

  console.log();
  console.log(chalk.green('Reference screenshots updated! Please commit the updated images with your code changes.'));
  process.exit(0);
}
