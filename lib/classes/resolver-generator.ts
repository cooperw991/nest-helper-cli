import * as R from 'ramda';

import { FileGenerator } from './file-generator';

export class ResolverGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
    this.suffix = 'resolver';
    this.enums = [];
    this.getIdType();
    this.output += this.writeDependencies();
    this.output += this.writeClass();
  }

  protected enums: string[];
  protected idType: string;
  protected gqlType: string;

  public generateFile() {
    this.writeFile('resolvers/' + this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName, uppperCamelPluralizeName } = this;
    let output = `import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';\n\n`;
    output += `import { UserEntity } from '@Decorator/user.decorator';\nimport { PagingQuery } from '@Dto/paging-query.input';\n`;
    output += `import { User as UserModel } from '@Module/user/models/user.model';\n`;

    output += `import { ${modelName} } from '../models/${moduleName}.model';\n`;
    output += `import { New${modelName}Input } from '../dto/new-${moduleName}.input';\nimport { Edit${modelName}Input } from '../dto/edit-${moduleName}.input';\nimport { ${uppperCamelPluralizeName}FindFilter } from '../dto/find-filter.input';\nimport { ${uppperCamelPluralizeName}FindOrder } from '../dto/find-order.input';\nimport { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.dto';\nimport { ${modelName}Service } from '../services/${moduleName}.service';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { modelName } = this;

    let output = `@Resolver(() => ${modelName})\nexport class ${modelName}Resolver {\n`;
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
    const { variableName, modelName } = this;
    const output = `  constructor(private ${variableName}Service: ${modelName}Service) {}\n\n`;
    return output;
  }

  private writeFindMethod(): string {
    const { modelName, variableName, idType, gqlType } = this;

    let output = `  @Query(() => ${modelName})\n`;
    output += `  async find${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n  ): Promise<${modelName}> {\n    return this.${variableName}Service.find${modelName}(${variableName}Id);\n  }\n\n`;

    return output;
  }

  private writeFilterMethod(): string {
    const { variableName, uppperCamelPluralizeName } = this;

    let output = `  @Query(() => ${uppperCamelPluralizeName}WithPaging)\n`;
    output += `  async find${uppperCamelPluralizeName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: 'where', type: () => ${uppperCamelPluralizeName}FindFilter, nullable: true })\n    where: ${uppperCamelPluralizeName}FindFilter,\n    @Args({ name: 'order', type: () => [${uppperCamelPluralizeName}FindOrder], nullable: true })\n    order: ${uppperCamelPluralizeName}FindOrder[],\n    @Args({ name: 'paging', type: () => PagingQuery, nullable: true })\n    paging: PagingQuery,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n    return this.${variableName}Service.find${uppperCamelPluralizeName}(where, order, paging);\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { modelName, variableName } = this;

    let output = `  @Mutation(() => ${modelName})\n`;
    output += `  async create${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: 'input', type: () => New${modelName}Input }) input: New${modelName}Input,\n  ): Promise<${modelName}> {\n    return this.${variableName}Service.create${modelName}(input);\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { modelName, variableName, idType, gqlType } = this;

    let output = `  @Mutation(() => ${modelName})\n`;
    output += `  async update${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n    @Args({ name: 'input', type: () => Edit${modelName}Input }) input: Edit${modelName}Input,\n  ): Promise<${modelName}> {\n    return this.${variableName}Service.update${modelName}(${variableName}Id, input);\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { modelName, variableName, idType, gqlType } = this;

    let output = `  @Mutation(() => Boolean)\n`;
    output += `  async delete${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n  ): Promise<boolean> {\n    return this.${variableName}Service.delete${modelName}(${variableName}Id);\n  }\n`;

    return output;
  }

  private getIdType() {
    const { data } = this;

    const idLine = data.find((line) => R.includes('@id', line)) || [];
    this.idType = idLine[1] === 'String' ? 'string' : 'number';
    this.gqlType = idLine[1] ?? 'Int';
  }
}
