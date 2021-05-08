import * as inflected from 'inflected';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class MocksGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'mock';
    this.output = '';
  }

  public generateFile() {
    this.output += this.writeDependences();
    this.output += this.writeUser();
    this.output += this.writeId();
    this.output += this.writeInputs();
    this.output += this.writeEntities();
    this.output += this.writeExports();
    this.writeFile(this.moduleName);
  }

  private rdmArr(str: string): string {
    return 'faker.random.arrayElement(' + str + ')';
  }

  private rdmNum(str = ''): string {
    return 'faker.random.number(' + str + ')';
  }

  private rdmStr(): string {
    return 'faker.lorem.word()';
  }

  private writeDependences(): string {
    const {
      className,
      moduleName,
      data: { enums },
    } = this;
    let enumOutput = '';
    let output = `import * as faker from 'faker';\n\n`;
    output += `import { User } from '../user/user.entity';\n`;
    output += `import { ${className}`;
    for (const n of enums) {
      output += `, ${n.name}`;
      enumOutput += `const ${inflected.camelize(n.name, false)}Arr = [\n`;
      for (const val of n.values) {
        enumOutput += `  ${n.name}.${val.key},\n`;
      }
      enumOutput += '];\n\n';
    }
    output += ` } from './${moduleName}.entity';\n`;
    output += `import { Create${className}Input } from './interfaces/create-${moduleName}.interface';\n`;
    output += `import { Update${className}Input } from './interfaces/update-${moduleName}.interface';\n\n`;

    return output + enumOutput;
  }

  private writeUser(): string {
    let output = `const creator: User = Object.assign(new User(), {\n  id: ${this.rdmNum()},\n});\n\n`;

    output += `const modifier: User = Object.assign(new User(), {\n  id: ${this.rdmNum()},\n});\n\n`;

    return output;
  }

  private writeId(): string {
    return `const fakeId = ${this.rdmNum()};\n\n`;
  }

  private writeInputs(): string {
    const {
      className,
      rdmNum,
      rdmStr,
      rdmArr,
      data: { columns },
    } = this;

    let createOutput = `const createInput: Create${className}Input = Object.assign(\n  new Create${className}Input(),\n  {\n`;
    let updateOutput = `const updateInput: Update${className}Input = Object.assign(\n  new Update${className}Input(),\n  {\n`;

    for (const col of columns) {
      let fakeType = '';
      switch (col.type) {
        case 'string':
          fakeType = rdmNum();
          break;
        case 'number':
          fakeType = rdmStr();
          break;
        default:
          fakeType = rdmArr(inflected.camelize(col.type, false) + 'Arr');
      }
      if (!col.api || col.api.create) {
        createOutput += `    ${col.name}: ${fakeType},\n`;
      }

      if (!col.api || col.api.update) {
        updateOutput += `    ${col.name}: ${fakeType},\n`;
      }
    }

    createOutput += '  },\n);\n\n';
    updateOutput += '  },\n);\n\n';

    return createOutput + updateOutput;
  }

  private writeEntities(): string {
    const {
      className,
      camelPluralizeName,
      rdmNum,
      data: { isSoftDelete },
    } = this;
    let output = `const created${className}: ${className} = Object.assign(new ${className}(), {\n  ...createInput,\n  createdById: creator.id,\n  updatedById: modifier.id,\n});\n\n`;

    output += `const saved${className}: ${className} = Object.assign(new ${className}(), {\n  ...created${className},\n  id: fakeId,\n  createdAt: Date.parse(new Date() + '') / 1000,\n  updatedAt: Date.parse(new Date() + '') / 1000,\n`;

    if (isSoftDelete) {
      output += `  deleted: false,\n});\n\n`;
      output += `const softDeleted${className}: ${className} = Object.assign(new ${className}(), {\n  deleted: true,\n`;
    }

    output += `});\n\n`;

    output += `const updated${className}: ${className} = Object.assign(\n  new ${className}(),\n  saved${className},\n  {\n    ...updateInput,\n    updatedById: modifier.id,\n  },\n);\n\n`;

    output += `const ${camelPluralizeName}: ${className}[] = [];\n\n`;
    output += `const totalCount = ${rdmNum()};\n\n`;
    output += `const currentLimit = ${rdmNum('{ max: 10, min: 1 }')};\n\n`;

    output += `for (let i = 0; i < currentLimit; i++) {\n  ${camelPluralizeName}.push(\n    Object.assign(new ${className}(), {\n      id: i,\n    }),\n  );\n}\n\n`;

    output += `const ${camelPluralizeName}WithPaging = {\n  ${camelPluralizeName},\n  paging: {\n    totalCount,\n    currentOffset: 0,\n    currentLimit,\n  }\n};\n\n`;

    return output;
  }

  private writeExports(): string {
    const {
      className,
      camelPluralizeName,
      data: { isSoftDelete },
    } = this;
    let output = `export {\n  creator,\n  modifier,\n  createInput,\n  updateInput,\n  fakeId,\n  created${className},\n  saved${className},\n  updated${className},\n  ${camelPluralizeName},\n  totalCount,\n  currentLimit,\n  ${camelPluralizeName}WithPaging,\n`;

    if (isSoftDelete) {
      output += `  softDeleted${className},\n`;
    }

    return output + '};\n';
  }
}
