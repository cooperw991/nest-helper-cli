import { Input } from '../lib/inputs';
import { ServiceGenerator } from '../lib/classes/service-generator';
import { ResolverGenerator } from '../lib/classes/resolver-generator';
import { SchemaFileParser } from '../lib/classes/schema-file-parser';

import logger from '../lib/utils/logger.util';
import { AbstractAction } from './abstract.action';
import { ModelGenerator } from '../lib/classes/model-generator';
import { NewInputGenerator } from '../lib/classes/new-input-generator';
import { EditInputGenerator } from '../lib/classes/edit-input-generator';
import { FindFilterGenerator } from '../lib/classes/find-filter-generator';
import { FindOrderGenerator } from '../lib/classes/find-order-generator';
import { PagingDTOGenerator } from '../lib/classes/paging-dto-generator';
import { ModuleGenerator } from '../lib/classes/module-generator';
import { MocksGenerator } from '../lib/classes/mock-data-generator';
import { ServiceSpecGenerator } from '../lib/classes/service-spec-generator';
import { AppModuleFileParser } from '../lib/classes/app-module-file-parser';

export class GenerateAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    const schematic = inputs.find((input: Input) => {
      return input.name === 'schematic';
    });

    if (schematic.value === 'module' || schematic.value === 'mo') {
      await this.generateModuleFiles(inputs.concat(options));
    }
  }

  generateModuleFiles = async (inputs: Input[]) => {
    const modelName = inputs.find((input) => input.name === 'name')
      ?.value as string;

    if (!modelName) {
      logger.error('param incrrect!');
      throw new Error();
    }

    const parser = new SchemaFileParser();

    await parser.init(modelName);

    await Promise.all([parser.parseEnums(), parser.parseModelNames()]);

    const modelLines = parser.targetModel;
    const enums = parser.enums;
    const models = parser.models;

    const modelGenerator = new ModelGenerator(
      modelName,
      modelLines,
      enums,
      models,
    );
    const serviceGenerator = new ServiceGenerator(modelName, modelLines);
    const resolverGenerator = new ResolverGenerator(
      modelName,
      modelLines,
      models,
    );
    const newInputGenerator = new NewInputGenerator(
      modelName,
      modelLines,
      enums,
      models,
    );
    const editInputGenerator = new EditInputGenerator(
      modelName,
      modelLines,
      enums,
      models,
    );
    const findFilterGenerator = new FindFilterGenerator(
      modelName,
      modelLines,
      enums,
      models,
    );
    const findOrderGenerator = new FindOrderGenerator(
      modelName,
      modelLines,
      models,
    );
    const pagingDTOGenerator = new PagingDTOGenerator(modelName, modelLines);
    const moduleGenerator = new ModuleGenerator(modelName, modelLines);
    const mocksGenerator = new MocksGenerator(modelName, modelLines, enums);
    const serviceSpecGenerator = new ServiceSpecGenerator(
      modelName,
      modelLines,
    );

    await modelGenerator.generateFile();
    await serviceGenerator.generateFile();
    await resolverGenerator.generateFile();
    await newInputGenerator.generateFile();
    await editInputGenerator.generateFile();
    await findFilterGenerator.generateFile();
    await findOrderGenerator.generateFile();
    await pagingDTOGenerator.generateFile();
    await moduleGenerator.generateFile();
    await mocksGenerator.generateFile();
    await serviceSpecGenerator.generateFile();

    await this.updateAppModuleFile(modelName);
  };

  updateAppModuleFile = async (modelName: string) => {
    const appModuleParser = new AppModuleFileParser();

    await appModuleParser.init(modelName);
    await appModuleParser.updateAppModuleFile();
    await appModuleParser.writeFile();
  };
}
