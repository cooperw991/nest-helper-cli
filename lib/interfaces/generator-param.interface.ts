import { ModelProperty } from './model-property.interface';
import { ModelRelations } from './relation.interface';

export interface GeneratorParams {
  modelName: string;
  properties: ModelProperty[];
  modelRelations: ModelRelations;
  models: string[];
  enums: string[];
  enumRelations: string[];
}
