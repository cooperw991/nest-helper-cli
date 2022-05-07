import * as R from 'ramda';

import { FileGenerator } from './file-generator';

import { EnumObject } from '../interfaces/model-enum.interface';

export class MocksGenerator extends FileGenerator {
  constructor(
    modelName: string,
    modelLines: string[][],
    enumObjects: EnumObject[],
  ) {
    super(modelName, modelLines);
    this.suffix = 'fake';
    this.enumObjects = enumObjects;

    let output = this.writeDependences();
    output += this.writeInterfaces();
    output += this.writeInputData();
    output += this.writeModelData();

    this.output = output;
  }

  public async generateFile() {
    await this.writeFile('fake/' + this.moduleName);
  }

  private rdmArr(str: string): string {
    return 'faker.random.arrayElement(' + str + ')';
  }

  private rdmNum(str = ''): string {
    return 'faker.datatype.number(' + str + ')';
  }

  private rdmStr(): string {
    return 'faker.lorem.words()';
  }

  private rdmBool(): string {
    return 'faker.random.boolean()';
  }

  private rdmNumberic(str = ''): string {
    return 'faker.random.numeric(' + str + ')';
  }

  private rdmFloat(str = ''): string {
    return 'faker.random.float(' + str + ')';
  }

  private rdmDate(str = ''): string {
    return 'faker.date.future(' + str + ')';
  }

  private rdmEnum(enumName: string): string {
    const { enumObjects } = this;

    const _enum = enumObjects.find((enu) => enu.name === enumName);

    if (!_enum) {
      return '';
    }

    let values = _enum.values.reduce((prev, curr) => {
      return prev + `${_enum.name}.${curr}, `;
    }, '');

    values = R.dropLast(2, values);
    return 'faker.random.arrayElement([' + values + '])';
  }

  private writeDependences(): string {
    const output = `import { faker } from '@faker-js/faker';\n\n`;

    return output;
  }

  private writeInputData(): string {
    const { modelName, data } = this;
    let output1 = `export const new${modelName}Input = {\n`;
    let output2 = `export const edit${modelName}Input = {\n`;

    for (const line of data) {
      const field = line[0];
      let type = line[1];
      if (field.indexOf('@') !== -1) {
        continue;
      }

      if (
        R.includes(field, [
          'id',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'creatorId',
          'modifierId',
        ])
      ) {
        continue;
      }

      if (type.indexOf('?') !== -1) {
        type = R.dropLast(1, type);
      }
      const mockVal = this.generateFakeValue(type, line);

      output1 += `  ${field}: ${mockVal},\n`;
      output2 += `  ${field}: ${mockVal},\n`;
    }

    output1 += `};\n\n`;
    output2 += `};\n\n`;

    return output1 + output2;
  }

  private writeModelData(): string {
    const { modelName } = this;
    let output1 = `export const created${modelName}: ${modelName} = {\n`;
    let output2 = `export const updated${modelName}: ${modelName} = {\n`;
    let output3 = `export const deleted${modelName}: ${modelName} = {\n`;

    const idValue = this.checkIdType();

    output1 += `  ...new${modelName}Input,\n`;
    output1 += `  id: ${idValue},\n  creatorId,\n  modifierId: creatorId,\n  createdAt: new Date(),\n  updatedAt: new Date(),\n  deletedAt: null,\n};\n\n`;

    output2 += `  ...created${modelName},\n  ...edit${modelName}Input,\n  modifierId,\n};\n\n`;

    output3 += `  ...created${modelName},\n  deletedAt: new Date(),\n  modifierId,\n};\n`;

    return output1 + output2 + output3;
  }

  private writeInterfaces(): string {
    const { modelName, enumObjects } = this;

    let output = `import { ${modelName},`;
    for (const enu of enumObjects) {
      output += ` ${enu.name},`;
    }
    output = R.dropLast(1, output);
    output += ` } from '@prisma/client';\n\n`;

    output += `export const creatorId = faker.datatype.number();\n`;
    output += `export const modifierId = faker.datatype.number();\n\n`;

    return output;
  }

  private generateFakeValue(type: string, keywords: string[]): string {
    switch (type) {
      case 'String':
        return this.rdmStr();
      case 'Boolean':
        return this.rdmBool();
      case 'Int':
        return this.rdmNum();
      case 'BigInt':
        return this.rdmNumberic('11');
      case 'Float':
        return this.rdmFloat();
      case 'Decimal':
        return this.rdmFloat();
      case 'DateTime':
        return this.rdmDate();
      case 'Json':
        return '{}';
      case 'Bytes':
        return '';
      case 'Unsupported':
        return '';
      default:
        if (type.indexOf('@relation') === -1) {
          return this.rdmEnum(type);
        }
        return '';
    }
  }

  private checkIdType(): string {
    const { data } = this;

    for (const line of data) {
      if (line[0] === 'id') {
        return line[1] === 'String'
          ? 'faker.random.alpha(10)'
          : 'faker.datatype.number()';
      }
    }
  }
}
