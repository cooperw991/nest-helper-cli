import * as R from 'ramda';
import * as inflected from 'inflected';

import { FileGenerator } from './file-generator';

export class FindOrderGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][], models: string[]) {
    super(modelName, modelLines);
    this.suffix = 'input';
    this.models = models;

    this.output =
      this.writeDependencies() +
      this.writeEnum() +
      this.writeRegister() +
      this.writeClass();
  }

  public async generateFile() {
    await this.writeFile('dto/find-order');
  }

  private writeDependencies(): string {
    const output = `import { InputType, Field, registerEnumType } from '@nestjs/graphql';\n\n`;

    return output;
  }

  private writeEnum(): string {
    const { data, uppperCamelPluralizeName } = this;

    let output = `export enum ${uppperCamelPluralizeName}FindOrderKeys {\n`;

    for (const line of data) {
      output += this.writeField(line);
    }

    output += '}\n\n';

    return output;
  }

  private writeRegister(): string {
    const { uppperCamelPluralizeName } = this;

    const output = `registerEnumType(${uppperCamelPluralizeName}FindOrderKeys, {\n  name: '${uppperCamelPluralizeName}FindOrderKeys',\n  description: '${uppperCamelPluralizeName}FindOrderKeys',\n});\n\n`;

    return output;
  }

  private writeClass(): string {
    const { uppperCamelPluralizeName } = this;

    let output = `@InputType()\nexport class ${uppperCamelPluralizeName}FindOrder {\n`;

    output += `  @Field(() => ${uppperCamelPluralizeName}FindOrderKeys)\n  by: ${uppperCamelPluralizeName}FindOrderKeys;\n\n  @Field(() => Boolean)\n  asc: boolean;\n`;

    output += '}\n';

    return output;
  }

  private writeField(keywords: string[]): string {
    const fieldName = keywords[0];
    let type = keywords[1];

    if (fieldName.indexOf('@') !== -1) {
      return '';
    }

    if (R.includes(fieldName, ['id', 'deletedAt'])) {
      return '';
    }

    if (type.indexOf('?') !== -1) {
      type = R.dropLast(1, type);
    }

    if (type.indexOf('[]') !== -1) {
      return '';
    }

    if (R.includes(type, this.models)) {
      return '';
    }

    const keyName = inflected.underscore(fieldName).toUpperCase();

    const output = `  ${keyName} = '${fieldName}',\n`;

    return output;
  }
}
