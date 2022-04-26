#! /usr/bin/env node
import { Command } from 'commander';

import { GenerateCommand } from '../commands/generate.command';
import { GenerateAction } from '../actions/generate.action';

const bootstrap = () => {
  const program = new Command();
  program
    .version(
      require('../package.json').version,
      '-v, --version',
      'Output the current version.',
    )
    .usage('<command> [options]')
    .helpOption('-h, --help', 'Output usage information.');

  new GenerateCommand(new GenerateAction()).load(program);
};

bootstrap();
