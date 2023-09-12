import * as R from 'ramda';
import { FileGenerator } from './file-generator';
import { DataType } from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import { p2, p4, p6, p8, p10, p12 } from '../utils/pad.util';

export class ServiceGenerator extends FileGenerator {
  constructor(params: GeneratorParams, ifLog = true) {
    super(params);

    this.suffix = 'service';
    this.models = params.models;
    this.needTimeCheck = false;
    this.ifLog = ifLog;
    this.exceptions = ['InternalServerErrorException', 'GoneException'];

    this.output += this.writeServiceClass();
    this.output += this.writeGetMethod();
    this.output += this.writeListMethod();
    this.output += this.writeCreateMethod();
    this.output += this.writeUpdateMethod();
    this.output += this.writeDeleteMethod();

    this.output = this.writeDependencies() + this.output;

    this.output += `}\n`;
  }

  private needTimeCheck: boolean;
  private exceptions: string[];
  private ifLog: boolean;

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('services/' + this.moduleName, ifReplace);
  }

  private writeDependencies(): string {
    const { moduleName, className, uppperCamelPluralizeName } = this;
    let output = '';
    output += `import R from 'ramda';\n`;
    if (this.needTimeCheck) {
      output += `import dayjs from 'dayjs';\n`;
      this.exceptions.push('NotAcceptableException');
    }
    output += `import { Injectable, Logger, ${[
      ...new Set(this.exceptions),
    ].join(', ')}, } from '@nestjs/common';\n`;
    output += `import { Prisma } from '@prisma/client';\n\n`;
    output += `import { I18nService } from 'nestjs-i18n';\n`;
    output += `import { PrismaService } from 'nestjs-prisma';\n\n`;

    output += `import { PagingQuery } from '@Dto/paging-query.input';\n`;
    output += `import { LogService } from '@Module/log/services/log.service';\n`;
    output += `import { UserModel } from '@Module/user/models/user.model';\n`;
    output += `import { pagingResponse, prismaPaging } from '@Util/pagination.util';\n`;
    output += `import { generateOrderOptions, generateWhereOptions } from '@Util/query.util';\n`;
    output += `import { Edit${className}Input } from '../dto/edit-${moduleName}.input';\n`;
    output += `import { ${className}FindFilter } from '../dto/find-filter.input';\n`;
    output += `import { ${className}FindInclude } from '../dto/find-include.input';\n`;
    output += `import { ${className}FindOrder } from '../dto/find-order.input';\n`;
    output += `import { ${className}Model } from '../models/${moduleName}.model';\n`;
    output += `import { New${className}Input } from '../dto/new-${moduleName}.input';\n`;
    output += `import { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.object';\n\n`;

    return output;
  }

  private writeServiceClass(): string {
    const { className } = this;

    let output = `@Injectable()\n`;
    output += `export class ${className}Service {\n`;
    output += `${p2}constructor(\n${p4}private prisma: PrismaService,\n${p4}private logService: LogService,\n${p4}private i18n: I18nService,\n${p2}) {\n${p4}this.moduleName = '${className}';\n${p2}}\n\n`;

    output += `${p2}private moduleName: string;\n\n`;

    return output;
  }

  private writeGetMethod(): string {
    const { className, variableName, modelRelations, modelName } = this;

    let output = '';

    output += `${p2}async get${className}Detail(\n${p4}${variableName}Id: number,\n${p4}include?: ${className}FindInclude,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}const ${variableName} = await this.prisma.${variableName}.findFirst({\n${p6}where: {\n${p8}id: ${variableName}Id,\n${p8}deletedAt: null,\n${p6}},\n${p6}include: include\n${p8}? {\n`;

    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      output += `${p12}${item.key}: true,\n`;
    }

    for (const item of m) {
      output += `${p12}${item.key}: true,\n`;
    }

    output += `${p10}}\n${p8}: null,\n${p4}});\n\n`;

    output += `${p4}if (!${variableName}) {\n${p6}throw new GoneException(\n${p8}await this.i18n.t('general.NOT_FOUND', {\n${p10}args: {\n${p12}model: this.moduleName,\n${p12}condition: 'id',\n${p12}value: ${variableName}Id,\n${p10}},\n${p8}}),\n${p6});\n${p4}}\n\n`;

    output += `${p4}return ${variableName};\n${p2}}\n\n`;

    return output;
  }

  private writeListMethod(): string {
    const {
      className,
      variableName,
      uppperCamelPluralizeName,
      camelPluralizeName,
      modelRelations,
      modelName,
    } = this;

    let output = '';

    output += `${p2}async get${className}List(\n${p4}where: ${className}FindFilter,\n${p4}order: ${className}FindOrder[],\n${p4}paging: PagingQuery,\n${p4}include: ${className}FindInclude,\n${p2}): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `${p4}const queryOptions: Prisma.${className}FindManyArgs = {};\n${p4}const whereOptions = generateWhereOptions(where);\n${p4}const orderOptions = generateOrderOptions(order);\n\n`;

    output += `${p4}if (!R.isEmpty(whereOptions)) {\n${p6}queryOptions.where = {\n${p8}...whereOptions,\n${p6}};\n${p4}}\n\n`;

    output += `${p4}queryOptions.orderBy = orderOptions.length\n${p6}? orderOptions\n${p6}: [{ id: 'desc' }];\n\n`;

    output += `${p4}const { skip, take } = prismaPaging(paging);\n${p4}queryOptions.skip = skip;\n${p4}queryOptions.take = take;\n${p4}queryOptions.include = include\n${p6}? {\n`;

    // \n${p4}queryOptions.include = {\n${p6}};

    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      output += `${p12}${item.key}: include.${item.key}\n ?? false,\n`;
    }

    for (const item of m) {
      output += `${p12}${item.key}: include.${item.key}\n ?? false,\n`;
    }

    output += `${p8}}\n${p6}: null;\n\n`;

    output += `${p4}const ${camelPluralizeName} = await this.prisma.${variableName}.findMany(queryOptions);\n${p4}const totalCount = await this.prisma.${variableName}.count({\n${p6}where: whereOptions,\n${p4}});\n\n`;

    output += `${p4}return {\n${p6}${camelPluralizeName},\n${p6}paging: pagingResponse(paging, totalCount),\n${p4}};\n${p2}}\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { className, variableName } = this;
    let output = `${p2}async createNew${className}(\n${p4}me: UserModel,\n${p4}input: New${className}Input,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}let new${className};\n\n`;
    const dates = this.findDateProperties();

    if (dates.length) {
      this.needTimeCheck = true;
    }

    const {
      excepts: dateExcepts,
      validation: dateValidation,
      creation: dateCreation,
    } = this.writeDatesValidation(dates);

    let creationOutput = '          ...input,\n';

    if (dates.length) {
      output += `${p4}const {\n${dateExcepts}      ...rest,\n${p4}} = input;\n\n`;

      output += dateValidation;

      creationOutput = dateCreation + `${p10}...rest,\n`;
    }

    output += `${p4}try {\n${p6}new${className} = await this.prisma.${variableName}.create({\n${p8}data: {\n`;

    output += creationOutput;

    output += `${p10}creatorId: me.id,\n${p10}modifierId: me.id,\n${p8}},\n${p6}});\n${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('generate.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.CREATE'),\n${p12}model: this.moduleName,\n${p12}method: 'createNew${className}',\n${p10}},\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleName: this.moduleName,\n${p6}action: 'create',\n${p6}additionalInfo: JSON.stringify(input),\n${p4}});\n\n`;
    }

    output += `${p4}return new${className};\n${p2}}\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { className, variableName } = this;
    let output = `${p2}async update${className}(\n${p4}me: UserModel,\n${p4}${variableName}Id: number,\n${p4}input: Edit${className}Input,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}const old${className} = await this.get${className}Detail(${variableName}Id);\n\n`;

    output += `${p4}let new${className};\n\n`;
    const dates = this.findDateProperties();

    const {
      excepts: dateExcepts,
      validation: dateValidation,
      creation: dateCreation,
    } = this.writeDatesValidation(dates);

    let updatingOutput = '          ...input,\n';

    if (dates.length) {
      output += `${p4}const {\n${dateExcepts}      ...rest,\n${p4}} = input;\n\n`;

      output += dateValidation;

      updatingOutput = dateCreation + `${p10}...rest,\n`;
    }

    output += `${p4}try {\n${p6}new${className} = await this.prisma.${variableName}.update({\n${p8}data: {\n`;

    output += updatingOutput;

    output += `${p10}modifierId: me.id,\n${p8}},\n${p8}where: {\n${p10}id: ${variableName}Id,\n${p8}},\n${p6}});\n${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('generate.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.UPDATE'),\n${p12}model: this.moduleName,\n${p12}method: 'update${className}',\n${p10}},\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleId: ${variableName}Id,\n${p6}moduleName: this.moduleName,\n${p6}action: 'update',\n${p6}additionalInfo: JSON.stringify({\n${p8}old: old${className},\n${p8}new: input,\n${p6}}),\n${p4}});\n\n`;
    }

    output += `${p4}return new${className};\n${p2}}\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { className, variableName } = this;
    let output = `${p2}async delete${className}(\n${p4}me: UserModel,\n${p4}${variableName}Id: number,\n${p2}): Promise<boolean> {\n`;
    output += `${p4}const old${className} = await this.prisma.${variableName}.findFirst({\n${p6}where: {\n${p8}id: ${variableName}Id,\n${p8}deletedAt: null,\n${p6}},\n${p4}});\n\n`;

    output += `${p4}if (!old${className}) {\n${p6}return true;\n${p4}}\n\n`;

    output += `${p4}try {\n${p6}await this.prisma.${variableName}.delete({\n${p8}where: {\n${p10}id: ${variableName}Id,\n${p8}},\n${p6}});\n${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.DELETE'),\n${p12}model: this.moduleName,\n${p12}method: 'delete${className}',\n${p10}},\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleId: ${variableName}Id,\n${p6}moduleName: this.moduleName,\n${p6}action: 'delete',\n${p6}additionalInfo: JSON.stringify({}),\n${p4}});\n\n`;
    }

    output += `${p4}return true;\n${p2}}\n\n`;

    return output;
  }

  private findDateProperties(): string[] {
    const { properties } = this;

    const dates = [];
    for (const property of properties) {
      if (R.includes(property.key, ['deletedAt', 'createdAt', 'updatedAt'])) {
        continue;
      }
      if (property.type === DataType.DateTime) {
        dates.push(property.key);
      }
    }

    if (dates.length) {
      this.needTimeCheck = true;
    }

    return dates;
  }

  private writeDatesValidation(dates: string[]): {
    excepts: string;
    validation: string;
    creation: string;
  } {
    let validation = ``;
    let excepts = ``;
    let creation = ``;

    for (const item of dates) {
      excepts += `${p6}${item},\n`;
      validation += `${p4}if (!dayjs(${item}).isValid()) {\n${p6}throw new NotAcceptableException(\n${p8}await this.i18n.t('general.DATE_INVALID', {\n${p10}args: {\n${p12}date: ${item},\n${p10}},\n${p8}}),\n${p6});\n${p4}}\n`;
      creation += `${p10}${item}: dayjs(${item}).toDate(),\n`;
    }

    return {
      validation,
      excepts,
      creation,
    };
  }
}
