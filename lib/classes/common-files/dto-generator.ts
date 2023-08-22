import { BaseHandler } from './base-handler';

export class CommonDTOsGenerator extends BaseHandler {
  constructor() {
    super();

    this.generateDTOCreatorAndModifier();
    this.generateDTOPagingInfo();
  }

  public async generateFiles() {
    await this.writeFile('creator-and-modifier.object.ts', 'dto');
    await this.writeFile('paging-info.object.ts', 'dto');
  }

  private generateDTOCreatorAndModifier() {
    let output = `import { Field, ObjectType } from 'type-graphql';\n\n`;

    output += `import { UserModel } from '@Module/user/user.entity';\n\n`;

    output += `@ObjectType()\nexport class CreatorAndModifier {\n  @Field(() => UserModel, { nullable: true })\n  creator: UserModel | null;\n\n  @Field(() => UserModel, { nullable: true })\n  lastModifier: UserModel | null;\n}\n`;

    this.outputs['creator-and-modifier.object.ts'] = output;
  }

  private generateDTOPagingInfo() {
    let output = `import { Field, ObjectType, Int } from 'type-graphql';\n\n`;

    output += `@ObjectType()\nexport class PagingInfo {\n  @Field(() => Int)\n  totalCount: number;\n\n  @Field(() => Int)\n  currentOffset: number;\n\n  @Field(() => Int)\n  currentLimit: number;\n}\n`;

    this.outputs['paging-info.object.ts'] = output;
  }
}
