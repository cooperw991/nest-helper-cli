import * as R from 'ramda';

import {
  humpToDash,
  lineToHump,
  firstUpperCase,
} from '../utils/conversion.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';

export class CreateInterfaceGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'interface';
    this.output = '';
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writeEntityDependency();
    this.output += this.writeInputs();
  }

  public generateFiles() {
    this.writeFile('create-' + humpToDash(this.data.name), 'interfaces');
  }

  private writeTypeGraphqlDependencies(): string {
    const { columns } = this.data;
    const decorators = ['Field', 'ID', 'InputType'];

    for (const col of columns) {
      if (col.type === 'number' && col.options.type === 'integer') {
        decorators.push('Int');
        break;
      }
    }

    let output = 'import {';

    for (const decorator of decorators) {
      output += ` ${decorator},`;
    }
    return output.replace(/,$/gi, ` } from 'type-graphql';\n`);
  }

  private writeEntityDependency(): string {
    const {
      className,
      data: { enums, name },
    } = this;

    const enumDecorators = enums.map((enu) => {
      return firstUpperCase(lineToHump(enu.name));
    });

    let output = 'import {';

    for (const decorator of enumDecorators) {
      output += ` ${decorator},`;
    }
    return output.replace(/,$/gi, ` } from '../${humpToDash(name)}.entity';\n`);
  }

  private writeInputs(): string {
    const {
      className,
      data: { columns },
    } = this;

    let output = `\n@InputType()\nexport class ${className}Input {\n`;

    for (const col of columns) {
      let gqlType = '';
      const { options } = col;

      if (!R.has('api')(col) || col.api.create) {
        switch (true) {
          case col.decorator === 'PrimaryGeneratedColumn':
            gqlType = 'Int';
            break;
          case col.type === 'number':
            gqlType = options?.type === 'integer' ? 'Int' : 'Number';
            break;
          default:
            gqlType = firstUpperCase(col.type);
        }

        let isArray = '';

        if (col.options?.array) {
          gqlType = `[${gqlType}]`;
          isArray = '[]';
        }

        output += `  @Field(() => ${gqlType}, {\n    description: '${options.comment}',\n`;

        if (options && options.nullable) {
          output += `    nullable: true,\n`;
        }

        output += `  })\n  ${col.name}: ${col.type}${isArray};\n\n`;
      }
    }

    return output.replace(/\n$/gi, '}\n');
  }
}
