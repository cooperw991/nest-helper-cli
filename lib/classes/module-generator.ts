import { FileGenerator } from './file-generator';

export class ModuleGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
    this.suffix = 'module';
    this.output += this.writeDependencies();
    this.output += this.writeClass();
  }

  protected idType: string;

  public async generateFile() {
    await this.writeFile(this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName } = this;
    let output = `import { Module } from '@nestjs/common';\n`;

    output += `import { ${modelName}Service } from '@Module/${moduleName}/services/${moduleName}.service';\n`;
    output += `import { ${modelName}Resolver } from '@Module/${moduleName}/resolvers/${moduleName}.resolver';\n\n`;

    return output;
  }

  private writeClass(): string {
    const { modelName } = this;

    let output = `@Module({\n`;
    output += `  providers: [${modelName}Service, ${modelName}Resolver],\n`;
    output += `  exports: [${modelName}Service],\n`;
    output += `})\nexport class ${modelName}Module {}\n`;

    return output;
  }
}
