import * as R from 'ramda';
import { p2, p4 } from '../utils/pad.util';

import { FileGenerator } from './file-generator';
import {
  DataType,
  ModelProperty,
} from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import { WriteDependencies } from './helpers/write-dependencies';

export class FindFilterGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'input';
    this.models = params.models;
    this.output += this.writeFindFilterClass();

    this.output =
      WriteDependencies.writeEnumDependencies(this.enumRelations) + this.output;

    this.output =
      WriteDependencies.writeGqlDependencies(
        this.gqlTypes,
        this.classValidators,
      ) + this.output;
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('dto/find-filter', ifReplace);
  }

  private writeFindFilterClass(): string {
    const { properties } = this;

    let output = `@InputType({\n${p2}description: 'Params For Filtering ${this.uppperCamelPluralizeName}',\n})\n`;
    output += `export class ${this.className}FindFilter {\n`;

    for (const property of properties) {
      output += this.writeField(property);
    }

    output = R.dropLast(1, output);
    output += '}\n';
    return output;
  }

  private writeField(property: ModelProperty): string {
    const { enumRelations } = this;
    const { key, type, gqlType, tsType, isArray } = property;

    if (
      R.includes(key, ['deletedAt']) ||
      type === DataType.Relation ||
      isArray
    ) {
      return '';
    }

    if (type === DataType.DateTime) {
      const gqlTypeStr = gqlType;
      const tsTypeStr = `${tsType}`;

      const keyNameStr = key;

      let output = `${p2}@Field(() => ${gqlTypeStr}, {\n${p4}description: '',\n${p4}nullable: true,\n${p2}})\n${p2}@IsDate()\n${p2}@ValidateIf((_, value) => value)\n${p2}${keyNameStr}_LTE_DATE?: ${tsTypeStr};\n\n`;

      output += `${p2}@Field(() => ${gqlTypeStr}, {\n${p4}description: '',\n${p4}nullable: true,\n${p2}})\n${p2}@IsDate()\n${p2}@ValidateIf((_, value) => value)\n${p2}${keyNameStr}_GTE_DATE?: ${tsTypeStr};\n\n`;

      this.classValidators.push('IsDate');
      this.classValidators.push('ValidateIf');

      return output;
    }

    const gqlTypeStr = gqlType;
    const tsTypeStr = `${tsType} | null`;

    const keyNameStr = R.includes(tsType, enumRelations) ? `${key}_EQ` : key;

    let output = `${p2}@Field(() => ${gqlTypeStr}, {\n${p4}description: '',\n${p4}nullable: true,\n${p2}})\n`;

    if (type === DataType.Money) {
      output += `${p2}@Max(9999999999999)\n${p2}@Min(-9999999999999)\n${p2}@ValidateIf((_, value) => value)\n`;
      this.classValidators.push('Max');
      this.classValidators.push('Min');

      this.classValidators.push('ValidateIf');
    }

    if (type === DataType.BigInt) {
      output += `${p2}@Max(999999999999999)\n${p2}@Min(-999999999999999)\n${p2}@IsInt()\n${p2}@ValidateIf((_, value) => value)\n`;
      this.classValidators.push('Max');
      this.classValidators.push('Min');
      this.classValidators.push('IsInt');
      this.classValidators.push('ValidateIf');
    }

    output += `${p2}${keyNameStr}?: ${tsTypeStr};\n\n`;

    return output;
  }
}
