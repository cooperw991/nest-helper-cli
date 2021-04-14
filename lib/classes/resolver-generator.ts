import {
  EntityJsonInterface,
  EntityJsonColumnInterface,
} from '../interfaces/entity-json.interface';
import { BaseGenerator } from './base-generator';

export class ResolverGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'resolver';
    this.servName = this.variableName + 'Serv';
    this.output += this.writeLibDependencies();
    this.output += this.writeHelperDependencies();
    this.output += this.writeResolver();
  }

  private servName: string;

  public generateFile() {
    this.writeFile(this.moduleName);
  }

  private writeLibDependencies(): string {
    let output = `import {\n  Resolver,\n  Query,\n  Args,\n  Mutation,\n  ResolveProperty,\n  Context,\n  Root,\n} from '@nestjs/graphql';\n`;

    output += `import { Inject, UseGuards } from '@nestjs/common';\n`;
    output += `import { Int } from 'type-graphql';\n\n`;

    return output;
  }

  private writeHelperDependencies(): string {
    const {
      uppperCamelPluralizeName,
      className,
      moduleName,
      dasherizePluralizeName,
    } = this;
    let output = '';

    output += `import { User as Me } from '../../common/decorators/user.decorator';\n`;

    output += `import { GqlAuthGuard } from '../../common/guards/auth.guard';\n`;

    output += `import { PagingQuery } from '../../common/interfaces/paging-query.interface';\n`;

    output += `import { AppGraphqlContext } from '../../common/interfaces/app_graphql_context.interface';\n\n`;

    output += `import { User } from '../user/user.entity';\n\n`;

    output += `import { ${uppperCamelPluralizeName}WithPaging } from './dto/${dasherizePluralizeName}-with-paging.dto';\n`;

    output += `import { Create${className}Input } from './interfaces/create-${moduleName}.interface';\n`;

    output += `import { Update${className}Input } from './interfaces/update-${moduleName}.interface';\n`;

    output += `import { ${uppperCamelPluralizeName}Filter } from './interfaces/filterby-${moduleName}.interface';\n`;

    output += `import { ${uppperCamelPluralizeName}Order } from './interfaces/orderby-${moduleName}.interface';\n`;

    output += `import { ${className} } from './${moduleName}.entity';\n`;

    output += `import { ${className}Service } from './${moduleName}.service';\n\n`;

    return output;
  }

  private writeResolver(): string {
    const { className, servName } = this;
    let output = `@Resolver(() => ${className})\nexport class ${className}Resolver {\n`;

    output += `  constructor(\n    @Inject(${className}Service) private readonly ${servName}: ${className}Service,\n  ) {}\n\n`;

    output += this.writeFindOneMethod();
    output += this.writeListMethod();
    output += this.writeCreateMethod();
    output += this.writeUpdateMethod();
    output += this.writeDeleteMethod();
    output += this.writeProperties();

    output = output.replace(/\n$/gi, `}\n`);
    return output;
  }

  private writeCreateMethod(): string {
    const { servName, className, variableName } = this;

    let output = `  @Mutation(() => ${className}, {\n    description: 'Create new ${variableName}',\n  })\n`;

    output += `  @UseGuards(GqlAuthGuard)\n`;
    output += `  async create${className}(\n    @Me() me: User,\n    @Args({\n      name: 'createInput',\n      type: () => Create${className}Input,\n    })\n    createInput: Create${className}Input,\n  ): Promise<${className}> {\n    return this.${servName}.create(me, createInput);\n  }\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { servName, className, variableName } = this;

    let output = `  @Mutation(() => ${className}, {\n    description: 'Update ${variableName}',\n  })\n`;

    output += `  @UseGuards(GqlAuthGuard)\n`;
    output += `  async update${className}(\n    @Me() me: User,\n    @Args({\n      name: '${variableName}Id',\n      type: () => Int,\n    })\n    ${variableName}Id: number,\n    @Args({\n      name: 'updateInput',\n      type: () => Update${className}Input,\n    })\n    updateInput: Update${className}Input,\n  ): Promise<${className}> {\n    return this.${servName}.update(me, ${variableName}Id, updateInput);\n  }\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { servName, className, variableName } = this;

    let output = `  @Mutation(() => Boolean, {\n    description: 'Delete ${variableName}',\n  })\n`;

    output += `  @UseGuards(GqlAuthGuard)\n`;
    output += `  async delete${className}(\n    @Me() me: User,\n    @Args({\n      name: '${variableName}Id',\n      type: () => Int,\n    })\n    ${variableName}Id: number,\n  ): Promise<boolean> {\n    return this.${servName}.delete(me, ${variableName}Id);\n  }\n\n`;

    return output;
  }

  private writeFindOneMethod(): string {
    const { servName, className, variableName } = this;

    let output = `  @Query(() => ${className}, {\n    description: 'Query ${variableName} Record',\n  })\n`;

    output += `  @UseGuards(GqlAuthGuard)\n`;
    output += `  async get${className}(\n    @Me() me: User,\n    @Args({\n      name: '${variableName}Id',\n      type: () => Int,\n    })\n    ${variableName}Id: number,\n  ): Promise<${className}> {\n    return this.${servName}.findOne(me, ${variableName}Id);\n  }\n\n`;

    return output;
  }

  private writeListMethod(): string {
    const { servName, variableName, uppperCamelPluralizeName } = this;

    let output = `  @Query(() => ${uppperCamelPluralizeName}WithPaging, {\n    description: 'List ${variableName} Records',\n  })\n`;

    output += `  @UseGuards(GqlAuthGuard)\n`;

    output += `  async list${uppperCamelPluralizeName}(\n    @Me() me: User,\n    @Args({\n      name: 'filter',\n      type: () => ${uppperCamelPluralizeName}Filter,\n      nullable: true,\n    })\n    filter: ${uppperCamelPluralizeName}Filter,\n    @Args({\n      name: 'filter',\n      type: () => ${uppperCamelPluralizeName}Order,\n      nullable: true,\n    })\n    order: ${uppperCamelPluralizeName}Order,\n    @Args({\n      name: 'paging',\n      type: () => PagingQuery,\n      nullable: true,\n    })\n    paging: PagingQuery,\n  ): Promise<${uppperCamelPluralizeName}WithPaging> {\n    return this.${servName}.list(me, paging, filter, order);\n  }\n\n`;

    return output;
  }

  private writeProperties(): string {
    const { variableName } = this;

    let output = `  @ResolveProperty('createdBy', () => User)\n  async createdBy(\n    @Root() ${variableName}: ${this.className},\n    @Context() ctx: AppGraphqlContext,\n  ): Promise<User> {\n    return ctx.userLoader.load(${variableName}.createdById);\n  }\n\n`;

    output += `  @ResolveProperty('updatedBy', () => User)\n  async updatedBy(\n    @Root() ${variableName}: ${this.className},\n    @Context() ctx: AppGraphqlContext,\n  ): Promise<User> {\n    return ctx.userLoader.load(${variableName}.updatedById);\n  }\n\n`;

    return output;
  }
}
