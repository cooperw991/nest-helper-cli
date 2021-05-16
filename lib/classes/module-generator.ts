import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class ModuleGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'module';
    this.output += this.writeLibDependencies();
    this.output += this.writeModuleDependencies();
    this.output += this.writeModule();
  }

  public generateFile() {
    this.writeFile(this.moduleName);
  }

  private writeLibDependencies(): string {
    let output = `import { Module } from '@nestjs/common';\n`;
    output += `import { TypeOrmModule } from '@nestjs/typeorm';\n\n`;

    return output;
  }

  private writeModuleDependencies(): string {
    const { className, moduleName } = this;
    let output = '';

    output += `import { ${className} } from './${moduleName}.entity';\n`;
    output += `import { ${className}Service } from './${moduleName}.service';\n`;
    output += `import { ${className}Resolver } from './${moduleName}.resolver';\n\n`;

    return output;
  }

  private writeModule(): string {
    const { className } = this;

    let output = `@Module({\n`;
    output += `  imports: [TypeOrmModule.forFeature([${className}])],\n  providers: [${className}Service, ${className}Resolver],\n})\n`;

    output += `export class ${className}Module {}\n`;

    return output;
  }
}
