import * as path from 'path';

import { readTextFile } from './helpers/fs.helpers';

export interface VisualTestRunnerConfig {
  referenceScreenshotsPath: string;
  temporaryTestDataPath: string;
  specFileGlobPath: string;
  approveCommand: string;
}

export interface VisualTestRunnerExpandedConfig {
  projectPath: string;
  approveCommand: string;
  specFileGlobPath: string;
  referenceScreenshotsPath: string;
  temporaryTestDataPath: string;
  testScreenshotsPath: string;
  testScreenshotDiffsPath: string;
  reportPath: string;
}

export const defaultConfig: VisualTestRunnerConfig = {
  referenceScreenshotsPath: './visual-test-data/reference-screenshots',
  temporaryTestDataPath: './visual-test-data/tmp',
  specFileGlobPath: '',
  approveCommand: 'visual-test-runner --approve'
};

export function getConfig(configPath: string) {
  const rawConfig: VisualTestRunnerConfig = { ...defaultConfig, ...JSON.parse(readTextFile(configPath)) };

  const projectPath = path.dirname(path.resolve(configPath));

  const config: VisualTestRunnerExpandedConfig = {
    projectPath,
    approveCommand: rawConfig.approveCommand,
    specFileGlobPath: rawConfig.specFileGlobPath,
    referenceScreenshotsPath: path.resolve(projectPath, rawConfig.referenceScreenshotsPath),
    temporaryTestDataPath: path.resolve(projectPath, rawConfig.temporaryTestDataPath),
    testScreenshotsPath: path.resolve(projectPath, rawConfig.temporaryTestDataPath, 'test-screenshots'),
    testScreenshotDiffsPath: path.resolve(projectPath, rawConfig.temporaryTestDataPath, 'test-screenshot-diffs'),
    reportPath: path.resolve(projectPath, rawConfig.temporaryTestDataPath, 'report')
  };

  return config;
}
