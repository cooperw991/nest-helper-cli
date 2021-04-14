import { readFileSync } from 'fs';

import { EntityGenerator } from '../lib/classes/entity-generator';
import { InterfacesGenerator } from '../lib/classes/interfaces-generator';

const jsonData = JSON.parse(
  readFileSync(process.cwd() + '/sample_entity.json').toString(),
);

const entityGenerator = new EntityGenerator(jsonData);
entityGenerator.generateFile();

const interfacesGenerator = new InterfacesGenerator(jsonData);
interfacesGenerator.generateFiles();
