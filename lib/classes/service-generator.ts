import {
  EntityJsonInterface,
  EntityJsonColumnInterface,
} from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class ServiceGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'service';
    this.repoName = this.variableName + 'Repo';
    this.pickColumns();
    this.output += this.writeLibDependencies();
    this.output += this.writeHelperDependencies();
    this.output += this.writeService();
  }

  private repoName: string;
  private columns: EntityJsonColumnInterface[];

  public generateFile() {
    this.writeFile(this.moduleName);
  }

  private pickColumns() {
    const { columns } = this.data;
    this.columns = [];

    for (const col of columns) {
      if (col.api?.filter) {
        this.columns.push(col);
      }
    }
  }

  private writeLibDependencies(): string {
    return `import {\n  Injectable,\n  InternalServerErrorException,\n  GoneException,\n} from '@nestjs/common';\nimport { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\n\n`;
  }

  private writeHelperDependencies(): string {
    const {
      uppperCamelPluralizeName,
      className,
      moduleName,
      dasherizePluralizeName,
    } = this;
    let output = '';

    output += `import { errorMsg } from '../../common/utils/errors.utility';\n`;

    output += `import { splitWordsBySymbol } from '../../common/utils/words.utility';\n`;

    output += `import {\n  pagingResponse,\n  fillWithDefaultPaging,\n} from '../../common/utils/pagination.utility';\n`;

    output += `import { PagingQuery } from '../../common/interfaces/paging-query.interface';\n`;

    output += `import { User } from '../user/user.entity';\n\n`;

    output += `import { ${uppperCamelPluralizeName}WithPaging } from './dto/${dasherizePluralizeName}-with-paging.dto';\n`;

    output += `import { Create${className}Input } from './interfaces/create-${moduleName}.interface';\n`;

    output += `import { Update${className}Input } from './interfaces/update-${moduleName}.interface';\n`;

    output += `import { ${uppperCamelPluralizeName}Filter } from './interfaces/filterby-${moduleName}.interface';\n`;

    output += `import { ${uppperCamelPluralizeName}Order } from './interfaces/orderby-${moduleName}.interface';\n`;

    output += `import { ${className} } from './${moduleName}.entity';\n\n`;

    return output;
  }

  private writeService(): string {
    const {
      className,
      repoName,
      data: { isSoftDelete },
    } = this;
    let output = `@Injectable()\nexport class ${className}Service {\n`;

    output += `  constructor(\n    @InjectRepository(${className})\n    private readonly ${repoName}: Repository<${className}>,\n  ) {}\n\n`;

    output += this.writeFindOneMethod();
    output += this.writeListMethod();
    output += this.writeCreateMethod();
    output += this.writeUpdateMethod();
    if (isSoftDelete) {
      output += this.writeSoftDeleteMethod();
    } else {
      output += this.writeDeleteMethod();
    }

    output = output.replace(/\n$/gi, `}\n`);
    return output;
  }

  private writeCreateMethod(): string {
    const { repoName, className, variableName } = this;

    let output = `  async create(me: User, input: Create${className}Input): Promise<${className}> {\n`;

    output += `    let new${className} = this.${repoName}.create({\n      ...input,\n      createdById: me.id,\n      updatedById: me.id,\n    });\n\n`;

    output += `    try {\n      new${className} = await this.${repoName}.save(new${className});\n    } catch (e) {\n      throw new InternalServerErrorException(\n        errorMsg(['Create New ${variableName} Failed']).INTERNAL_SERVER_ERROR,\n      );\n    }\n\n    return new${className};\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { repoName, className, variableName } = this;

    let output = `  async update(\n    me: User,\n    ${variableName}Id: number,\n    input: Update${className}Input,\n  ): Promise<${className}> {\n`;

    output += `    const old${className} = await this.findOne(me, ${variableName}Id);\n\n`;

    output += `    let new${className};\n\n`;

    output += `    try {\n      new${className} = await this.${repoName}.save({\n        ...old${className},\n        ...input,\n        updatedById: me.id,\n      });\n    } catch (e) {\n      throw new InternalServerErrorException(\n        errorMsg([\n          'Update ${variableName}(id: ' + ${variableName}Id + ') Failed',\n        ]).INTERNAL_SERVER_ERROR,\n      );\n    }\n    return new${className};\n  }\n\n`;

    return output;
  }

  private writeSoftDeleteMethod(): string {
    const { repoName, variableName } = this;

    let output = `  async softDelete(me: User, ${variableName}Id: number): Promise<boolean> {\n`;

    output += `    const ${variableName} = await this.findOne(me, ${variableName}Id);\n\n`;

    output += `    ${variableName}.deleted = true;\n\n`;

    output += `    try {\n      await this.${repoName}.save(${variableName});\n    } catch (e) {\n      throw new InternalServerErrorException(\n        errorMsg([\n          'Delete ${variableName}(id: ' + ${variableName}Id + ') Failed',\n        ]).INTERNAL_SERVER_ERROR,\n      );\n    }\n    return true;\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { repoName, variableName } = this;

    let output = `  async delete(me: User, ${variableName}Id: number): Promise<boolean> {\n`;

    output += `    try {\n      await this.${repoName}.delete(${variableName}Id);\n    } catch (e) {\n      throw new InternalServerErrorException(\n        errorMsg([\n          'Delete ${variableName}(id: ' + ${variableName}Id + ') Failed',\n        ]).INTERNAL_SERVER_ERROR,\n      );\n    }\n\n    return true;\n  }\n\n`;

    return output;
  }

  private writeFindOneMethod(): string {
    const {
      repoName,
      variableName,
      className,
      data: { isSoftDelete },
    } = this;

    let output = `  async findOne(me: User, ${variableName}Id: number): Promise<${className}> {\n`;

    output += `    const ${variableName} = await this.${repoName}.findOne({\n      where: {\n        id: ${variableName}Id,\n`;

    if (isSoftDelete) {
      output += `        deleted: false,\n`;
    }

    output += `      },\n    });\n\n`;

    output += `    if (!${variableName}) {\n      throw new GoneException(\n        errorMsg(['${className}(id: ' + ${variableName}Id + ')']).NOT_EXIST,\n      );\n    }\n\n    return ${variableName};\n  }\n\n`;

    return output;
  }

  private writeListMethod(): string {
    const { repoName, variableName, uppperCamelPluralizeName, columns } = this;

    let output = `  async list(\n    me: User,\n    paging: PagingQuery,\n    filter: ${uppperCamelPluralizeName}Filter,\n    order: ${uppperCamelPluralizeName}Order,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `    const queryBuilder = this.${repoName}\n      .createQueryBuilder('${variableName}')\n      .orderBy(order ? order.by : '${variableName}.id', order?.asc ? 'ASC' : 'DESC');\n\n`;

    output += `    paging = fillWithDefaultPaging(paging);\n\n`;

    output += `    queryBuilder.take(paging.limit).skip(paging.offset);\n\n`;

    output += `    if (filter !== null) {\n`;

    for (const col of columns) {
      output += `      if (filter.${col.name} !== null) {\n`;
      if (col.type !== 'string') {
        output += `        queryBuilder.andWhere('${variableName}.${col.name} = :${col.name}', {\n          ${col.name}: filter.${col.name},\n        });\n      }\n\n`;
      } else {
        output += `        const words = splitWordsBySymbol(filter.${col.name});\n`;

        output += `        let queryStr = \`LOWER(${variableName}.${col.name}) like LOWER('%\${words[0]}%')\`;\n`;

        output += `        for (let i = 1; i < words.length; i++) {\n          queryStr += \` and LOWER(${variableName}.${col.name}) like LOWER('%\${words[i]}%')\`;\n        }\n`;

        output += `        queryBuilder.andWhere(\`(\${queryStr})\`);\n      }\n\n`;
      }
    }

    output = output.replace(/\n$/gi, `    }\n\n`);

    output += `    try {\n      const [${this.camelPluralizeName}, totalCount] = await queryBuilder.getManyAndCount();\n      return {\n        ${this.camelPluralizeName},\n        paging: pagingResponse(paging, totalCount),\n      };\n`;

    output += `    } catch (e) {\n      throw new InternalServerErrorException(\n        errorMsg(['List ${uppperCamelPluralizeName} failed']).INTERNAL_SERVER_ERROR,\n      );\n    }\n  }\n\n`;

    return output;
  }
}
