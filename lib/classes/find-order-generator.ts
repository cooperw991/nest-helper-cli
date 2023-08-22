import * as R from 'ramda';
import * as inflected from 'inflected';

import { FileGenerator } from './file-generator';
import {
  DataType,
  ModelProperty,
} from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class FindOrderGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'input';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeEnumDependencies();
    this.output += this.writeFindOrderlass();
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('dto/find-order', ifReplace);
  }

  private writeGqlDependencies(): string {
    return `import { Field, InputType, registerEnumType } from '@nestjs/graphql';\n\n`;
  }

  private writeEnumDependencies(): string {
    const { properties } = this;
    let output = `export enum ${this.className}FindOrderKeys {\n`;

    for (const property of properties) {
      output += this.writeField(property);
    }

    output += `}\n\n`;
    output += `registerEnumType(${this.className}FindOrderKeys, {\n  name: '${this.className}FindOrderKeys',\n  description: 'Enum Of ${this.className} Orders',\n});\n\n`;

    return output;
  }

  private writeFindOrderlass(): string {
    let output = `@InputType({\n  description: 'Orders For ${this.uppperCamelPluralizeName} Querying',\n})\n`;
    output += `export class ${this.className}FindOrder {\n  @Field(() => ${this.className}FindOrderKeys)\n  by: ${this.className}FindOrderKeys;\n\n  @Field(() => Boolean)\n  asc: boolean;\n}\n`;

    return output;
  }

  private writeField(property: ModelProperty): string {
    const { key, type, isArray } = property;

    if (
      R.includes(key, ['deletedAt']) ||
      type === DataType.Relation ||
      isArray
    ) {
      return '';
    }

    const keyConst = inflected.underscore(key).toUpperCase();

    return `  ${keyConst} = '${key}',\n`;
  }
}
