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
  decorator: string;
  options: {
    [key: string]: any;
  };
  graphql: {
    [key: string]: any;
    type: string;
  };
}

export interface EntityJsonInterface {
  name: string;
  prefix: string;
  isSoftDelete: boolean;
  enums: EntityJsonEnumInterface[];
  columns: EntityJsonColumnInterface[];
}
