import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class ResolverSpecGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'reslover.spec';
    this.output = '';
  }

  public generateFile() {
    this.output += this.writeLibDependences();
    this.output += this.writeServiceAndEntityDependencies();
    this.output += this.writeVariablesDependency();
    this.output += this.writeResolverTest();
    this.writeFile(this.moduleName);
  }

  private writeLibDependences(): string {
    return `import { Test, TestingModule } from '@nestjs/testing';\n`;
  }

  private writeServiceAndEntityDependencies(): string {
    const { className, moduleName } = this;
    return `import { ${className}Resolver } from './${moduleName}.resolver';\nimport { ${className}Service } from './${moduleName}.service';\n\n`;
  }

  private writeVariablesDependency(): string {
    const { className, camelPluralizeName } = this;
    const output = `import {\n  creator,\n  modifier,\n  createInput,\n  updateInput,\n  fakeId,\n  saved${className},\n  updated${className},\n  currentLimit,\n  ${camelPluralizeName}WithPaging,\n`;

    return output + `} from './${this.moduleName}.mock';\n\n`;
  }

  private writeResolverTest(): string {
    const {
      className,
      data: { isSoftDelete },
    } = this;
    let output = `describe('${className}Resolver', () => {\n  let resolver: ${className}Resolver;\n  let service: ${className}Service;\n\n`;

    output += `  beforeEach(async () => {\n`;
    output += `    const module: TestingModule = await Test.createTestingModule({\n      providers: [${className}Resolver, ${className}Service],\n    }).compile();\n\n`;
    output += `    service = module.get(${className}Service);\n    resolver = module.get(${className}Resolver);\n  });\n\n`;

    output += `  it('should be defined', () => {\n    expect(resolver).toBeDefined();\n  });\n\n`;

    output += this.writeCreateTest();
    output += this.writeUpdateTest();

    if (isSoftDelete) {
      output += this.writeSoftDeleteTest();
    } else {
      output += this.writeDeleteTest();
    }
    output += this.writeFindOneTest();
    output += this.writeListTest();

    return output + `});\n\n`;
  }

  private writeCreateTest(): string {
    const { variableName, className } = this;
    let output = `  describe('create ${variableName}', () => {\n`;

    output += `    it('should create and return a new record with correct params', async () => {\n`;

    output += `      const createSpy = jest\n        .spyOn(service, 'create')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const res = await resolver.create${className}(creator, createInput);\n\n`;

    output += `      expect(createSpy).toHaveBeenCalledWith(creator, createInput);\n      expect(res).toEqual(saved${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeUpdateTest(): string {
    const { variableName, className } = this;
    let output = `  describe('update ${variableName}', () => {\n`;

    output += `    it('should update a record with correct params and return the new one', async () => {\n`;

    output += `      const updateSpy = jest\n        .spyOn(service, 'update')\n        .mockResolvedValue(updated${className});\n\n`;

    output += `      const res = await resolver.update${className}(modifier, fakeId, updateInput);\n\n`;

    output += `      expect(updateSpy).toHaveBeenCalledWith(modifier, fakeId, updateInput);\n      expect(res).toEqual(updated${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeSoftDeleteTest(): string {
    const { variableName, className } = this;
    let output = `  describe('soft delete ${variableName}', () => {\n`;

    output += `    it('should soft delete the record', async () => {\n`;

    output += `      const deleteSpy = jest\n        .spyOn(service, 'softDelete')\n        .mockResolvedValue(true);\n\n`;

    output += `      const res = await resolver.delete${className}(modifier, fakeId);\n\n`;

    output += `      expect(deleteSpy).toHaveBeenCalledWith(modifier, fakeId);\n      expect(res).toBe(true);\n    });\n  });\n\n`;

    return output;
  }

  private writeDeleteTest(): string {
    const { variableName, className } = this;
    let output = `  describe('delete ${variableName}', () => {\n`;

    output += `    it('should delete the record', async () => {\n`;

    output += `      const deleteSpy = jest.spyOn(service, 'delete').mockResolvedValue(true);\n\n`;

    output += `      const res = await resolver.delete${className}(modifier, fakeId);\n\n`;

    output += `      expect(deleteSpy).toHaveBeenCalledWith(modifier, fakeId);\n      expect(res).toBe(true);\n    });\n  });\n\n`;

    return output;
  }

  private writeFindOneTest(): string {
    const { variableName, className } = this;
    let output = `  describe('find one ${variableName} record', () => {\n`;

    output += `    it('should throw a GoneException', async () => {\n`;

    output += `      const findOneSpy = jest\n        .spyOn(service, 'findOne')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const res = await resolver.get${className}(creator, fakeId);\n`;

    output += `      expect(findOneSpy).toBeCalledWith(creator, fakeId);\n      expect(res).toEqual(saved${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeListTest(): string {
    const { variableName, camelPluralizeName, uppperCamelPluralizeName } = this;
    let output = `  describe('list ${variableName} records', () => {\n`;

    output += `    it('should return the ${variableName} list with paging', async () => {\n`;

    output += `      const listSpy = jest\n        .spyOn(service, 'list')\n        .mockResolvedValue(${camelPluralizeName}WithPaging);\n\n`;

    output += `      const res = await resolver.list${uppperCamelPluralizeName}(creator, null, null, {\n        limit: currentLimit, offset: 0,\n      });\n`;

    output += `      expect(listSpy).toBeCalledWith(creator, null, null, {\n        limit: currentLimit, offset: 0,\n      });\n      expect(res).toEqual(${camelPluralizeName}WithPaging);\n    });\n  });\n`;

    return output;
  }
}
