import * as R from 'ramda';
import * as inflected from 'inflected';

import { FileGenerator } from './file-generator';
import { EnumObject } from '../interfaces/model-enum.interface';
import { ModelRelations } from '../interfaces/relation.interface';
import {
  DataType,
  ModelProperty,
} from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class ModelGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'model';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeEnumDependencies();
    this.output += this.writeModelRelations();
    this.output += this.writeModelClass();
  }

  public async generateFile() {
    await this.writeFile('models/' + this.moduleName);
  }

  private writeGqlDependencies(): string {
    const { gqlTypes } = this;
    const gqlTypeStr = gqlTypes.join(', ');
    return `import { Field, ObjectType, ${gqlTypeStr} } from '@nestjs/graphql';\n\n`;
  }

  private writeEnumDependencies(): string {
    const { enumRelations } = this;
    if (!enumRelations.length) {
      return '';
    }

    const enumStr = enumRelations.join(', ');
    return `import { ${enumStr} } from '@prisma/client';\n\n`;
  }

  private writeModelRelations(): string {
    const { modelRelations, modelName } = this;
    let output = `import { BaseModel } from '@Model/base.model';\n`;
    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      const moduleName = inflected.dasherize(inflected.underscore(item));
      output += `import { ${item} } from '@Module/${moduleName}/models/${moduleName}.model';\n`;
    }

    for (const item of m) {
      const moduleName = inflected.dasherize(inflected.underscore(item));
      output += `import { ${item} } from '@Module/${moduleName}/models/${moduleName}.model';\n`;
    }

    output += '\n';

    return output;
  }

  private writeModelClass(): string {
    const { modelName, properties } = this;

    let output = `@ObjectType({\n  description: '',\n})\n`;
    output += `export class ${modelName}Model extends BaseModel {\n`;

    for (const property of properties) {
      output += this.writeField(property);
    }

    output = R.dropLast(1, output);
    output += '}\n';
    return output;
  }

  private writeField(property: ModelProperty): string {
    const { key, type, gqlType, tsType, nullable, isArray } = property;

    if (
      R.includes(key, [
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

    const gqlTypeStr = isArray ? `[${gqlType}]` : gqlType;
    let nullableStr = '';
    let keyNameStr = key;
    let tsTypeStr = tsType;

    if (nullable || type === DataType.Relation) {
      nullableStr = `    nullable: true,\n`;
      keyNameStr = `${key}?`;
    }

    if (isArray) {
      if (nullable || type === DataType.Relation) {
        tsTypeStr = `${tsType}[] | null`;
      } else {
        tsTypeStr = `${tsType}[]`;
      }
    } else {
      if (nullable || type === DataType.Relation) {
        tsTypeStr = `${tsType} | null`;
      } else {
        tsTypeStr = `${tsType}`;
      }
    }

    const output = `  @Field(() => ${gqlTypeStr}, {\n    description: '',\n${nullableStr}  })\n  ${keyNameStr}: ${tsTypeStr};\n\n`;

    return output;
  }
}
