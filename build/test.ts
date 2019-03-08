import * as path from 'path';

import { execute } from './../src/helpers/shell.helpers';
import { parseFlags } from './helpers/utility.helpers';

interface Options {
  unit: boolean;
  e2e: boolean;
}

const defaultOptionsFn = (args: Options) => ({
  unit: !args.e2e,
  e2e: !args.unit
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);
const coveragePath = path.resolve(path.join(__dirname, './../coverage'));

(async () => {
  await execute('rimraf ./dist-spec ./coverage');

  await execute('tsc --project ./tsconfig.spec.json');
  await execute('ncp ./src/assets ./dist-spec/assets');

  if (options.unit) {
    await unitTest();
  }

  if (options.e2e) {
    // await e2eTest();
  }

  await execute('istanbul report -t lcov');
  await execute('istanbul report -t text-summary');
  // await execute('istanbul check-coverage --statements 90 --branches 90 --functions 90 --lines 90');
})();

async function unitTest() {
  await execute(getTestCommand('unit', './node_modules/jasmine/bin/jasmine.js', '--config=jasmine.json'));
  await execute(getRemapCoverageCommand('unit'));
}

// async function e2eTest() {
//   await execute(getTestCommand('e2e', './dist-spec/visual-test-runner-cli.js', 'test --config ./test-project/visual-test-runner.json'));
//   await execute(getRemapCoverageCommand('e2e'));
//   // verify that the e2e test did what you expect
// }

function getTestCommand(testSet: string, script: string, args: string) {
  const testSetCoveragePath = path.join(coveragePath, testSet);
  return `istanbul cover ${script} --dir ${testSetCoveragePath} --print none -- ${args}`;
}

function getRemapCoverageCommand(testSet: string) {
  const testSetCoverageJsonPath = path.join(coveragePath, testSet, 'coverage.json');
  return `remap-istanbul -i ${testSetCoverageJsonPath} -o ${testSetCoverageJsonPath} -t json`;
}
