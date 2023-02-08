import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class ModuleGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'module';
    this.models = params.models;

    this.output += this.writeDependencies();
    this.output += this.writeModuleClass();
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile(this.moduleName, ifReplace);
  }

  private writeDependencies(): string {
    const { moduleName, className } = this;
    const output = `import { Module } from '@nestjs/common';\nimport { ${className}Service } from './services/${moduleName}.service';\nimport { ${className}Resolver } from './resolvers/${moduleName}.resolver';\n\n`;

    return output;
  }

  private writeModuleClass(): string {
    const { className } = this;

    const output = `@Module({\n  providers: [${className}Service, ${className}Resolver],\n  exports: [${className}Service],\n})\nexport class ${className}Module {}\n`;

    return output;
  }
}
