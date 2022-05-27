import { FileGenerator } from './file-generator';

export class ResolverGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][], models: string[]) {
    super(modelName, modelLines);
    this.suffix = 'resolver';
    this.enums = [];
    this.models = models;
    this.getIdType();
    this.output += this.writeDependencies();
    this.output += this.writeClass();
  }

  protected enums: string[];
  protected idType: string;
  protected gqlType: string;

  public async generateFile() {
    await this.writeFile('resolvers/' + this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName, uppperCamelPluralizeName, gqlTypes } = this;

    let output = `import {\n  Resolver,\n  Query,\n  Mutation,\n  Args,\n`;
    for (const gqlType of gqlTypes) {
      output += `  ${gqlType},\n`;
    }
    output += `  ResolveProperty,\n  Context,\n  Root,\n`;
    output += `} from '@nestjs/graphql';\n`;
    output += `import { UseGuards } from '@nestjs/common';\n\n`;
    output += `import { GqlAuthGuard } from '@Guard/auth.guard';\n`;
    output += `import { UserEntity } from '@Decorator/user.decorator';\nimport { PagingQuery } from '@Dto/paging-query.input';\n`;
    output += `import { Managers } from '@Dto/managers.dto';\n`;
    output += `import { AppGraphqlContext } from '@Interface/app-graphql-context.interface';\n`;
    output += `import { UserModel } from '@Module/user/models/user.model';\n`;

    output += `import { ${modelName}Model } from '../models/${moduleName}.model';\n`;
    output += `import { New${modelName}Input } from '../dto/new-${moduleName}.input';\nimport { Edit${modelName}Input } from '../dto/edit-${moduleName}.input';\nimport { ${uppperCamelPluralizeName}FindFilter } from '../dto/find-filter.input';\nimport { ${uppperCamelPluralizeName}FindOrder } from '../dto/find-order.input';\nimport { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.dto';\nimport { ${modelName}Service } from '../services/${moduleName}.service';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { modelName } = this;

    let output = `@Resolver(() => ${modelName}Model)\nexport class ${modelName}Resolver {\n`;
    output += this.writeConstructor();
    output += this.writeFindMethod();
    output += this.writeFilterMethod();
    output += this.writeCreateMethod();
    output += this.writeUpdateMethod();
    output += this.writeDeleteMethod();
    output += this.writeResolveProperty();
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

    let output = `  @Query(() => ${modelName}Model)\n`;
    output += `  @UseGuards(GqlAuthGuard)\n  async find${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n  ): Promise<${modelName}Model> {\n    return this.${variableName}Service.find${modelName}(${variableName}Id);\n  }\n\n`;

    return output;
  }

  private writeFilterMethod(): string {
    const { variableName, uppperCamelPluralizeName } = this;

    let output = `  @Query(() => ${uppperCamelPluralizeName}WithPaging)\n`;
    output += `  @UseGuards(GqlAuthGuard)\n  async find${uppperCamelPluralizeName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: 'where', type: () => ${uppperCamelPluralizeName}FindFilter, nullable: true })\n    where: ${uppperCamelPluralizeName}FindFilter,\n    @Args({ name: 'order', type: () => [${uppperCamelPluralizeName}FindOrder], nullable: true })\n    order: ${uppperCamelPluralizeName}FindOrder[],\n    @Args({ name: 'paging', type: () => PagingQuery, nullable: true })\n    paging: PagingQuery,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n    return this.${variableName}Service.find${uppperCamelPluralizeName}(where, order, paging);\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { modelName, variableName } = this;

    let output = `  @Mutation(() => ${modelName}Model)\n`;
    output += `  @UseGuards(GqlAuthGuard)\n  async create${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: 'input', type: () => New${modelName}Input }) input: New${modelName}Input,\n  ): Promise<${modelName}Model> {\n    return this.${variableName}Service.create${modelName}(input, me.id);\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { modelName, variableName, idType, gqlType } = this;

    let output = `  @Mutation(() => ${modelName}Model)\n`;
    output += `  @UseGuards(GqlAuthGuard)\n  async update${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n    @Args({ name: 'input', type: () => Edit${modelName}Input }) input: Edit${modelName}Input,\n  ): Promise<${modelName}Model> {\n    return this.${variableName}Service.update${modelName}(${variableName}Id, input, me.id);\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { modelName, variableName, idType, gqlType } = this;

    let output = `  @Mutation(() => Boolean)\n`;
    output += `  @UseGuards(GqlAuthGuard)\n  async delete${modelName}(\n    @UserEntity() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => ${gqlType} }) ${variableName}Id: ${idType},\n  ): Promise<boolean> {\n    return this.${variableName}Service.delete${modelName}(${variableName}Id, me.id);\n  }\n\n`;

    return output;
  }

  private writeResolveProperty(): string {
    const { variableName, modelName } = this;

    let output = `  @ResolveProperty('managers', () => Managers)\n`;
    output += `  async managers(\n`;
    output += `    @Root() ${variableName}: ${modelName}Model,\n`;
    output += `    @Context() ctx: AppGraphqlContext<Managers>,\n`;
    output += `  ): Promise<Managers> {\n`;
    output += `    if (!${variableName}.creatorId && !${variableName}.modifierId) {\n`;
    output += `      return {\n`;
    output += `        createdBy: null,\n        modifiedBy: null,\n`;
    output += `      };\n    }\n    return ctx.managersLoader.load([${variableName}.creatorId, ${variableName}.modifierId]);\n  }\n`;

    return output;
  }

  private getIdType() {
    const { data } = this;

    for (const line of data) {
      if (line[1] === 'String') {
        this.idType = 'string';
        this.gqlType = 'String';
      } else {
        this.idType = 'number';
        this.gqlType = 'Int';
      }
      this.parseFieldType(line[1]);
    }
  }
}
