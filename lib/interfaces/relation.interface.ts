export interface ModelRelations {
  [key: string]: {
    o: ModelRelation[];
    m: ModelRelation[];
  };
}

export interface ModelRelation {
  key: string;
  value: string;
}
