import { readFileSync } from 'fs';
import { GenerateEntity } from '../lib/generate-entity';

const jsonData = JSON.parse(
  readFileSync(process.cwd() + '/sample_entity.json').toString(),
);
const entityGenerator = new GenerateEntity(jsonData);

entityGenerator.generateEntityFile();
