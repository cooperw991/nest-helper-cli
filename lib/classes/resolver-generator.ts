import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import { p2, p4, p6 } from '../utils/pad.util';

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
    output += `import {\n${p2}Resolver,\n${p2}Query,\n${p2}Mutation,\n${p2}Args,\n${p2}Int,\n${p2}ResolveField,\n${p2}Root,\n${p2}Context,\n} from '@nestjs/graphql';\n\n`;

    output += `import { UserDecorator } from '@Decorator/user.decorator';\nimport { Managers } from '@Dto/managers.object';\nimport { PagingQuery } from '@Dto/paging-query.input';\nimport { GqlAuthGuard } from '@Guard/auth.guard';\nimport { AppGraphqlContext } from '@Interface/app-graphql-context.interface';\nimport { UserModel } from '@Module/user/models/user.model';\n\n`;

    output += `import { Edit${className}Input } from '../dto/edit-${moduleName}.input';\nimport { ${className}FindFilter } from '../dto/find-filter.input';\nimport { ${className}FindInclude } from '../dto/find-include.input';\nimport { ${className}FindOrder } from '../dto/find-order.input';\nimport { New${className}Input } from '../dto/new-${moduleName}.input';\nimport { ${uppperCamelPluralizeName}WithPaging } from '../dto/paging.object';\nimport { ${className}Model } from '../models/${moduleName}.model';\nimport { ${className}Service } from '../services/${moduleName}.service';\n\n`;

    return output;
  }

  private writeResolverClass(): string {
    const { className, variableName } = this;

    let output = `@Resolver(() => ${className}Model)\n`;
    output += `export class ${className}Resolver {\n`;
    output += `${p2}constructor(private ${variableName}Service: ${className}Service) {}\n\n`;

    return output;
  }

  private writeGetMethod(): string {
    const { className, variableName } = this;

    let output = `${p2}@Query(() => ${className}Model, {\n${p4}description: 'Get ${className} By Id',\n${p2}})\n${p2}@UseGuards(GqlAuthGuard)\n`;

    output += `${p2}async get${className}Detail(\n${p4}@Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n${p4}@Args({ name: 'include', type: () => ${className}FindInclude }) include: ${className}FindInclude,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}return this.${variableName}Service.get${className}Detail(${variableName}Id, include);\n${p2}}\n\n`;

    return output;
  }

  private writeListMethod(): string {
    const { className, variableName, uppperCamelPluralizeName } = this;

    let output = `${p2}@Query(() => ${uppperCamelPluralizeName}WithPaging, {\n${p4}description: 'List ${uppperCamelPluralizeName} With Paging',\n${p2}})\n${p2}@UseGuards(GqlAuthGuard)\n`;

    output += `${p2}async get${className}List(\n${p4}@Args({ name: 'where', type: () => ${className}FindFilter, nullable: true }) where: ${className}FindFilter,\n${p4}@Args({ name: 'order', type: () => [${className}FindOrder], nullable: true }) order: ${className}FindOrder[],\n${p4}@Args({ name: 'paging', type: () => PagingQuery, nullable: true }) paging: PagingQuery,\n${p4}@Args({ name: 'include', type: () => ${className}FindInclude, nullable: true }) include: ${className}FindInclude,\n${p2}): Promise<${uppperCamelPluralizeName}WithPaging> {\n`;

    output += `${p4}return this.${variableName}Service.get${className}List(where, order, paging, include);\n${p2}}\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { className, variableName } = this;

    let output = `${p2}@Mutation(() => ${className}Model, {\n${p4}description: 'Create New ${className} Record',\n${p2}})\n${p2}@Roles(RoleLimit.ALL)\n${p2}@UseGuards(RoleGuard)\n${p2}@UseGuards(GqlAuthGuard)\n`;

    output += `${p2}async createNew${className}(\n${p4}@UserDecorator() me: UserModel,\n${p4}@Args({ name: 'input', type: () => New${className}Input }) input: New${className}Input,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}return this.${variableName}Service.createNew${className}(me, input);\n${p2}}\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { className, variableName } = this;

    let output = `${p2}@Mutation(() => ${className}Model, {\n${p4}description: 'Update ${className} Record',\n${p2}})\n${p2}@Roles(RoleLimit.ALL)\n${p2}@UseGuards(RoleGuard)\n${p2}@UseGuards(GqlAuthGuard)\n`;

    output += `${p2}async update${className}(\n${p4}@UserDecorator() me: UserModel,\n${p4}@Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n${p4}@Args({ name: 'input', type: () => Edit${className}Input }) input: Edit${className}Input,\n${p2}): Promise<${className}Model> {\n`;

    output += `${p4}return this.${variableName}Service.update${className}(me, ${variableName}Id, input);\n${p2}}\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { className, variableName } = this;

    let output = `${p2}@Mutation(() => Boolean, {\n${p4}description: 'Delete ${className} Record',\n${p2}})\n${p2}@Roles(RoleLimit.ALL)\n${p2}@UseGuards(RoleGuard)\n${p2}@UseGuards(GqlAuthGuard)\n`;

    output += `${p2}async delete${className}(\n${p4}@UserDecorator() me: UserModel,\n${p4}@Args({ name: '${variableName}Id', type: () => Int }) ${variableName}Id: number,\n${p2}): Promise<boolean> {\n`;

    output += `${p4}return this.${variableName}Service.delete${className}(me, ${variableName}Id);\n${p2}}\n\n`;

    return output;
  }

  private writeManagers(): string {
    const { className, variableName } = this;

    let output = `${p2}@ResolveField('managers', () => Managers)\n`;

    output += `${p2}async managers(\n${p4}@Root() ${variableName}: ${className}Model,\n${p4}@Context() ctx: AppGraphqlContext<Managers>,\n${p2}): Promise<Managers> {\n`;

    output += `${p4}if (!${variableName}.creatorId && !${variableName}.modifierId) {\n${p6}return {\n$createdBy: null,\n$modifiedBy: null,\n${p6}};\n${p4}}\n${p4}return ctx.managersLoader.load({\n${p6}creatorId: ${variableName}.creatorId,\n${p6}modifierId: ${variableName}.modifierId,\n${p4}});\n${p2}}\n`;

    return output;
  }
}
