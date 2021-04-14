import * as R from 'ramda';
import * as inflected from 'inflected';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';

export class EntityGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'entity';
    this.output += this.writeTypeormDependencies();
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writeEnums();
    this.output += this.writeColumns();
  }

  public generateFile() {
    this.writeFile(this.moduleName);
  }

  private writeTypeormDependencies(): string {
    const { columns } = this.data;

    let output = 'import {\n';

    const types = columns.map((col) => col.decorator ?? 'Column');

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

  private writeColumns(): string {
    const { columns, isSoftDelete } = this.data;

    let output = '\n@ObjectType()\n';

    output += `@Entity('${this.tableName}')\nexport class ${this.className} {\n`;

    for (const col of columns) {
      let gqlType = '';
      const { options } = col;

      if (!R.has('api')(col) || col.api.view) {
        switch (true) {
          case col.decorator === 'PrimaryGeneratedColumn':
            gqlType = 'ID';
            break;
          case col.type === 'number':
            gqlType = col.options.type === 'integer' ? 'Int' : 'Number';
            break;
          default:
            gqlType = inflected.classify(col.type);
        }

        if (R.has('options')(col) && col.options.array) {
          gqlType = `[${gqlType}]`;
        }

        output += `  @Field(() => ${gqlType}, {\n    description: '${col.options.comment}',\n`;

        if (col.options && col.options.nullable) {
          output += `    nullable: true,\n`;
        }

        output += `  })\n`;
      }

      const decorator = col.decorator ?? 'Column';

      output += `  @${decorator}(`;

      let isArray = '';

      if (!R.isEmpty(options)) {
        output += '{\n';
        for (const optKey in options) {
          const value =
            R.type(options[optKey]) === 'String'
              ? `'${options[optKey]}'`
              : options[optKey];
          output += `    ${optKey}: ${value},\n`;
        }
        output += '  }';
        if (options.array) {
          isArray = '[]';
        }
      }

      output += `)\n  ${col.name}: ${col.type}${isArray};\n\n`;
    }

    if (isSoftDelete) {
      output += '  @Column({ default: false }) deleted: boolean;\n';
    }

    output += `  @Column() createdById: number;\n\n  @Column({ nullable: true }) updatedById: number;\n\n  @Field(() => Int)\n  @Column({ type: 'bigint', width: 11 })\n  createdAt: number;\n\n  @Field(() => Int)\n  @Column({ type: 'bigint', width: 11 })\n  updatedAt: number;\n\n  @BeforeInsert()\n  updateDateCreation() {\n    this.createdAt = Date.parse(new Date() + '') / 1000;\n    this.updatedAt = Date.parse(new Date() + '') / 1000;\n  }\n\n  @BeforeUpdate()\n  updateDateUpdate() {\n    this.updatedAt = Date.parse(new Date() + '') / 1000;\n  }\n}\n`;

    return output;
  }
}
