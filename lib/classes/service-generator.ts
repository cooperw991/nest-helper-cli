import * as R from 'ramda';

import { FileGenerator } from './file-generator';

export class ServiceGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][], models: string[]) {
    super(modelName, modelLines);
    this.suffix = 'service';
    this.models = models;
    this.getIdType();
    this.getRelations();
    this.output += this.writeDependencies();
    this.output += this.writeClass();
  }

  protected idType: string;
  protected relations: string[];

  public async generateFile() {
    await this.writeFile('services/' + this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName, uppperCamelPluralizeName } = this;
    let output = `import R from 'ramda';\n`;
    output += `import {\n  Injectable,\n  InternalServerErrorException,\n  NotFoundException,\n} from '@nestjs/common';\n`;
    output += `import { PrismaService } from 'nestjs-prisma';\n`;
    output += `import { I18nRequestScopeService } from 'nestjs-i18n';\n`;
    output += `import { Prisma } from '@prisma/client';\n`;
    output += `import { Logger } from '@nestjs/common';\n\n`;

    output += `import { PagingQuery } from '@Dto/paging-query.input';\n`;
    output += `import { pagingResponse, prismaPaging } from '@Util/pagination.util';\n`;
    output += `import { generateOrderOptions, generateWhereOptions } from '@Util/query.util';\n\n`;

    output += `import { LogService } from '@Module/log/services/log.service';\n`;
    output += `import { ${modelName}Model } from '../models/${moduleName}.model';\n`;
    output += `import { New${modelName}Input } from '../dto/new-${moduleName}.input';\nimport { Edit${modelName}Input } from '../dto/edit-${moduleName}.input';\nimport { ${uppperCamelPluralizeName}FindFilter } from '../dto/find-filter.input';\nimport { ${uppperCamelPluralizeName}FindOrder } from '../dto/find-order.input';\nimport { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.dto';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { modelName } = this;

    let output = `@Injectable()\nexport class ${modelName}Service {\n`;
    output += this.writeConstructor();
    output += this.writeFindMethod();
    output += this.writeFilterMethod();
    output += this.writeCreateMethod();
    output += this.writeUpdateMethod();
    output += this.writeDeleteMethod();
    output += `}\n`;

    return output;
  }

  private writeConstructor(): string {
    const { moduleName } = this;
    let output = `  constructor(\n`;
    output += `    private prisma: PrismaService,\n`;
    output += `    private readonly i18n: I18nRequestScopeService,\n`;
    output += `    private readonly logService: LogService,\n`;
    output += `  ) {\n    this.moduleName = '${moduleName}';\n  }\n\n`;

    output += `  public moduleName: string;\n\n`;
    return output;
  }

  private writeFindMethod(): string {
    const { modelName, variableName, idType, relations } = this;

    let output = `  async find${modelName}(${variableName}Id: ${idType}): Promise<${modelName}Model> {\n`;
    output += `    const ${variableName} = await this.prisma.${variableName}.findFirst({\n      where: {\n        id: ${variableName}Id,\n        deletedAt: null,\n      },\n`;
    if (relations.length) {
      output += `      include: {\n`;
      for (const relation of relations) {
        output += `        ${relation}: true,\n`;
      }
      output += `      },\n`;
    }
    output += `    });\n\n`;
    output += `    if (!${variableName}) {\n      throw new NotFoundException(\n        await this.i18n.t('general.NOT_FOUND', {\n          args: {\n            model: '${modelName}',\n            condition: 'id',\n            value: ${variableName}Id,\n          },\n        }),\n      );\n    }\n\n`;
    output += `    return ${variableName};\n  }\n\n`;

    return output;
  }

  private writeFilterMethod(): string {
    const {
      uppperCamelPluralizeName,
      camelPluralizeName,
      variableName,
      relations,
      modelName,
    } = this;

    let output = `  async find${uppperCamelPluralizeName}(\n    where: ${uppperCamelPluralizeName}FindFilter,\n    order: ${uppperCamelPluralizeName}FindOrder[],\n    paging: PagingQuery,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `    const queryOptions: Prisma.${modelName}FindManyArgs = {};\n`;
    output += `    const whereOptions = generateWhereOptions(where);\n    const orderOptions = generateOrderOptions(order);\n\n`;
    output += `    if (!R.isEmpty(whereOptions)) {\n      queryOptions.where = whereOptions;\n    }\n\n    if (orderOptions.length) {\n      queryOptions.orderBy = orderOptions;\n    }\n\n`;
    output += `    const { skip, take } = prismaPaging(paging);\n    queryOptions.skip = skip;\n    queryOptions.take = take;\n\n`;
    if (relations.length) {
      output += `    const ${camelPluralizeName} = await this.prisma.${variableName}.findMany({\n      ...queryOptions,\n`;
      output += `      include: {\n`;
      for (const relation of relations) {
        output += `        ${relation}: true,\n`;
      }
      output += `      },\n    });\n`;
    } else {
      output += `    const ${camelPluralizeName} = await this.prisma.${variableName}.findMany(queryOptions);\n`;
    }

    output += `    const totalCount = await this.prisma.${variableName}.count({\n      where: queryOptions.where,\n    });\n\n`;
    output += `    return {\n      ${camelPluralizeName},\n      paging: pagingResponse(paging, totalCount),\n    };\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { modelName, variableName } = this;

    let output = `  async create${modelName}(input: New${modelName}Input, myId: number): Promise<${modelName}Model> {\n`;

    output += `    let new${modelName};\n\n`;

    output += `    try {\n      new${modelName} = await this.prisma.${variableName}.create({\n        data: {\n          ...input,\n          creatorId: myId,\n          modifierId: myId,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.CREATE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n\n`;

    output += `    await this.logService.createLog({\n      userId: myId,\n      moduleName: this.moduleName,\n      action: 'create',\n      additionalContent: JSON.stringify(input),\n    });\n\n`;

    output += `    return new${modelName};\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { modelName, variableName, idType } = this;

    let output = `  async update${modelName}(\n    ${variableName}Id: ${idType},\n    input: Edit${modelName}Input,\n    myId: number,\n  ): Promise<${modelName}Model> {\n`;

    output += `    await this.find${modelName}(${variableName}Id);\n\n`;

    output += `    let new${modelName};\n\n`;

    output += `    try {\n      new${modelName} = await this.prisma.${variableName}.update({\n        data: {\n          ...input,\n          modifierId: myId,\n        },\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.UPDATE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n\n`;

    output += `    await this.logService.createLog({\n      userId: myId,\n      moduleName: this.moduleName,\n      action: 'update',\n      additionalContent: JSON.stringify(input),\n    });\n\n`;

    output += `    return new${modelName};\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { modelName, variableName, idType } = this;

    let output = `  async delete${modelName}(${variableName}Id: ${idType}, myId: number): Promise<boolean> {\n`;

    output += `    const ${variableName} = await this.prisma.${variableName}.findFirst({\n      where: {\n        id: ${variableName}Id,\n      },\n    });\n\n`;

    output += `    if (!${variableName}) {\n      return true;\n    }\n\n`;

    output += `    try {\n      await this.prisma.${variableName}.delete({\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n      await this.prisma.${variableName}.update({\n        data: {\n          modifierId: myId,\n        },\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.DELETE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n\n`;

    output += `    await this.logService.createLog({\n      userId: myId,\n      moduleName: this.moduleName,\n      action: 'delete',\n      additionalContent: JSON.stringify({}),\n    });\n\n`;

    output += `    return true;\n  }\n`;

    return output;
  }

  private getIdType() {
    const { data } = this;

    const idLine = data.find((line) => R.includes('@id', line)) || [];
    this.idType = idLine[1] === 'String' ? 'string' : 'number';
  }

  private getRelations() {
    const { models, data } = this;

    const relations = [];

    for (const line of data) {
      if (R.includes(line[1], models)) {
        relations.push(line[0]);
      }
    }
    this.relations = relations;
  }
}
