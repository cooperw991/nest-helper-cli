import chalk from 'chalk';
import { Command } from 'commander';

import { Input } from '../lib/inputs';
import { AbstractCommand } from './abstract.command';

interface Schematic {
  name: string;
  alias: string;
  description: string;
}

export class GenerateCommand extends AbstractCommand {
  private schematics: Schematic[] = [
    {
      name: 'module',
      alias: 'mo',
      description: 'Generate whole files of module',
    },
    {
      name: 'model',
      alias: 'mod',
      description: 'Generate the model file',
    },
    {
      name: 'service',
      alias: 's',
      description: 'Generate the service file',
    },
    {
      name: 'resolver',
      alias: 'r',
      description: 'Generate the resolver file',
    },
    {
      name: 'dto',
      alias: 'd',
      description: 'Generate the files of dto',
    },
  ];

  public load(program: Command) {
    program
      .command('generate')
      .alias('g')
      .argument('<schematic>', 'string argument')
      .argument('[name]', 'string argument')
      .option('-r, --replace <r]', 'Replace exising files')
      .description(this.buildDescription())
      .action(async (schematic: string, name: string) => {
        const options = program.opts();
        const inputs: Input[] = [];
        const opts: Input[] = [];
        inputs.push({ name: 'schematic', value: schematic });
        inputs.push({ name: 'name', value: name });
        for (const opt in options) {
          opts.push({ name: opt, value: options[opt] });
        }
        await this.action.handle(inputs, opts);
      });
    program.parse(process.argv);
  }

  private buildDescription(): string {
    return (
      'Generate a Nest module.\n' +
      'Available schematics:\n' +
      this.buildSchematicsListAsTable()
    );
  }

  private buildSchematicsListAsTable(): string {
    const leftMargin = '    ';
    const tableConfig = {
      head: ['name', 'alias', 'description'],
      chars: {
        left: leftMargin.concat('│'),
        'top-left': leftMargin.concat('┌'),
        'bottom-left': leftMargin.concat('└'),
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
      },
    };
    const Table = require('cli-table3');
    const table: any = new Table(tableConfig);
    for (const schematic of this.schematics) {
      table.push([
        chalk.green(schematic.name),
        chalk.cyan(schematic.alias),
        schematic.description,
      ]);
    }
    return table.toString();
  }
}
