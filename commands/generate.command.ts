import * as chalk from 'chalk';
import * as Table from 'cli-table3';
import { CommanderStatic } from 'commander';

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
      name: 'json',
      alias: 'json',
      description: 'Generate a sample json',
    },
    {
      name: 'module',
      alias: 'mo',
      description: 'Generate a new module',
    },
  ];

  public load(program: CommanderStatic) {
    program
      .command('generate <schematic> [name]')
      .alias('g')
      .description(this.buildDescription())
      .action(async (schematic: string, name: string) => {
        const inputs: Input[] = [];
        inputs.push({ name: 'schematic', value: schematic });
        inputs.push({ name: 'name', value: name });
        await this.action.handle(inputs, []);
      });
    program.parse(process.argv);
  }

  private buildDescription(): string {
    return (
      'Generate a Nest module.\n' +
      '  Available schematics:\n' +
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
