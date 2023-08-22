import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import { p2 } from '../utils/pad.util';

export class PagingObjectGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'object';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeModelDependencies();
    this.output += this.writePagingClass();
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('dto/paging', ifReplace);
  }

  private writeGqlDependencies(): string {
    return `import { PagingInfo } from '@Dto/paging-info.object';\nimport { Field, ObjectType } from '@nestjs/graphql';\n\n`;
  }

  private writeModelDependencies(): string {
    return `import { ${this.className}Model } from '@Module/${this.moduleName}/models/${this.moduleName}.model';\n\n`;
  }

  private writePagingClass(): string {
    let output = `@ObjectType({\n${p2}description: '${this.uppperCamelPluralizeName} With Paging',\n})\n`;
    output += `export class ${this.uppperCamelPluralizeName}WithPaging {\n${p2}@Field(() => [${this.className}Model])\n${p2}${this.camelPluralizeName}: ${this.className}Model[];\n\n${p2}@Field(() => PagingInfo)\n${p2}paging: PagingInfo;\n}\n`;

    return output;
  }
}
