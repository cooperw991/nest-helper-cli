import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class PagingObjectGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'object';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeModelDependencies();
    this.output += this.writePagingClass();
  }

  public async generateFile() {
    await this.writeFile('dto/paging');
  }

  private writeGqlDependencies(): string {
    return `import { Field, ObjectType } from '@nestjs/graphql';\nimport { PagingInfo } from '@Dto/paging-info.dto';\n\n`;
  }

  private writeModelDependencies(): string {
    return `import { ${this.className}Model } from '@Module/${this.moduleName}/models/${this.moduleName}.model';\n\n`;
  }

  private writePagingClass(): string {
    let output = `@ObjectType({\n  description: '',\n})\n`;
    output += `export class ${this.uppperCamelPluralizeName}WithPaging {\n  @Field(() => [${this.className}Model])\n  ${this.camelPluralizeName}: ${this.className}Model[];\n\n  @Field(() => PagingInfo)\n  paging: PagingInfo;\n}\n`;

    return output;
  }
}
