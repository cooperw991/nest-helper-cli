import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class ResolverGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'resolver';
    this.models = params.models;

    this.output += this.writeDependencies();
    this.output += this.writeResolverClass();
    this.output += this.writeGetMethod();
    this.output += this.writeListMethod();
    this.output += this.writeCreateMethod();
    this.output += this.writeUpdateMethod();
    this.output += this.writeDeleteMethod();
    this.output += this.writeManagers();

    this.output += `}\n`;
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('resolvers/' + this.moduleName, ifReplace);
  }

  private writeDependencies(): string {
    const { moduleName, className, uppperCamelPluralizeName } = this;
    let output = '';
    output += `import { UseGuards } from '@nestjs/common';\n`;
    output += `import {\n  Resolver,\n  Query,\n  Mutation,\n  Args,\n  Int,\n  ResolveField,\n  Root,\n  Context,\n} from '@nestjs/graphql';\n\n`;

    output += `import { UserDecorator } from '@Decorator/user.decorator';\nimport { Managers } from '@Dto/managers.object';\nimport { PagingQuery } from '@Dto/paging-query.input';\nimport { GqlAuthGuard } from '@Guard/auth.guard';\nimport { AppGraphqlContext } from '@Interface/app-graphql-context.interface';\nimport { UserModel } from '@Module/user/models/user.model';\n\n`;

    output += `import { Edit${className}Input } from '../dto/edit-${moduleName}.input';\nimport { ${className}FindFilter } from '../dto/find-filter.input';\nimport { ${className}FindInclude } from '../dto/find-include.input';\nimport { ${className}FindOrder } from '../dto/find-order.input';\nimport { New${className}Input } from '../dto/new-${moduleName}.input';\nimport { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.object';\nimport { ${className}Model } from '../models/${moduleName}.model';\nimport { ${className}Service } from '../services/${moduleName}.service';\n\n`;

    return output;
  }

  private writeResolverClass(): string {
    const { className, variableName } = this;

    let output = `@Resolver(() => ${className}Model)\n`;
    output += `export class ${className}Resolver {\n`;
    output += `  constructor(private ${variableName}Service: ${className}Service) {}\n\n`;

    return output;
  }

  private writeGetMethod(): string {
    const { className, variableName } = this;

    let output = `  @Query(() => ${className}Model, {\n    description: 'Get ${className} By Id',\n  })\n  @UseGuards(GqlAuthGuard)\n`;

    output += `  async get${className}Detail(\n    @Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n    @Args({ name: 'include', type: () => ${className}FindInclude }) include: ${className}FindInclude,\n  ): Promise<${className}Model> {\n`;

    output += `    return this.${variableName}Service.get${className}Detail(${variableName}Id, include);\n  }\n\n`;

    return output;
  }

  private writeListMethod(): string {
    const { className, variableName, uppperCamelPluralizeName } = this;

    let output = `  @Query(() => ${uppperCamelPluralizeName}WithPaging, {\n    description: 'List ${uppperCamelPluralizeName} With Paging',\n  })\n  @UseGuards(GqlAuthGuard)\n`;

    output += `  async get${className}List(\n    @Args({ name: 'where', type: () => ${className}FindFilter, nullable: true }) where: ${className}FindFilter,\n    @Args({ name: 'order', type: () => [${className}FindOrder], nullable: true }) order: ${className}FindOrder[],\n    @Args({ name: 'paging', type: () => PagingQuery, nullable: true }) paging: PagingQuery,\n    @Args({ name: 'include', type: () => ${className}FindInclude, nullable: true }) include: ${className}FindInclude,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `    return this.${variableName}Service.get${className}List(where, order, paging, include);\n  }\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { className, variableName } = this;

    let output = `  @Mutation(() => ${className}Model, {\n    description: 'Create New ${className} Record',\n  })\n  @Roles(RoleLimit.ALL)\n  @UseGuards(RoleGuard)\n  @UseGuards(GqlAuthGuard)\n`;

    output += `  async createNew${className}(\n    @UserDecorator() me: UserModel,\n    @Args({ name: 'input', type: () => New${className}Input }) input: New${className}Input,\n  ): Promise<${className}Model> {\n`;

    output += `    return this.${variableName}Service.createNew${className}(me, input);\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { className, variableName } = this;

    let output = `  @Mutation(() => ${className}Model, {\n    description: 'Update ${className} Record',\n  })\n  @Roles(RoleLimit.ALL)\n  @UseGuards(RoleGuard)\n  @UseGuards(GqlAuthGuard)\n`;

    output += `  async update${className}(\n    @UserDecorator() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n    @Args({ name: 'input', type: () => Edit${className}Input }) input: Edit${className}Input,\n  ): Promise<${className}Model> {\n`;

    output += `    return this.${variableName}Service.update${className}(me, ${variableName}Id, input);\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { className, variableName } = this;

    let output = `  @Mutation(() => Boolean, {\n    description: 'Delete ${className} Record',\n  })\n  @Roles(RoleLimit.ALL)\n  @UseGuards(RoleGuard)\n  @UseGuards(GqlAuthGuard)\n`;

    output += `  async delete${className}(\n    @UserDecorator() me: UserModel,\n    @Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n  ): Promise<boolean> {\n`;

    output += `    return this.${variableName}Service.delete${className}(me, ${variableName}Id);\n  }\n\n`;

    return output;
  }

  private writeManagers(): string {
    const { className, variableName } = this;

    let output = `  @ResolveField('managers', () => Managers)\n`;

    output += `  async managers(\n    @Root() ${variableName}: ${className}Model,\n    @Context() ctx: AppGraphqlContext<Managers>,\n  ): Promise<Managers> {\n`;

    output += `    if (!${variableName}.creatorId && !${variableName}.modifierId) {\n      return {\n        createdBy: null,\n        modifiedBy: null,\n      };\n    }\n    return ctx.managersLoader.load({\n      creatorId: ${variableName}.creatorId,\n      modifierId: ${variableName}.modifierId,\n    });\n  }\n`;

    return output;
  }
}
