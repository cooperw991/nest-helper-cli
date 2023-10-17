export interface ModelRelations {
  [key: string]: {
    o2o: ModelRelation[];
    o2m: ModelRelation[];
    m2o: ModelRelation[];
    m2m: ModelRelation[];
  };
}

export interface ModelRelation {
  key: string;
  value: string;
  deepKey?: string[];
}
