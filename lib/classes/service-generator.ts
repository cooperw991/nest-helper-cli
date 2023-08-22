import * as R from 'ramda';
import { FileGenerator } from './file-generator';
import { DataType } from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';

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
    output += `  constructor(\n    private prisma: PrismaService,\n    private logService: LogService,\n    private i18n: I18nService,\n  ) {\n    this.moduleName = '${className}';\n  }\n\n`;

    output += `  private moduleName: string;\n\n`;

    return output;
  }

  private writeGetMethod(): string {
    const { className, variableName, modelRelations, modelName } = this;

    let output = '';

    output += `  async get${className}Detail(\n    ${variableName}Id: number,\n    include?: ${className}FindInclude,\n  ): Promise<${className}Model> {\n`;

    output += `    const ${variableName} = await this.prisma.${variableName}.findFirst({\n      where: {\n        id: ${variableName}Id,\n        deletedAt: null,\n      },\n      include: include\n        ? {\n`;

    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      output += `            ${item.key}: true,\n`;
    }

    for (const item of m) {
      output += `            ${item.key}: true,\n`;
    }

    output += `          }\n        : null,\n    });\n\n`;

    output += `    if (!${variableName}) {\n      throw new GoneException(\n        await this.i18n.t('general.NOT_FOUND', {\n          args: {\n            model: this.moduleName,\n            condition: 'id',\n            value: ${variableName}Id,\n          },\n        }),\n      );\n    }\n\n`;

    output += `    return ${variableName};\n  }\n\n`;

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

    output += `  async get${className}List(\n    where: ${className}FindFilter,\n    order: ${className}FindOrder[],\n    paging: PagingQuery,\n    include: ${uppperCamelPluralizeName}FindInclude,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `    const queryOptions: Prisma.${className}FindManyArgs = {};\n    const whereOptions = generateWhereOptions(where);\n    const orderOptions = generateOrderOptions(order);\n\n`;

    output += `    if (!R.isEmpty(whereOptions)) {\n      queryOptions.where = {\n        ...whereOptions,\n      };\n    }\n\n`;

    output += `    queryOptions.orderBy = orderOptions.length\n      ? orderOptions\n      : [{ id: 'desc' }];\n\n`;

    output += `    const { skip, take } = prismaPaging(paging);\n    queryOptions.skip = skip;\n    queryOptions.take = take;\n    queryOptions.include = include\n      ? {\n`;

    // \n    queryOptions.include = {\n      };

    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      output += `            ${item.key}: include.${item.key}\n ?? false,\n`;
    }

    for (const item of m) {
      output += `            ${item.key}: include.${item.key}\n ?? false,\n`;
    }

    output += `        }\n      : null;\n\n`;

    output += `    const ${camelPluralizeName} = await this.prisma.${variableName}.findMany(queryOptions);\n    const totalCount = await this.prisma.${variableName}.count({\n      where: whereOptions,\n    });\n\n`;

    output += `    return {\n      ${camelPluralizeName},\n      paging: pagingResponse(paging, totalCount),\n    };\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { className, variableName } = this;
    let output = `  async createNew${className}(\n    me: UserModel,\n    input: New${className}Input,\n  ): Promise<${className}Model> {\n`;

    output += `    let new${className};\n\n`;
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
      output += `    const {\n${dateExcepts}      ...rest,\n    } = input;\n\n`;

      output += dateValidation;

      creationOutput = dateCreation + `          ...rest,\n`;
    }

    output += `    try {\n      new${className} = await this.prisma.${variableName}.create({\n        data: {\n`;

    output += creationOutput;

    output += `          creatorId: me.id,\n          modifierId: me.id,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('generate.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.CREATE'),\n            model: this.moduleName,\n            method: 'createNew${className}',\n          },\n        }),\n      );\n    }\n\n`;

    if (this.ifLog) {
      output += `    await this.logService.createLog({\n      userId: me.id,\n      moduleName: this.moduleName,\n      action: 'create',\n      additionalInfo: JSON.stringify(input),\n    });\n\n`;
    }

    output += `    return new${className};\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { className, variableName } = this;
    let output = `  async update${className}(\n    me: UserModel,\n    ${variableName}Id: number,\n    input: Edit${className}Input,\n  ): Promise<${className}Model> {\n`;

    output += `    const old${className} = await this.get${className}Detail(${variableName}Id);\n\n`;

    output += `    let new${className};\n\n`;
    const dates = this.findDateProperties();

    const {
      excepts: dateExcepts,
      validation: dateValidation,
      creation: dateCreation,
    } = this.writeDatesValidation(dates);

    let updatingOutput = '          ...input,\n';

    if (dates.length) {
      output += `    const {\n${dateExcepts}      ...rest,\n    } = input;\n\n`;

      output += dateValidation;

      updatingOutput = dateCreation + `          ...rest,\n`;
    }

    output += `    try {\n      new${className} = await this.prisma.${variableName}.update({\n        data: {\n`;

    output += updatingOutput;

    output += `          modifierId: me.id,\n        },\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('generate.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.UPDATE'),\n            model: this.moduleName,\n            method: 'update${className}',\n          },\n        }),\n      );\n    }\n\n`;

    if (this.ifLog) {
      output += `    await this.logService.createLog({\n      userId: me.id,\n      moduleId: ${variableName}Id,\n      moduleName: this.moduleName,\n      action: 'update',\n      additionalInfo: JSON.stringify({\n        old: old${className},\n        new: input,\n      }),\n    });\n\n`;
    }

    output += `    return new${className};\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { className, variableName } = this;
    let output = `  async delete${className}(\n    me: UserModel,\n    ${variableName}Id: number,\n  ): Promise<boolean> {\n`;
    output += `    const old${className} = await this.prisma.${variableName}.findFirst({\n      where: {\n        id: ${variableName}Id,\n        deletedAt: null,\n      },\n    });\n\n`;

    output += `    if (!old${className}) {\n      return true;\n    }\n\n`;

    output += `    try {\n      await this.prisma.${variableName}.delete({\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.DELETE'),\n            model: this.moduleName,\n            method: 'delete${className}',\n          },\n        }),\n      );\n    }\n\n`;

    if (this.ifLog) {
      output += `    await this.logService.createLog({\n      userId: me.id,\n      moduleId: ${variableName}Id,\n      moduleName: this.moduleName,\n      action: 'delete',\n      additionalInfo: JSON.stringify({}),\n    });\n\n`;
    }

    output += `    return true;\n  }\n\n`;

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
      excepts += `      ${item},\n`;
      validation += `    if (!dayjs(${item}).isValid()) {\n      throw new NotAcceptableException(\n        await this.i18n.t('general.DATE_INVALID', {\n          args: {\n            date: ${item},\n          },\n        }),\n      );\n    }\n`;
      creation += `          ${item}: dayjs(${item}).toDate(),\n`;
    }

    return {
      validation,
      excepts,
      creation,
    };
  }
}
