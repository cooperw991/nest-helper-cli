import * as R from 'ramda';
import * as inflected from 'inflected';

import { FileGenerator } from './file-generator';
import {
  DataType,
  ModelProperty,
} from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import { p2, p4 } from '../utils/pad.util';

export class ModelGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.needPrisma = false;
    this.suffix = 'model';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeEnumDependencies();
    this.output += this.writeModelRelations();
    this.output += this.writeModelClass();
  }

  private needPrisma: boolean;

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('models/' + this.moduleName, ifReplace);
  }

  private writeGqlDependencies(): string {
    const { gqlTypes } = this;
    const gqlTypeStr = [...new Set(gqlTypes)].join(', ');
    if (gqlTypeStr.length) {
      return `import { Field, ObjectType, ${gqlTypeStr} } from '@nestjs/graphql';\n\n`;
    } else {
      return `import { Field, InputType } from '@nestjs/graphql';\n\n`;
    }
  }

  private writeEnumDependencies(): string {
    const { enumRelations, properties } = this;
    const needPrisma = properties.find((property) => {
      return (
        property.type === DataType.Json ||
        property.type === DataType.Decimal ||
        property.type === DataType.Money
      );
    });
    if (!enumRelations.length && !needPrisma) {
      return '';
    }

    if (needPrisma) {
      enumRelations.push('Prisma');
    }

    const enumStr = enumRelations.join(', ');

    return `import { ${enumStr} } from '@prisma/client';\n\n`;
  }

  private writeModelRelations(): string {
    const { modelRelations, modelName } = this;
    let output = `import { BaseModel } from '../../../models/base.model';\n`;
    const { o2o, o2m, m2o, m2m } = modelRelations[modelName];

    for (const item of o2o) {
      const moduleName = inflected.dasherize(inflected.underscore(item.value));
      output += `import { ${item.value}Model } from '../../${moduleName}/models/${moduleName}.model';\n`;
    }

    for (const item of o2m) {
      const moduleName = inflected.dasherize(inflected.underscore(item.value));
      output += `import { ${item.value}Model } from '../../${moduleName}/models/${moduleName}.model';\n`;
    }

    for (const item of m2o) {
      const moduleName = inflected.dasherize(inflected.underscore(item.value));
      output += `import { ${item.value}Model } from '../../${moduleName}/models/${moduleName}.model';\n`;
    }

    for (const item of m2m) {
      const moduleName = inflected.dasherize(inflected.underscore(item.value));
      output += `import { ${item.value}Model } from '../../${moduleName}/models/${moduleName}.model';\n`;
    }

    output += '\n';

    return output;
  }

  private writeModelClass(): string {
    const { modelName, properties } = this;

    let output = `@ObjectType({\n${p2}description: 'Data Model of ${modelName}',\n})\n`;
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

    let gqlTypeStr =
      type === DataType.Relation ? `${gqlType}Model` : `${gqlType}`;

    gqlTypeStr = isArray ? `[${gqlTypeStr}]` : gqlTypeStr;
    let nullableStr = '';
    let keyNameStr = key;
    let tsTypeStr = tsType;

    if (nullable || type === DataType.Relation) {
      nullableStr = `${p4}nullable: true,\n`;
      keyNameStr = `${key}?`;
    }

    tsTypeStr = type === DataType.Relation ? `${tsType}Model` : `${tsType}`;

    if (isArray) {
      if (nullable || type === DataType.Relation) {
        tsTypeStr = `${tsTypeStr}[] | null`;
      } else {
        tsTypeStr = `${tsTypeStr}[]`;
      }
    } else {
      if (nullable || type === DataType.Relation) {
        tsTypeStr = `${tsTypeStr} | null`;
      } else {
        tsTypeStr = `${tsTypeStr}`;
      }
    }

    const output = `${p2}@Field(() => ${gqlTypeStr}, {\n${p4}description: '',\n${nullableStr}${p2}})\n${p2}${keyNameStr}: ${tsTypeStr};\n\n`;

    return output;
  }
}
