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
import { FindIncludeGenerator } from '../lib/classes/find-include-generator';
import { PagingObjectGenerator } from '../lib/classes/paging-dto-generator';
import { ModuleGenerator } from '../lib/classes/module-generator';

export class GenerateAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    const schematic = inputs.find((input: Input) => {
      return input.name === 'schematic';
    });

    const modelName = inputs.find((input) => input.name === 'name')
      ?.value as string;

    if (!modelName) {
      logger.error('param incrrect!');
      throw new Error();
    }

    const parser = await this.generateParser(modelName);

    const ifReplace = !!options.find((opt) => opt.name === 'replace');
    console.log(123);

    if (schematic.value === 'module' || schematic.value === 'mo') {
      await this.generateModuleFiles(parser, modelName, ifReplace);
    } else if (schematic.value === 'model' || schematic.value === 'mod') {
      await this.generateModelFiles(parser, modelName, ifReplace);
    }
  }

  generateParser = async (modelName: string): Promise<SchemaFileParser> => {
    if (!modelName) {
      logger.error('param incrrect!');
      throw new Error();
    }

    const parser = new SchemaFileParser();

    await parser.init();

    await parser.getModelProperties(modelName);

    return parser;
  };

  generateModelFiles = async (
    parser: SchemaFileParser,
    modelName: string,
    ifReplace: boolean,
  ) => {
    const { models, enums, modelRelations, properties, enumRelations } = parser;

    const params = {
      modelName,
      models,
      enums,
      modelRelations,
      properties,
      enumRelations,
    };

    const modelGen = new ModelGenerator(params);

    return modelGen.generateFile(ifReplace);
  };

  generateServiceFiles = async (
    parser: SchemaFileParser,
    modelName: string,
    ifReplace: boolean,
  ) => {
    const { models, enums, modelRelations, properties, enumRelations } = parser;

    const params = {
      modelName,
      models,
      enums,
      modelRelations,
      properties,
      enumRelations,
    };

    const modelGen = new ServiceGenerator(params);

    return modelGen.generateFile(ifReplace);
  };

  generateResolverFiles = async (
    parser: SchemaFileParser,
    modelName: string,
    ifReplace: boolean,
  ) => {
    const { models, enums, modelRelations, properties, enumRelations } = parser;

    const params = {
      modelName,
      models,
      enums,
      modelRelations,
      properties,
      enumRelations,
    };

    const modelGen = new ResolverGenerator(params);

    return modelGen.generateFile(ifReplace);
  };

  generateDTOFiles = async (
    parser: SchemaFileParser,
    modelName: string,
    ifReplace: boolean,
  ) => {
    const { models, enums, modelRelations, properties, enumRelations } = parser;

    const params = {
      modelName,
      models,
      enums,
      modelRelations,
      properties,
      enumRelations,
    };

    const editInputGen = new EditInputGenerator(params);
    const newInputGen = new NewInputGenerator(params);
    const newFindFilterGen = new FindFilterGenerator(params);
    const newFindOrderGen = new FindOrderGenerator(params);
    const pagingGen = new PagingObjectGenerator(params);
    const includeGen = new FindIncludeGenerator(params);

    await editInputGen.generateFile(ifReplace);
    await newInputGen.generateFile(ifReplace);
    await newFindFilterGen.generateFile(ifReplace);
    await newFindOrderGen.generateFile(ifReplace);
    await pagingGen.generateFile(ifReplace);
    await includeGen.generateFile(ifReplace);
  };

  generateModuleFiles = async (
    parser: SchemaFileParser,
    modelName: string,
    ifReplace: boolean,
  ) => {
    const { models, enums, modelRelations, properties, enumRelations } = parser;

    const params = {
      modelName,
      models,
      enums,
      modelRelations,
      properties,
      enumRelations,
    };

    const moduleGen = new ModuleGenerator(params);

    await this.generateModelFiles(parser, modelName, ifReplace);
    await this.generateDTOFiles(parser, modelName, ifReplace);
    await this.generateServiceFiles(parser, modelName, ifReplace);
    await this.generateResolverFiles(parser, modelName, ifReplace);
    await moduleGen.generateFile(ifReplace);
  };
}
