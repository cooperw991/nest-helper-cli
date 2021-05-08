import * as R from 'ramda';
import * as inflected from 'inflected';

import {
  EntityJsonInterface,
  EntityJsonColumnInterface,
} from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class FilterInterfaceGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'interface';
    this.pickColumns();
    this.output = '';
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writeEntityDependency();
    this.output += this.writeInputs();
  }

  private columns: EntityJsonColumnInterface[];

  public generateFile() {
    this.writeFile('filterby-' + this.moduleName, 'interfaces');
  }

  private pickColumns() {
    const { columns } = this.data;
    this.columns = [];

    for (const col of columns) {
      if (R.has('api')(col) && col.api.filter) {
        this.columns.push(col);
      }
    }
  }

  private writeTypeGraphqlDependencies(): string {
    const { columns } = this;
    const decorators = ['Field', 'InputType'];

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
    return output.replace(/,$/gi, ` } from 'type-graphql';\n\n`);
  }

  private writeEntityDependency(): string {
    const {
      columns,
      data: { enums },
    } = this;

    const enumDecorators = enums.map((enu) => {
      return enu.name;
    });

    const columnDecorators = columns.map((col) => {
      return col.type;
    });

    let output = '';

    for (const decorator of enumDecorators) {
      if (R.contains(decorator, columnDecorators)) {
        output += ` ${decorator},`;
      }
    }

    if (output === '') {
      return '';
    }

    output = 'import {' + output;
    return output.replace(
      /,$/gi,
      ` } from '../${this.moduleName}.entity';\n\n`,
    );
  }

  private writeInputs(): string {
    const { uppperCamelPluralizeName, columns } = this;

    let output = `@InputType()\nexport class ${uppperCamelPluralizeName}Filter {\n`;

    for (const col of columns) {
      let gqlType = '';
      const { options } = col;

      switch (true) {
        case col.decorator === 'PrimaryGeneratedColumn':
          gqlType = 'Int';
          break;
        case col.type === 'number':
          gqlType = options?.type === 'integer' ? 'Int' : 'Number';
          break;
        default:
          gqlType = inflected.classify(col.type);
      }

      let isArray = '';

      if (col.options?.array) {
        gqlType = `[${gqlType}]`;
        isArray = '[]';
      }

      output += `  @Field(() => ${gqlType}, { nullable: true })\n`;

      output += `  ${col.name}: ${col.type}${isArray};\n\n`;
    }

    return output.replace(/\n$/gi, '}\n');
  }
}
