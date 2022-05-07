import { FileGenerator } from './file-generator';

export class ServiceSpecGenerator extends FileGenerator {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
    this.suffix = 'service.spec';
    this.output = this.writeDependencies();
    this.output += this.writeTestMethod();
  }

  protected idType: string;

  public async generateFile() {
    await this.writeFile('services/' + this.moduleName);
  }

  private writeDependencies(): string {
    const { modelName, moduleName } = this;
    let output = `import { TestingModule, Test } from '@nestjs/testing';\n\n`;
    output += `import { I18nRequestScopeService } from 'nestjs-i18n';\n`;
    output += `import { PrismaService } from 'nestjs-prisma';\n`;
    output += `import { FakePrismaClient } from '@Helper/fake-prisma-client.helper';\n`;
    output += `import { LogService } from '@Module/log/services/log.service';\n`;

    output += `import {\n  new${modelName}Input,\n  created${modelName},\n  edit${modelName}Input,\n  updated${modelName},\n  deleted${modelName},\n  creatorId,\n  modifierId,\n} from '../fake/${moduleName}.fake';\n`;

    output += `import { ${modelName}Service } from './${moduleName}.service';\n\n`;

    return output;
  }

  private writeTestMethod(): string {
    const { modelName } = this;
    let output = `describe('${modelName}Service', () => {\n`;

    output += this.writePrepare();
    output += this.writeCreateMethod();
    output += this.writeUpdateMethod();
    output += this.writeDeleteMethod();
    output += this.writeFindMethod();

    output += `});\n`;
    return output;
  }

  private writePrepare(): string {
    const { modelName, variableName } = this;
    let output = `  let service: ${modelName}Service;\n  let prisma: PrismaService;\n  let i18n: I18nRequestScopeService;\n  let logService: LogService;\n\n`;

    output += `  beforeEach(async () => {\n`;

    output += `    const module: TestingModule = await Test.createTestingModule({\n      providers: [\n        ${modelName}Service,\n        {\n          provide: PrismaService,\n          useFactory: () => ({\n            ${variableName}: new FakePrismaClient(),\n          }),\n        },\n        {\n          provide: I18nRequestScopeService,\n          useFactory: () => ({\n            t: () => '',\n          }),\n        },\n        {\n          provide: LogService,\n          useFactory: () => ({\n            createLog: () => ({}),\n          }),\n        },\n      ],\n    }).compile();\n\n`;

    output += `    service = module.get(${modelName}Service);\n`;
    output += `    prisma = module.get(PrismaService);\n`;
    output += `    i18n = module.get(I18nRequestScopeService);\n`;
    output += `    logService = module.get(LogService);\n`;

    output += `  });\n\n`;

    output += `  it('${modelName}Service should be defined', () => {\n    expect(service).toBeDefined();\n  });\n\n`;

    return output;
  }

  private writeCreateMethod(): string {
    const { modelName, moduleName, variableName } = this;

    let output = `  describe('Test create${modelName}', () => {\n`;
    output += `    it('Should create a new ${moduleName}', async () => {\n`;
    output += `      const createSpy = jest\n        .spyOn(prisma.${variableName}, 'create')\n        .mockResolvedValue(created${modelName});\n\n`;

    output += `      const logSpy = jest.spyOn(logService, 'createLog');\n\n`;

    output += `      const res = await service.create${modelName}(new${modelName}Input, creatorId);\n\n`;

    output += `      expect(createSpy).toBeCalledWith({\n        data: {\n          ...new${modelName}Input,\n          creatorId,\n          modifierId: creatorId,\n        },\n      });\n\n`;

    output += `      expect(logSpy).toBeCalledWith({\n        userId: creatorId,\n        moduleName: '${moduleName}',\n        action: 'create',\n        additionalContent: JSON.stringify(new${modelName}Input),\n      });\n\n`;

    output += `      expect(res).toBe(created${modelName});\n    });\n  });\n\n`;

    return output;
  }

  private writeUpdateMethod(): string {
    const { modelName, moduleName, variableName } = this;

    let output = `  describe('Test update${modelName}', () => {\n`;
    output += `    it('Should update the ${moduleName}', async () => {\n`;
    output += `      const { id } = created${modelName};\n`;
    output += `      const find${modelName}Spy = jest\n        .spyOn(service, 'find${modelName}')\n        .mockResolvedValue(created${modelName});\n\n`;
    output += `      const updateSpy = jest\n        .spyOn(prisma.${variableName}, 'update')\n        .mockResolvedValue(updated${modelName});\n\n`;

    output += `      const logSpy = jest.spyOn(logService, 'createLog');\n\n`;

    output += `      const res = await service.update${modelName}(id, edit${modelName}Input, modifierId);\n\n`;

    output += `      expect(find${modelName}Spy).toBeCalledWith(id);\n\n`;

    output += `      expect(updateSpy).toBeCalledWith({\n        data: {\n          ...edit${modelName}Input,\n          modifierId,\n        },\n        where: {\n          id,\n        },\n      });\n\n`;

    output += `      expect(logSpy).toBeCalledWith({\n        userId: modifierId,\n        moduleName: '${moduleName}',\n        action: 'update',\n        additionalContent: JSON.stringify(edit${modelName}Input),\n      });\n\n`;

    output += `      expect(res).toBe(updated${modelName});\n    });\n  });\n\n`;

    return output;
  }

  private writeDeleteMethod(): string {
    const { modelName, moduleName, variableName } = this;

    let output = `  describe('Test delete${modelName}', () => {\n`;
    output += `    it('Should return true if ${moduleName} is null', async () => {\n`;
    output += `      const { id } = created${modelName};\n`;
    output += `      const find${modelName}Spy = jest\n        .spyOn(prisma.${variableName}, 'findFirst')\n        .mockResolvedValue(null);\n\n`;

    output += `      jest.spyOn(logService, 'createLog');\n\n`;

    output += `      const res = await service.delete${modelName}(id, modifierId);\n\n`;

    output += `      expect(find${modelName}Spy).toBeCalledWith({\n        where: {\n          id,\n        },\n      });\n\n`;

    output += `      expect(res).toBe(true);\n    });\n\n`;

    output += `    it('Should soft delete the ${moduleName}', async () => {\n`;

    output += `      const { id } = created${modelName};\n`;
    output += `      jest.spyOn(prisma.${variableName}, 'findFirst').mockResolvedValue(created${modelName});\n\n`;

    output += `      const delete${modelName}Spy = jest\n        .spyOn(prisma.${variableName}, 'delete')\n        .mockResolvedValue(deleted${modelName});\n\n`;

    output += `      const logSpy = jest.spyOn(logService, 'createLog');\n\n`;

    output += `      const res = await service.delete${modelName}(id, modifierId);\n\n`;

    output += `      expect(delete${modelName}Spy).toBeCalledWith({\n        where: {\n          id,\n        },\n      });\n`;

    output += `      expect(logSpy).toBeCalledWith({\n        userId: modifierId,\n        moduleName: '${moduleName}',\n        action: 'delete',\n        additionalContent: '{}',\n      });\n\n`;

    output += `      expect(res).toBe(true);\n    });\n  });\n\n`;

    return output;
  }

  private writeFindMethod(): string {
    const { modelName, moduleName, variableName } = this;

    let output = `  describe('Test find${modelName}', () => {\n`;
    output += `    it('Should throw a NotFoundException with wrong id', async () => {\n`;
    output += `      const { id } = created${modelName};\n`;
    output += `      const find${modelName}Spy = jest\n        .spyOn(prisma.${moduleName}, 'findFirst')\n        .mockResolvedValue(null);\n\n`;

    output += `      const exceptionSpy = jest.spyOn(i18n, 't');\n\n`;

    output += `      try {\n        await service.find${modelName}(id);\n      } catch (e) {\n        expect(find${modelName}Spy).toBeCalledWith({\n          where: {\n            id,\n          },\n        });\n\n`;

    output += `        expect(exceptionSpy).toBeCalledWith('general.NOT_FOUND', {\n          args: {\n            model: '${modelName}',\n            condition: 'id',\n            value: id,\n          },\n        });\n      }\n    });\n\n`;

    output += `    it('Should find the ${moduleName}', async () => {\n`;
    output += `      const { id } = created${modelName};\n`;
    output += `      const find${modelName}Spy = jest\n        .spyOn(prisma.${variableName}, 'findFirst')\n        .mockResolvedValue(created${modelName});\n\n`;
    output += `      const res = await service.find${modelName}(id);\n\n`;
    output += `      expect(find${modelName}Spy).toBeCalledWith({\n        where: {\n          id,\n          deletedAt: null,\n        },\n      });\n\n      expect(res).toBe(created${modelName});\n    });\n  });\n`;

    return output;
  }
}
