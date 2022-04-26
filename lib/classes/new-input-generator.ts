import * as R from 'ramda';

import { EnumObject } from '../interfaces/model-enum.interface';
import { FileGenerator } from './file-generator';

export class NewInputGenerator extends FileGenerator {
  constructor(
    modelName: string,
    modelLines: string[][],
    enumObjects: EnumObject[],
  ) {
    super(modelName, modelLines);
    this.suffix = 'input';
    this.output += this.writeClass();
    this.enumObjects = enumObjects;

    if (this.enumObjects.length) {
      this.output = this.writeEnumDependencies() + this.output;
    }
    this.output = this.writeDependencies() + this.output;
  }

  public generateFile() {
    this.writeFile('dto/new-' + this.moduleName);
  }

  private writeDependencies(): string {
    const output = `import { InputType, Field } from '@nestjs/graphql';\n\n`;

    return output;
  }

  private writeEnumDependencies(): string {
    const { enumObjects } = this;
    let output = `import {`;

    for (const enu of enumObjects) {
      output += ` ${enu.name},`;
    }

    output = R.dropLast(1, output) + ` } from '@prisma/client';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { modelName, data } = this;

    let output = `@InputType()\nexport class New${modelName}Input {\n`;

    for (const line of data) {
      output += this.writeField(line);
    }

    output = R.dropLast(1, output);
    output += '}\n';

    return output;
  }

  private writeField(keywords: string[]): string {
    const fieldName = keywords[0];
    let type = keywords[1];
    let isOptional = false;
    let isArray = false;

    if (fieldName.indexOf('@') !== -1) {
      return '';
    }

    if (R.includes(fieldName, ['id', 'createdAt', 'updatedAt', 'deletedAt'])) {
      return '';
    }

    if (type.indexOf('?') !== -1) {
      type = R.dropLast(1, type);
      isOptional = true;
    }

    if (type.indexOf('[]') !== -1) {
      type = R.dropLast(2, type);
      isArray = true;
    }

    const [gqlType, fieldType] = this.parseFieldType(type, keywords);

    let output = isArray
      ? `  @Field(() => [${gqlType}]`
      : `  @Field(() => ${gqlType}`;

    output += isOptional ? `, {\n    nullable: true,\n  })\n` : ')\n';

    output += `  ${fieldName}${isOptional ? '?' : ''}: ${fieldType}${
      isArray ? '[]' : ''
    };\n\n`;

    return output;
  }
}
