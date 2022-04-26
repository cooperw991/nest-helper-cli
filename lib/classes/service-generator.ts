import * as R from 'ramda';

import { FileGenerator } from './file-generator';

export class ServiceGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
    this.suffix = 'service';
    this.getIdType();
    this.output += this.writeDependencies();
    this.output += this.writeClass();
  }

  protected idType: string;

  public generateFile() {
    this.writeFile('services/' + this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName, uppperCamelPluralizeName } = this;
    let output = `import R from 'ramda';\n`;
    output += `import {\n  Injectable,\n  InternalServerErrorException,\n  NotFoundException,\n} from '@nestjs/common';\n`;
    output += `import { PrismaService } from 'nestjs-prisma';\n`;
    output += `import { I18nRequestScopeService } from 'nestjs-i18n';\n`;
    output += `import { Logger } from '@nestjs/common';\n\n`;

    output += `import { PagingQuery } from '@Dto/paging-query.input';\n`;
    output += `import { pagingResponse, prismaPaging } from '@Util/pagination.util';\n`;
    output += `import { generateOrderOptions, generateWhereOptions } from '@Util/query.util';\n\n`;

    output += `import { ${modelName} } from '@prisma/client';\n`;
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
    let output = `  constructor(\n`;
    output += `    private prisma: PrismaService,\n`;
    output += `    private readonly i18n: I18nRequestScopeService,\n`;
    output += `  ) {}\n\n`;
    return output;
  }

  private writeFindMethod(): string {
    const { modelName, variableName, idType } = this;

    let output = `  async find${modelName}(${variableName}Id: ${idType}): Promise<${modelName}> {\n`;
    output += `    const ${variableName} = this.prisma.${variableName}.FindFirst({\n      where: {\n        id: ${variableName}Id,\n        deletedAt: {\n          equals: null,\n        },\n      },\n    });\n\n`;
    output += `    if (!${variableName}) {\n      throw new NotFoundException(\n        await this.i18n.t('general.NOT_FOUND', {\n          args: {\n            model: '${modelName}',\n            condition: 'id',\n            value: ${variableName}Id,\n          },\n        }),\n      );\n    }\n\n`;
    output += `    return ${variableName};\n  }\n\n`;

    return output;
  }

  private writeFilterMethod(): string {
    const { uppperCamelPluralizeName, camelPluralizeName, variableName } = this;

    let output = `  async find${uppperCamelPluralizeName}(\n    where: ${uppperCamelPluralizeName}FindFilter,\n    order: ${uppperCamelPluralizeName}FindOrder[],\n    paging: PagingQuery,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `    const queryOptions: any = {};\n`;
    output += `    const whereOptions = generateWhereOptions(where);\n    const orderOptions = generateOrderOptions(order);\n\n`;
    output += `    if (!R.isEmpty(whereOptions)) {\n      queryOptions.where = whereOptions;\n    }\n\n    if (orderOptions.length) {\n      queryOptions.orderBy = orderOptions;\n    }\n\n`;
    output += `    const { skip, take } = prismaPaging(paging);\n    queryOptions.skip = skip;\n    queryOptions.take = take;\n\n`;
    output += `    const ${camelPluralizeName} = await this.prisma.${variableName}.findMany(queryOptions);\n    const totalCount = await this.prisma.${variableName}.count(queryOptions);\n\n`;
    output += `    return {\n      ${camelPluralizeName},\n      paging: pagingResponse(paging, totalCount),\n    };\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { modelName, variableName } = this;

    let output = `  async create${modelName}(input: New${modelName}Input): Promise<${modelName}> {\n`;

    output += `    try {\n      const new${modelName} = this.prisma.${variableName}.create({\n        data: {\n          ...input,\n        },\n      });\n      return new${modelName};\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.CREATE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { modelName, variableName, idType } = this;

    let output = `  async update${modelName}(${variableName}Id: ${idType}, input: Edit${modelName}Input): Promise<${modelName}> {\n`;

    output += `    await this.find${modelName}(${variableName}Id);\n\n`;

    output += `    try {\n      const new${modelName} = this.prisma.${variableName}.update({\n        data: {\n          ...input,\n        },\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n      return new${modelName};\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.UPDATE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { modelName, variableName, idType } = this;

    let output = `  async delete${modelName}(${variableName}Id: ${idType}): Promise<boolean> {\n`;

    output += `    const ${variableName} = await this.prisma.${variableName}.findFirst({\n      where: {\n        id: ${variableName}Id,\n      },\n    });\n\n`;

    output += `    if (!${variableName}) {\n      return true;\n    }\n\n`;

    output += `    try {\n      await this.prisma.${variableName}.delete({\n        where: {\n          id: ${variableName}Id,\n        },\n      });\n      return true;\n    } catch (e) {\n      Logger.error(e.message);\n      throw new InternalServerErrorException(\n        await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n          args: {\n            action: await this.i18n.t('db.DELETE'),\n            model: '${modelName}',\n          },\n        }),\n      );\n    }\n  }\n`;

    return output;
  }

  private getIdType() {
    const { data } = this;

    const idLine = data.find((line) => R.includes('@id', line)) || [];
    this.idType = idLine[1] === 'String' ? 'string' : 'number';
  }
}
