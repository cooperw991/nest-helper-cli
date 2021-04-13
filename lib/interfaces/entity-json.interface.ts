interface EntityJsonEnumInterface {
  name: string;
  description: 'A Sample Enum';
  values: {
    key: string;
    val: string;
  }[];
}

interface EntityJsonColumnInterface {
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
  };
}

export interface EntityJsonInterface {
  name: string;
  prefix: string;
  isSoftDelete: boolean;
  enums: EntityJsonEnumInterface[];
  columns: EntityJsonColumnInterface[];
}
