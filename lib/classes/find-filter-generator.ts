import * as R from 'ramda';

import { FileGenerator } from './file-generator';
import {
  DataType,
  ModelProperty,
} from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class FindFilterGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'input';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeEnumDependencies();
    this.output += this.writeFindFilterClass();
  }

  public async generateFile() {
    await this.writeFile('dto/find-filter');
  }

  private writeGqlDependencies(): string {
    const { gqlTypes } = this;
    const gqlTypeStr = [...new Set(gqlTypes)].join(', ');
    if (gqlTypeStr.length) {
      return `import { Field, InputType, ${gqlTypeStr} } from '@nestjs/graphql';\n\n`;
    } else {
      return `import { Field, InputType } from '@nestjs/graphql';\n\n`;
    }
  }

  private writeEnumDependencies(): string {
    const { enumRelations } = this;
    if (!enumRelations.length) {
      return '';
    }

    const enumStr = enumRelations.join(', ');
    return `import { ${enumStr} } from '@prisma/client';\n\n`;
  }

  private writeFindFilterClass(): string {
    const { properties } = this;

    let output = `@InputType({\n  description: '',\n})\n`;
    output += `export class ${this.className}FindFilter {\n`;

    for (const property of properties) {
      output += this.writeField(property);
    }

    output = R.dropLast(1, output);
    output += '}\n';
    return output;
  }

  private writeField(property: ModelProperty): string {
    const { key, type, gqlType, tsType, isArray } = property;

    if (
      R.includes(key, ['deletedAt']) ||
      type === DataType.Relation ||
      isArray
    ) {
      return '';
    }

    const gqlTypeStr = gqlType;
    const tsTypeStr = `${tsType} | null`;

    const keyNameStr = key;

    const output = `  @Field(() => ${gqlTypeStr}, {\n    description: '',\n    nullable: true,\n  })\n  ${keyNameStr}: ${tsTypeStr};\n\n`;

    return output;
  }
}
