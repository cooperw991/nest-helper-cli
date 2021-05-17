import { writeFileSync, readFileSync } from 'fs';

import { Input } from '../lib/inputs';
import { EntityGenerator } from '../lib/classes/entity-generator';
import { InterfacesGenerator } from '../lib/classes/interfaces-generator';
import { DTOsGenerator } from '../lib/classes/dtos-generator';
import { ServiceGenerator } from '../lib/classes/service-generator';
import { ResolverGenerator } from '../lib/classes/resolver-generator';
import { ModuleGenerator } from '../lib/classes/module-generator';
import { TestsGenerator } from '../lib/classes/tests-generator';
import { CommonDecoratorsGenerator } from '../lib/classes/common-files/decorators-generator';
import { CommonDTOsGenerator } from '../lib/classes/common-files/dto-generator';
import { CommonGuardsGenerator } from '../lib/classes/common-files/guards-generator';
import { CommonHelpersGenerator } from '../lib/classes/common-files/helpers-generator';
import { CommonInterfacesGenerator } from '../lib/classes/common-files/interfaces-generator';
import { CommonUtilsGenerator } from '../lib/classes/common-files/utils-generator';
import { AppModuleUpdater } from '../lib/classes/app-module-updater';
import { DirectoryCreator } from '../lib/classes/directory-creator';
import { EntityJsonInterface } from '../lib/interfaces/entity-json.interface';
import logger from '../lib/utils/logger.util';
import { AbstractAction } from './abstract.action';

export class GenerateAction extends AbstractAction {
  public async handle(inputs: Input[], options: Input[]) {
    const schematic = inputs.find((input: Input) => {
      return input.name === 'schematic';
    });

    if (schematic.value === 'json') {
      await this.generateJsonFile(inputs.concat(options));
    }

    if (schematic.value === 'module' || schematic.value === 'mo') {
      await this.generateModuleFiles(inputs.concat(options));
    }

    if (schematic.value === 'common' || schematic.value === 'co') {
      await this.generateCommonFiles();
    }
  }

  generateJsonFile = async (inputs: Input[]) => {
    const sample: EntityJsonInterface = {
      name: 'sample',
      prefix: 'sp_',
      isSoftDelete: false,
      enums: [
        {
          name: 'SampleEnum',
          description: 'A Sample Enum',
          values: [
            {
              key: 'KEY1',
              val: 'val1',
            },
            {
              key: 'KEY2',
              val: 'val2',
            },
          ],
        },
      ],
      columns: [
        {
          name: 'id',
          decorator: 'PrimaryGeneratedColumn',
          type: 'number',
          options: {
            type: 'integer',
            comment: 'Primary gernated column',
          },
          api: {
            create: false,
            update: false,
            view: true,
          },
        },
        {
          name: 'column1',
          type: 'string',
          options: {
            type: 'varchar',
            length: 150,
            nullable: false,
            comment: 'string column1',
          },
          api: {
            create: true,
            update: false,
            view: false,
          },
        },
        {
          name: 'column2',
          decorator: 'Column',
          type: 'number',
          options: {
            type: 'integer',
            length: 10,
            nullable: false,
            comment: 'int column2',
          },
          api: {
            filter: true,
          },
        },
        {
          name: 'column3',
          decorator: 'Column',
          type: 'SampleEnum',
          options: {
            comment: 'enum column3',
          },
        },
        {
          name: 'column4',
          decorator: 'Column',
          type: 'number',
          options: {
            type: 'integer',
            length: 10,
            array: true,
            default: '{}',
            comment: 'int array column4',
          },
        },
      ],
    };

    const fileNameOption =
      (inputs.find((option) => option.name === 'name')?.value as string) ||
      'sample_entity.json';

    writeFileSync(process.cwd() + `/${fileNameOption}`, JSON.stringify(sample));
  };

  generateModuleFiles = async (inputs: Input[]) => {
    const fileName =
      (inputs.find((input) => input.name === 'name')?.value as string) ||
      'sample_entity.json';

    let jsonData;

    try {
      jsonData = JSON.parse(
        readFileSync(process.cwd() + `/${fileName}`).toString(),
      );
    } catch (e) {
      console.log(process.cwd() + `/${fileName}`);
      logger.info('entity json file not found!');
    }

    const directoryCreator = new DirectoryCreator(jsonData);
    const entityGenerator = new EntityGenerator(jsonData);

    const interfacesGenerator = new InterfacesGenerator(jsonData);

    const dtosGenerator = new DTOsGenerator(jsonData);

    const serviceGenerator = new ServiceGenerator(jsonData);

    const resolverGenerator = new ResolverGenerator(jsonData);

    const moduleGenerator = new ModuleGenerator(jsonData);

    const testsGenerator = new TestsGenerator(jsonData);

    const appModuleUpdater = new AppModuleUpdater(jsonData);

    await directoryCreator.createModulePath();

    await Promise.all([
      entityGenerator.generateFile(),
      interfacesGenerator.generateFiles(),
      dtosGenerator.generateFiles(),
      serviceGenerator.generateFile(),
      resolverGenerator.generateFile(),
      moduleGenerator.generateFile(),
      testsGenerator.generateFiles(),
      appModuleUpdater.updateAppModuleFile(),
    ]);
  };

  generateCommonFiles = async () => {
    const decoratorsGenerator = new CommonDecoratorsGenerator();

    const dtoGenerator = new CommonDTOsGenerator();

    const guardsGenerator = new CommonGuardsGenerator();

    const helpersGenerator = new CommonHelpersGenerator();

    const interfacesGenerator = new CommonInterfacesGenerator();

    const utilsGenerator = new CommonUtilsGenerator();

    await Promise.all([
      decoratorsGenerator.generateFiles(),
      dtoGenerator.generateFiles(),
      guardsGenerator.generateFiles(),
      helpersGenerator.generateFiles(),
      interfacesGenerator.generateFiles(),
      utilsGenerator.generateFiles(),
    ]);
  };
}
