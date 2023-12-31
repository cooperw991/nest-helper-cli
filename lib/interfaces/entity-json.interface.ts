interface EntityJsonEnumInterface {
  name: string;
  description: 'A Sample Enum';
  values: {
    key: string;
    val: string;
  }[];
}

export interface EntityJsonColumnInterface {
  name: string;
  type: string;
  decorator?: string;
  options?: {
    [key: string]: any;
  };
  api?: {
    create?: boolean;
    update?: boolean;
    view?: boolean;
    filter?: boolean;
  };
}

export interface EntityJsonInterface {
  name: string;
  prefix: string;
  isSoftDelete: boolean;
  enums: EntityJsonEnumInterface[];
  columns: EntityJsonColumnInterface[];
}
