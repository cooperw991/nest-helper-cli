import { FileGenerator } from './file-generator';

export class PagingDTOGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
    this.suffix = 'dto';

    this.output = this.writeDependencies() + this.writeClass();
  }

  public async generateFile() {
    await this.writeFile('dto/paging');
  }

  private writeDependencies(): string {
    const { modelName, moduleName } = this;

    let output = `import { Field, ObjectType } from '@nestjs/graphql';\n`;
    output += `import { PagingInfo } from '@Dto/paging-info.dto';\n`;
    output += `import { ${modelName}Model } from '@Module/${moduleName}/models/${moduleName}.model';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { uppperCamelPluralizeName, camelPluralizeName, modelName } = this;

    let output = `@ObjectType()\nexport class ${uppperCamelPluralizeName}WithPaging {\n`;

    output += `  @Field(() => [${this.modelName}Model])\n  ${camelPluralizeName}: ${modelName}Model[];\n\n  @Field(() => PagingInfo)\n  paging: PagingInfo;\n`;

    output += '}\n';

    return output;
  }
}
