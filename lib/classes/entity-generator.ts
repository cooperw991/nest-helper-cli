import * as R from 'ramda';
import * as fs from 'fs';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import {
  humpToLine,
  lineToHump,
  firstUpperCase,
} from '../utils/conversion.util';

export class EntityGenerator {
  constructor(json: EntityJsonInterface) {
    this.data = json;
    this.output = '';
  }

  private data;
  private output;

  public generateEntityFile(): void {
    this.output += this.writeTypeormDependencies();
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writeEnums();
    this.output += this.writeModel();
    fs.writeFileSync(
      process.cwd() + '/' + this.data.name + '.entity.ts',
      this.output,
    );
  }

  private writeTypeormDependencies(): string {
    const { columns } = this.data;

    let output = 'import {\n';

    const types = columns.map((col) => col.decorator);

    const decorators = R.uniq(types);

    for (const decorator of decorators) {
      output += `  ${decorator},\n`;
    }
    output += `  BeforeInsert,\n  BeforeUpdate,\n  Entity,\n} from 'typeorm';\n`;
    return output;
  }

  private writeTypeGraphqlDependencies(): string {
    const { columns, enums } = this.data;
    const decorators = ['Field', 'ID', 'ObjectType'];

    if (!R.isEmpty(enums)) {
      decorators.push('registerEnumType');
    }

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

  private writeEnums(): string {
    const { enums } = this.data;

    let output = '\n';

    for (const enumObj of enums) {
      output += `export enum ${enumObj.name} {\n`;
      for (const val of enumObj.values) {
        output += `  ${val.key} = '${val.val}',\n`;
      }
      output += `}\nregisterEnumType(${enumObj.name}, {\n  name: '${enumObj.name}',\n  description: '${enumObj.description}',\n});\n`;
    }

    return output;
  }

  private writeModel(): string {
    const { columns, name, prefix, isSoftDelete } = this.data;

    let output = '\n@ObjectType()\n';

    const tableName = prefix + humpToLine(name);
    const entityName = firstUpperCase(lineToHump(name));

    output += `@Entity('${tableName}')\nexport class ${entityName} {\n`;

    for (const col of columns) {
      let gqlType = '';
      const { options } = col;

      switch (true) {
        case col.decorator === 'PrimaryGeneratedColumn':
          gqlType = 'ID';
          break;
        case col.type === 'number':
          gqlType = col.options.type === 'integer' ? 'Int' : 'Number';
          break;
        default:
          gqlType = firstUpperCase(col.type);
      }
      output += `  @Field(() => ${gqlType}, {\n    description: '${col.options.comment}',\n  })\n`;

      output += `  @${col.decorator}(`;

      if (!R.isEmpty(options)) {
        // const optionsStr = JSON.stringify(options).replace(/\"/g, "'");

        output += '{\n';
        for (const optKey in options) {
          const value =
            R.type(options[optKey]) === 'String'
              ? `'${options[optKey]}'`
              : options[optKey];
          output += `    ${optKey}: ${value},\n`;
        }
        output += '  }';
      }

      output += `)\n  ${col.name}: ${col.type};\n\n`;
    }

    if (isSoftDelete) {
      output += '  @Column({ default: false }) deleted: boolean;\n';
    }

    output += `  @Field(() => Int)\n  @Column({ type: 'bigint', width: 11 })\n  createdAt: number;\n\n  @Field(() => Int)\n  @Column({ type: 'bigint', width: 11 })\n  updatedAt: number;\n\n  @BeforeInsert()\n  updateDateCreation() {\n    this.createdAt = Date.parse(new Date() + '') / 1000;\n    this.updatedAt = Date.parse(new Date() + '') / 1000;\n  }\n\n  @BeforeUpdate()\n  updateDateUpdate() {\n    this.updatedAt = Date.parse(new Date() + '') / 1000;\n  }\n}\n`;

    return output;
  }
}
