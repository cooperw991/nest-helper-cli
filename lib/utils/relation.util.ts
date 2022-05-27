import * as R from 'ramda';
import * as inflected from 'inflected';

export interface ModelRelation {
  name: string;
  field: string;
  ifArray: boolean;
}

export const getRelations = (
  models: string[],
  data: string[][],
): ModelRelation[] => {
  const relations = [];

  for (const line of data) {
    let ifArray = false;
    let modelName = line[1] || '';
    if (modelName.indexOf('[]') !== -1) {
      ifArray = true;
      modelName = modelName.split('[')[0];
    }
    if (R.includes(modelName, models)) {
      const name = inflected.camelize(modelName, false);
      relations.push({
        name,
        field: line[0],
        ifArray,
      });
    }
  }

  return relations;
};
