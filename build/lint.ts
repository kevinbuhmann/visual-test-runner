import { execute } from './../src/helpers/shell.helpers';
import { parseFlags } from './helpers/utility.helpers';

const defaultOptionsFn = () => ({
  prettier: true,
  tslint: true,
  fix: false
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

(async () => {
  if (options.prettier) {
    await runFormatter(`prettier --config ./prettier.json ./**/*.ts`, '--write', '--list-different', options.fix);
    await runFormatter(`prettier --config ./prettier.json ./**/*.json`, '--write', '--list-different', options.fix);
    await runFormatter(`prettier --config ./prettier.json ./**/*.yml`, '--write', '--list-different', options.fix);
  }

  if (options.tslint) {
    await execute(`tslint --project ./tsconfig.lint.json ${options.fix ? '--fix' : ''}`);
  }
})();

async function runFormatter(command: string, writeArg: string, listDifferentArg: string, fix: boolean) {
  if (fix) {
    do {
      await execute(`${command} ${writeArg}`);
    } while ((await execute(`${command} ${listDifferentArg}`, {}, false)).code !== 0);
  } else {
    await execute(`${command} ${listDifferentArg}`);
  }
}
