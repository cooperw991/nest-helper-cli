import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class ServiceSpecGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.data = json;
    this.suffix = 'service.spec';
    this.output = '';
  }

  public generateFile() {
    this.output += this.writeLibDependences();
    this.output += this.writeHelperDependencies();
    this.output += this.writeServiceAndEntityDependencies();
    this.output += this.writeVariablesDependency();
    this.output += this.writeServiceTest();
    this.writeFile(this.moduleName);
  }

  private writeLibDependences(): string {
    let output = `import { Test, TestingModule } from '@nestjs/testing';\n`;
    output += `import { GoneException } from '@nestjs/common';\n`;
    output += `import { getRepositoryToken } from '@nestjs/typeorm';\n`;
    output += `import { Repository } from 'typeorm';\n\n`;

    return output;
  }

  private writeHelperDependencies(): string {
    return `import { errorMsg } from '../../common/utils/errors.utility';\nimport {\n  FakeRepository,\n  FakeCreateQueryBuilder,\n} from '../../common/helpers/fake-typeorm.helper';\n\n`;
  }

  private writeServiceAndEntityDependencies(): string {
    const { className, moduleName } = this;
    return `import { ${className} } from './${moduleName}.entity';\nimport { ${className}Service } from './${moduleName}.service';\n\n`;
  }

  private writeVariablesDependency(): string {
    const {
      className,
      camelPluralizeName,
      data: { isSoftDelete },
    } = this;
    let output = `import {\n  creator,\n  modifier,\n  createInput,\n  updateInput,\n  fakeId,\n  created${className},\n  saved${className},\n  updated${className},\n  ${camelPluralizeName},\n  currentLimit,\n  ${camelPluralizeName}WithPaging,\n  totalCount,\n`;

    if (isSoftDelete) {
      output += `  softDeleted${className},\n`;
    }

    return output + `} from './${this.moduleName}.mock';\n\n`;
  }

  private writeServiceTest(): string {
    const {
      className,
      variableName,
      data: { isSoftDelete },
    } = this;
    let output = `describe('${className}Service', () => {\n  let service: ${className}Service;\n  let ${variableName}Repo: Repository<${className}>;\n\n`;

    output += `  beforeEach(async () => {\n`;
    output += `    const module: TestingModule = await Test.createTestingModule({\n      providers: [\n        ${className}Service,\n        {\n          provide: getRepositoryToken(${className}),\n          useClass: FakeRepository,\n        },\n      ],\n    }).compile();\n\n`;
    output += `    service = module.get(${className}Service);\n    ${variableName}Repo = module.get(getRepositoryToken(${className}));\n  });\n\n`;

    output += `  it('should be defined', () => {\n    expect(service).toBeDefined();\n  });\n\n`;

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

    output += `      const createSpy = jest\n        .spyOn(${variableName}Repo, 'create')\n        .mockReturnValue(created${className});\n\n`;

    output += `      const saveSpy = jest\n        .spyOn(${variableName}Repo, 'save')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const res = await service.create(creator, createInput);\n\n`;

    output += `      expect(createSpy).toHaveBeenCalledWith({\n        createdById: creator.id,\n        updatedById: creator.id,\n        ...createInput,\n      });\n      expect(saveSpy).toHaveBeenCalledWith(created${className});\n      expect(res).toEqual(saved${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeUpdateTest(): string {
    const { variableName, className } = this;
    let output = `  describe('update ${variableName}', () => {\n`;

    output += `    it('should update a record with correct params and return the new one', async () => {\n`;

    output += `      const findSpy = jest\n        .spyOn(service, 'findOne')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const saveSpy = jest\n        .spyOn(${variableName}Repo, 'save')\n        .mockResolvedValue(updated${className});\n\n`;

    output += `      const res = await service.update(modifier, fakeId, updateInput);\n\n`;

    output += `      expect(findSpy).toHaveBeenCalledWith(modifier, fakeId);\n      expect(saveSpy).toHaveBeenCalledWith(updated${className});\n      expect(res).toEqual(updated${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeSoftDeleteTest(): string {
    const { variableName, className } = this;
    let output = `  describe('soft delete ${variableName}', () => {\n`;

    output += `    it('should soft delete the record', async () => {\n`;

    output += `      const findSpy = jest\n        .spyOn(service, 'findOne')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const saveSpy = jest\n        .spyOn(${variableName}Repo, 'save')\n        .mockResolvedValue(softDeleted${className});\n\n`;

    output += `      const res = await service.softDelete(modifier, fakeId);\n\n`;

    output += `      expect(findSpy).toHaveBeenCalledWith(modifier, fakeId);\n      expect(saveSpy).toHaveBeenCalledWith(softDeleted${className});\n      expect(res).toBe(true);\n    });\n  });\n\n`;

    return output;
  }

  private writeDeleteTest(): string {
    const { variableName } = this;
    let output = `  describe('delete ${variableName}', () => {\n`;

    output += `    it('should delete the record', async () => {\n`;

    output += `      const deleteSpy = jest\n        .spyOn(${variableName}Repo, 'delete')\n        .mockResolvedValue(true);\n\n`;

    output += `      const res = await service.delete(modifier, fakeId);\n\n`;

    output += `      expect(deleteSpy).toHaveBeenCalledWith(fakeId);\n      expect(res).toBe(true);\n    });\n  });\n\n`;

    return output;
  }

  private writeFindOneTest(): string {
    const {
      variableName,
      className,
      data: { isSoftDelete },
    } = this;
    let output = `  describe('find one ${variableName} record', () => {\n`;

    output += `    it('should throw a GoneException', async () => {\n`;

    output += `      expect.assertions(3);\n\n`;

    output += `      const findSpy = jest\n        .spyOn(service, 'findOne')\n        .mockResolvedValue(null);\n\n`;

    output += `      try {\n        await service.findOne(creator, fakeId);\n      } catch (e) {\n        expect(e).toBeInstanceOf(GoneException);\n        expect(findSpy).toHaveBeenCalledWith({\n          where: {\n            id: fakeId,\n`;

    if (isSoftDelete) {
      output += `            deleted: false,\n`;
    }

    output += `          },\n        });\n        expect(e.message.message).toBe(\n          errorMsg(['${className}(id: ' + fakeId + ')']).NOT_EXIST,\n        );\n      }\n    });\n\n`;

    output += `    it('should return the found record', async () => {\n`;

    output += `      const findSpy = jest\n        .spyOn(${variableName}Repo, 'findOne')\n        .mockResolvedValue(saved${className});\n\n`;

    output += `      const res = await service.findOne(creator, fakeId);\n\n`;

    output += `      expect(findSpy).toBeCalledWith({\n        where: {\n          id: fakeId,\n`;
    if (isSoftDelete) {
      output += `          deleted: false,\n`;
    }
    output += `\n        },\n      });\n      expect(res).toBe(saved${className});\n    });\n  });\n\n`;

    return output;
  }

  private writeListTest(): string {
    const { variableName, camelPluralizeName } = this;
    let output = `  describe('list ${variableName} records', () => {\n`;

    output += `    it('should return the ${variableName} list with paging', async () => {\n`;

    output += `      const queryBuilderSpy = Object.assign(\n        new FakeCreateQueryBuilder(), {\n          getManyAndCount: () => [${camelPluralizeName}, totalCount],\n        },\n      );\n\n`;

    output += `      const res = await service.list(creator, { limit: currentLimit, offset: 0 }, null, null);\n\n`;

    output += `      expect(res).toEqual(${camelPluralizeName}WithPaging);\n      expect(queryBuilderSpy).toHaveBeenCalledWith('${variableName}');\n    });\n  });\n`;

    return output;
  }
}
