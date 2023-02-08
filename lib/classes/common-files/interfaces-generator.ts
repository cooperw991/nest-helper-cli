import { BaseHandler } from './base-handler';

export class CommonInterfacesGenerator extends BaseHandler {
  constructor() {
    super();

    this.generateGqlContextInterface();
    this.generatePagingQueryInterface();
  }

  public async generateFiles() {
    await this.writeFile('app-graphql-context.interface.ts', 'interfaces');
    await this.writeFile('paging-query.interface.ts', 'interfaces');
  }

  private generateGqlContextInterface() {
    let output = `import * as Dataloader from 'dataloader';\n\n`;

    output += `import { CreatorAndModifier } from '../dto/creator-and-modifier.object';\n\n`;

    output += `export interface AppGraphqlContext {\n  req: Request;\n  res: Response;\n  creatorAndModifierLoader: Dataloader<[number, number], CreatorAndModifier>\n}\n`;

    this.outputs['app-graphql-context.interface.ts'] = output;
  }

  private generatePagingQueryInterface() {
    let output = `import { Field, InputType, Int } from 'type-graphql';\n\n`;

    output += `@InputType()\nexport class PagingQuery {\n  @Field(() => Int, { nullable: true })\n  offset: number;\n\n  @Field(() => Int, { nullable: true })\n  limit: number;\n}\n`;

    this.outputs['paging-query.interface.ts'] = output;
  }
}
