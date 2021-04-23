import { readFileSync } from 'fs';

import { EntityGenerator } from '../lib/classes/entity-generator';
import { InterfacesGenerator } from '../lib/classes/interfaces-generator';
import { PagingDtoGenerator } from '../lib/classes/paging-dto-generator';
import { ServiceGenerator } from '../lib/classes/service-generator';
import { ResolverGenerator } from '../lib/classes/resolver-generator';
import { ModuleGenerator } from '../lib/classes/module-generator';
import { TestsGenerator } from '../lib/classes/tests-generator';
import { AppModuleUpdater } from '../lib/classes/app-module-updater';

const jsonData = JSON.parse(
  readFileSync(process.cwd() + '/sample_entity.json').toString(),
);

const entityGenerator = new EntityGenerator(jsonData);
entityGenerator.generateFile();

const interfacesGenerator = new InterfacesGenerator(jsonData);
interfacesGenerator.generateFiles();

const pagingGenerator = new PagingDtoGenerator(jsonData);
pagingGenerator.generateFile();

const serviceGenerator = new ServiceGenerator(jsonData);
serviceGenerator.generateFile();

const resolverGenerator = new ResolverGenerator(jsonData);
resolverGenerator.generateFile();

const moduleGenerator = new ModuleGenerator(jsonData);
moduleGenerator.generateFile();

const testsGenerator = new TestsGenerator(jsonData);
testsGenerator.generateFiles();

const appModuleUpdater = new AppModuleUpdater(jsonData);
appModuleUpdater.updateAppModuleFile();
