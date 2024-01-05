import { FileGenerator } from './file-generator';
import { DataType } from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import {
  p2,
  p4,
  p6,
  p8,
  p10,
  p12,
  p14,
  p16,
  p18,
  p20,
  p22,
} from '../utils/pad.util';
import { arrayToString } from '../utils/array.util';

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
    if (this.ifLog) {
      this.output += this.writeListLogsMethod();
    }

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
    const { moduleName, className, uppperCamelPluralizeName, exceptions } =
      this;
    let output = '';
    const nestCommonDependencies = arrayToString(
      [...exceptions, 'Injectable', 'Logger'],
      ',\n',
    );
    output += `import { ${nestCommonDependencies} } from '@nestjs/common';\n`;
    output += `import { Prisma } from '@prisma/client';\n`;
    output += `import { I18nContext, I18nService } from 'nestjs-i18n';\n`;
    output += `import { PrismaService } from 'nestjs-prisma';\n`;
    output += `import R from 'ramda';\n\n`;

    output += `import { PagingQuery } from '../../../common/dto/paging-query.input';\n`;
    output += `import dayjs from '../../../common/utils/dayjs.util';\n`;
    output += `import { pagingResponse, prismaPaging } from '../../../common/utils/pagination.util';\n`;
    output += `import { psmErrorMsg } from '../../../common/utils/prisma-error-code.util';\n`;
    output += `import { generateOrderOptions, generateWhereOptions } from '../../../common/utils/query.util';\n`;
    output += `import { LogModel } from '../../log/models/log.model';\n`;
    output += `import { LogService } from '../../log/services/log.service';\n`;
    output += `import { UserModel } from '../../user/models/user.model';\n\n`;
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
    output += `${p2}constructor(\n${p4}private prisma: PrismaService,\n${p4}private logService: LogService,\n${p4}private i18n: I18nService,\n${p2}) {\n${p4}${className}Service.moduleName = '${className}';\n${p2}}\n\n`;

    output += `${p2}static moduleName: string;\n\n`;

    return output;
  }

  private writeGetMethod(): string {
    const { className, variableName, modelRelations, modelName, properties } =
      this;

    const relationCount = this.calRelationCount(modelName);

    let output = '';

    output += `${p2}async get${className}Detail(\n${p4}${variableName}Id: number,\n`;
    if (relationCount) {
      output += `${p4}include?: ${className}FindInclude,\n`;
    }
    output += `${p2}): Promise<${className}Model> {\n`;

    output += `${p4}const ${variableName} = await this.prisma.${variableName}.findFirst({\n${p6}where: {\n${p8}id: ${variableName}Id,\n${p8}deletedAt: null,\n${p6}},\n`;

    if (relationCount) {
      const { o2o, o2m, m2o, m2m } = modelRelations[modelName];

      output += `${p6}include: include\n${p8}? {\n`;

      for (const item of o2o) {
        output += `${p12}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of o2m) {
        if (item.deepKey) {
          output += `${p12}${item.key}: include.${item.key}\n${p14}? {\n${p18}include: {\n`;

          output += item.deepKey.reduce((prev, curr) => {
            return prev + `${p20}${curr}: true,\n`;
          }, '');

          output += `${p18}},\n${p18}where: {\n${p20}deletedAt: null,\n${p18}},\n${p16}}\n${p14}: false,\n`;
        } else {
          output += `${p12}${item.key}: include.${item.key} ?? false,\n`;
        }
      }

      for (const item of m2o) {
        output += `${p12}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of m2m) {
        output += `${p12}${item.key}: include.${item.key} ?? false,\n`;
      }

      output += `${p10}}\n${p8}: null,\n`;
    }

    output += `${p4}});\n\n`;

    output += `${p4}if (!${variableName}) {\n${p6}throw new GoneException(\n${p8}await this.i18n.t('general.NOT_FOUND', {\n${p10}args: {\n${p12}model: ${className}Service.moduleName,\n${p12}condition: 'id',\n${p12}value: ${variableName}Id,\n${p10}},\n${p10}lang: I18nContext.current()?.lang,\n${p8}}),\n${p6});\n${p4}}\n\n`;

    const spNumbers = [];
    for (const property of properties) {
      const { type, key } = property;

      if (type === DataType.Money || type === DataType.BigInt) {
        spNumbers.push(
          `${key}: ${variableName}.${key} ? +${variableName}.${key} : null,`,
        );
      }
    }

    if (spNumbers.length) {
      output += `${p4}return {\n${p6}...${variableName},\n`;

      for (const item of spNumbers) {
        output += `${p6}${item}\n`;
      }

      output += `${p4}};\n${p2}}\n\n`;
    } else {
      output += `${p4}return ${variableName};\n${p2}}\n\n`;
    }

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
      properties,
    } = this;

    const relationCount = this.calRelationCount(modelName);

    let output = '';

    output += `${p2}async get${className}List(\n${p4}where: ${className}FindFilter,\n${p4}order: ${className}FindOrder[],\n${p4}paging: PagingQuery,\n`;
    if (relationCount) {
      output += `${p4}include: ${className}FindInclude,\n`;
    }
    output += `${p2}): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `${p4}const queryOptions: Prisma.${className}FindManyArgs = {};\n${p4}const whereOptions = generateWhereOptions(where);\n${p4}const orderOptions = generateOrderOptions(order);\n\n`;

    output += `${p4}if (!R.isEmpty(whereOptions)) {\n${p6}queryOptions.where = {\n${p8}...whereOptions,\n${p6}};\n${p4}}\n\n`;

    output += `${p4}queryOptions.orderBy = orderOptions.length\n${p6}? orderOptions\n${p6}: [{ id: 'desc' }];\n\n`;

    output += `${p4}const { skip, take } = prismaPaging(paging);\n${p4}queryOptions.skip = skip;\n${p4}queryOptions.take = take;\n`;

    if (relationCount) {
      output += `${p4}queryOptions.include = include\n${p6}? {\n`;

      const { o2o, o2m, m2o, m2m } = modelRelations[modelName];

      for (const item of o2o) {
        output += `${p10}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of o2m) {
        if (item.deepKey?.length) {
          output += `${p10}${item.key}: include.${item.key}\n${p12}? {\n${p16}include: {\n`;
          output += item.deepKey.reduce((prev, curr) => {
            return prev + `${p18}${curr}: true,\n`;
          }, '');
          output += `${p16}},\n${p16}where: {\n${p18}deletedAt: null,\n${p16}},\n${p14}}\n${p12}: false,\n`;
        } else {
          output += `${p10}${item.key}: include.${item.key} ?? false,\n`;
        }
      }

      for (const item of m2o) {
        output += `${p10}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of m2m) {
        output += `${p10}${item.key}: include.${item.key} ?? false,\n`;
      }

      output += `${p8}}\n${p6}: null;\n`;
    }

    output += `\n`;

    output += `${p4}const ${camelPluralizeName} = await this.prisma.${variableName}.findMany(queryOptions);\n${p4}const totalCount = await this.prisma.${variableName}.count({\n${p6}where: whereOptions,\n${p4}});\n\n`;

    const spNumbers = [];
    for (const property of properties) {
      const { type, key } = property;

      if (type === DataType.Money || type === DataType.BigInt) {
        spNumbers.push(
          `${key}: ${variableName}.${key} ? +${variableName}.${key} : null,`,
        );
      }
    }

    if (spNumbers.length) {
      output += `${p4}return {\n${p6}${camelPluralizeName}: ${camelPluralizeName}.map((${variableName}) => {\n${p8}return {\n${p10}...${variableName},\n`;

      for (const item of spNumbers) {
        output += `${p10}${item}\n`;
      }

      output += `${p8}};\n${p6}}),\n${p6}paging: pagingResponse(paging, totalCount),\n${p4}};\n${p2}}\n\n`;
    } else {
      output += `${p4}return {\n${p6}${camelPluralizeName},\n${p6}paging: pagingResponse(paging, totalCount),\n${p4}};\n${p2}}\n\n`;
    }

    return output;
  }

  private writeCreateMethod(): string {
    const { className, variableName, properties, modelRelations, modelName } =
      this;

    const relationCount = this.calRelationCount(modelName);

    let output = `${p2}async createNew${className}(\n${p4}me: UserModel,\n${p4}input: New${className}Input,\n`;

    if (relationCount) {
      output += `${p4}include: ${className}FindInclude,\n`;
    }

    output += `${p2}): Promise<${className}Model> {\n`;

    output += `${p4}let new${className};\n\n`;

    const creationOutput = `${p10}...input,\n`;

    output += `${p4}try {\n${p6}new${className} = await this.prisma.${variableName}.create({\n${p8}data: {\n`;

    output += creationOutput;

    output += `${p10}creatorId: me.id,\n${p10}modifierId: me.id,\n${p8}},\n`;

    if (relationCount) {
      output += `${p8}include: include\n${p10}? {\n`;

      const { o2o, o2m, m2o, m2m } = modelRelations[modelName];

      for (const item of o2o) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of o2m) {
        if (item.deepKey) {
          output += `${p14}${item.key}: include.${item.key}\n${p16}? {\n${p20}include: {\n`;

          output += item.deepKey.reduce((prev, curr) => {
            return prev + `${p22}${curr}: true,\n`;
          }, '');

          output += `${p20}},\n${p20}where: {\n${p22}deletedAt: null,\n${p20}},\n${p18}}\n${p14}: false,\n`;
        } else {
          output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
        }
      }

      for (const item of m2o) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of m2m) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }
      output += `${p12}}\n${p10}: null,\n
      
    const relationCount = this.calRelationCount(modelName);
    `;
    }

    output += `${p6}});\n`;

    output += `${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.CREATE'),\n${p12}model: ${className}Service.moduleName,\n${p12}method: 'createNew${className}',\n${p12}msg: psmErrorMsg(e.code),\n${p10}},\n${p10}lang: I18nContext.current()?.lang,\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleId: new${className}.id,\n${p6}moduleName: ${className}Service.moduleName,\n${p6}action: 'create',\n${p6}additionalInfo: JSON.stringify(input),\n${p4}});\n\n`;
    }

    const spNumbers = [];
    for (const property of properties) {
      const { type, key } = property;

      if (type === DataType.Money || type === DataType.BigInt) {
        spNumbers.push(
          `${key}: new${className}.${key} ? +new${className}.${key} : null,`,
        );
      }
    }

    if (spNumbers.length) {
      output += `${p4}return {\n${p6}...new${className},\n`;

      for (const item of spNumbers) {
        output += `${p6}${item}\n`;
      }

      output += `${p4}};\n${p2}}\n\n`;
    } else {
      output += `${p4}return new${className};\n${p2}}\n\n`;
    }

    return output;
  }

  private writeUpdateMethod(): string {
    const { className, variableName, properties, modelRelations, modelName } =
      this;

    const relationCount = this.calRelationCount(modelName);

    let output = `${p2}async update${className}(\n${p4}me: UserModel,\n${p4}${variableName}Id: number,\n${p4}input: Edit${className}Input,\n`;

    if (relationCount) {
      output += `${p4}include: ${className}FindInclude,\n`;
    }

    output += `${p2}): Promise<${className}Model> {\n`;

    output += `${p4}const old${className} = await this.get${className}Detail(${variableName}Id);\n\n`;

    output += `${p4}let new${className};\n\n`;

    const updatingOutput = `${p10}...input,\n`;

    output += `${p4}try {\n${p6}new${className} = await this.prisma.${variableName}.update({\n${p8}data: {\n`;

    output += updatingOutput;

    output += `${p10}version: {\n${p12}increment: 1,\n${p10}},\n${p10}modifierId: me.id,\n${p8}},\n${p8}where: {\n${p10}id: ${variableName}Id,\n${p10}version: old${className}.version,\n${p8}},\n`;

    if (relationCount) {
      output += `${p8}include: include\n${p10}? {\n`;

      const { o2o, o2m, m2o, m2m } = modelRelations[modelName];

      for (const item of o2o) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of o2m) {
        if (item.deepKey) {
          output += `${p14}${item.key}: include.${item.key}\n${p16}? {\n${p20}include: {\n`;

          output += item.deepKey.reduce((prev, curr) => {
            return prev + `${p22}${curr}: true,\n`;
          }, '');

          output += `${p20}},\n${p20}where: {\n${p22}deletedAt: null,\n${p20}},\n${p18}}\n${p14}: false,\n`;
        } else {
          output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
        }
      }

      for (const item of m2o) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }

      for (const item of m2m) {
        output += `${p14}${item.key}: include.${item.key} ?? false,\n`;
      }
      output += `${p12}}\n${p10}: null,\n`;
    }

    output += `${p6}});\n`;

    output += `${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.UPDATE'),\n${p12}model: ${className}Service.moduleName,\n${p12}method: 'update${className}',\n${p12}msg: psmErrorMsg(e.code),\n${p10}},\n${p10}lang: I18nContext.current()?.lang,\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}const changes = {};\n`;
      output += `${p4}for (const key in input) {\n${p6}if (old${className}[key] !== input[key]) {\n${p8}changes[key] = {\n${p10}from: old${className}[key],\n${p10}to: input[key],\n${p8}};\n${p6}}\n${p4}}\n\n`;
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleId: ${variableName}Id,\n${p6}moduleName: ${className}Service.moduleName,\n${p6}action: 'update',\n${p6}additionalInfo: JSON.stringify({\n${p8}changes,\n${p6}}),\n${p4}});\n\n`;
    }

    const spNumbers = [];
    for (const property of properties) {
      const { type, key } = property;

      if (type === DataType.Money || type === DataType.BigInt) {
        spNumbers.push(
          `${key}: new${className}.${key} ? +new${className}.${key} : null,`,
        );
      }
    }

    if (spNumbers.length) {
      output += `${p4}return {\n${p6}...new${className},\n`;

      for (const item of spNumbers) {
        output += `${p6}${item}\n`;
      }

      output += `${p4}};\n${p2}}\n\n`;
    } else {
      output += `${p4}return new${className};\n${p2}}\n\n`;
    }

    return output;
  }

  private writeDeleteMethod(): string {
    const { className, variableName } = this;
    let output = `${p2}async delete${className}(me: UserModel, ${variableName}Id: number): Promise<boolean> {\n`;
    output += `${p4}const old${className} = await this.prisma.${variableName}.findFirst({\n${p6}where: {\n${p8}id: ${variableName}Id,\n${p8}deletedAt: null,\n${p6}},\n${p4}});\n\n`;

    output += `${p4}if (!old${className}) {\n${p6}return true;\n${p4}}\n\n`;

    output += `${p4}const now = dayjs().toDate();\n\n`;

    output += `${p4}// TODO: Delete Relations\n`;

    output += `${p4}try {\n${p6}await this.prisma.${variableName}.update({\n${p8}where: {\n${p10}id: ${variableName}Id,\n${p8}},\n${p8}data: {\n${p10}deletedAt: now,\n${p10}modifierId: me.id,\n${p10}// TODO: Delete Relations\n${p8}},\n${p6}});\n${p4}} catch (e) {\n${p6}Logger.error(e.message);\n${p6}throw new InternalServerErrorException(\n${p8}await this.i18n.t('general.INTERNAL_SERVER_ERROR', {\n${p10}args: {\n${p12}action: await this.i18n.t('db.DELETE'),\n${p12}model: ${className}Service.moduleName,\n${p12}method: 'delete${className}',\n${p12}msg: psmErrorMsg(e.code),\n${p10}},\n${p10}lang: I18nContext.current()?.lang,\n${p8}}),\n${p6});\n${p4}}\n\n`;

    if (this.ifLog) {
      output += `${p4}await this.logService.createLog({\n${p6}userId: me.id,\n${p6}moduleId: ${variableName}Id,\n${p6}moduleName: ${className}Service.moduleName,\n${p6}action: 'delete',\n${p6}additionalInfo: JSON.stringify({\n${p8}relations: {\n${p10}// TODO: Record Deleted Realtions\n${p8}},\n${p6}}),\n${p4}});\n\n`;
    }

    output += `${p4}return true;\n${p2}}\n\n`;

    return output;
  }

  private writeListLogsMethod(): string {
    const { className, variableName } = this;
    let output = `${p2}async get${className}Logs(${variableName}Id: number): Promise<LogModel[]> {\n`;
    output += `${p4}const ${variableName}Logs = await this.logService.getLogList({\n${p6}moduleId: ${variableName}Id,\n${p6}moduleName: ${className}Service.moduleName,\n${p4}});\n\n`;

    output += `${p4}return ${variableName}Logs;\n${p2}}\n`;

    return output;
  }

  private calRelationCount(modelName: string): number {
    const { o2o, o2m, m2o, m2m } = this.modelRelations[modelName];

    return o2o.length + o2m.length + m2o.length + m2m.length;
  }
}
