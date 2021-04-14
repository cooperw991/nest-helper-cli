import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { createFile } from '../utils/directory.util';
import { BaseGenerator } from './base-generator';

export class PagingDtoGenerator extends BaseGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'dto';
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writePagingDto();
    this.output += this.writeEntity();
    this.output += this.writeFilterClass();
  }

  public generateFile() {
    this.writeFile(this.dasherizePluralizeName + '-with-paging', 'dto');
    this.createPagingInfoDto();
  }

  private writeTypeGraphqlDependencies(): string {
    return `import { Field, ObjectType } from 'type-graphql';\n`;
  }

  private writePagingDto(): string {
    return `import { PagingInfo } from '../../../common/dto/paging-info.dto';\n`;
  }

  private writeEntity(): string {
    return `import { ${this.className} } from '../${this.moduleName}.entity';\n\n`;
  }

  private writeFilterClass(): string {
    const { className, uppperCamelPluralizeName, camelPluralizeName } = this;

    return `@ObjectType()\nexport class ${uppperCamelPluralizeName}WithPaging {\n  @Field(() => [${className}])\n  ${camelPluralizeName}: ${className}[];\n\n  @Field(() => PagingInfo)\n  paging: PagingInfo;\n}\n`;
  }

  private async createPagingInfoDto() {
    const dirPath = process.cwd() + '/src/common/dto/';

    const output = `import { Field, ObjectType, Int } from 'type-graphql';\n\n@ObjectType()\nexport class PagingInfo {\n  @Field(() => Int)\n  totalCount: number;\n\n  @Field(() => Int)\n  currentOffset: number;\n\n  @Field(() => Int)\n  currentLimit: number;\n}\n`;

    await createFile('paging-info.dto.ts', dirPath, output);
  }
}
