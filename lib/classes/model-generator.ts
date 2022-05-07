import * as R from 'ramda';

import { FileGenerator } from './file-generator';
import { EnumObject } from '../interfaces/model-enum.interface';

export class ModelGenerator extends FileGenerator {
  constructor(
    modelName: string,
    modelLines: string[][],
    enumObjects: EnumObject[],
    models: string[],
  ) {
    super(modelName, modelLines);
    this.suffix = 'model';
    this.models = models;
    this.output += this.writeModelClass();
    this.enumObjects = enumObjects;

    if (this.enumObjects.length) {
      this.output = this.writeEnumDependencies() + this.output;
    }
    this.output = this.writeGqlDependencies() + this.output;
  }

  public async generateFile() {
    await this.writeFile('models/' + this.moduleName);
  }

  private writeGqlDependencies(): string {
    const { gqlTypes } = this;
    let output = `import { Field, ObjectType`;
    for (const gqlType of gqlTypes) {
      output += `, ${gqlType}`;
    }
    output += ` } from '@nestjs/graphql';\n\n`;
    output += `import { BaseModel } from '@Model/base.model';\n\n`;

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

  private writeModelClass(): string {
    const { data, modelName } = this;

    let output = '@ObjectType()\n';
    output += `export class ${modelName} extends BaseModel {\n`;

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

    if (type.indexOf('?') !== -1) {
      type = R.dropLast(1, type);
      isOptional = true;
    }

    if (type.indexOf('[]') !== -1) {
      type = R.dropLast(2, type);
      isArray = true;
    }

    if (
      R.includes(fieldName, [
        'id',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'creatorId',
        'modifierId',
      ])
    ) {
      return '';
    }

    const comment = this.writeFieldComment(keywords);
    const [gqlType, fieldType] = this.parseFieldType(type);

    let output = `  @Field(() => ${gqlType}`;

    if (comment) {
      output += `, {\n    description: '${comment}',\n  })\n`;
    } else {
      output += ')\n';
    }

    output += `  ${fieldName}${isOptional ? '?' : ''}: ${fieldType}${
      isArray ? '[]' : ''
    };\n\n`;

    return output;
  }

  private writeFieldComment(keywords: string[]): string {
    let commentStartAt = -1;
    for (let i = 2; i < keywords.length; i++) {
      if (keywords[i] === '///') {
        commentStartAt = i + 1;
        break;
      }
    }

    if (commentStartAt === -1) {
      return '';
    }
    const comment = R.last(R.splitAt(commentStartAt, keywords)).join(' ');
    return comment;
  }
}
