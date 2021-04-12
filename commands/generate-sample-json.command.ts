import { writeFileSync } from 'fs';

import { EntityJsonInterface } from '../lib/interfaces/entity-json.interface';

const sample: EntityJsonInterface = {
  name: 'sample',
  prefix: 'sp_',
  isSoftDelete: false,
  enums: [
    {
      name: 'SampleEnum',
      description: 'A Sample Enum',
      values: [
        {
          key: 'KEY1',
          val: 'val1',
        },
        {
          key: 'KEY2',
          val: 'val2',
        },
      ],
    },
  ],
  columns: [
    {
      name: 'id',
      decorator: 'PrimaryGeneratedColumn',
      type: 'number',
      options: {
        type: 'integer',
        comment: 'Primary gernated column',
      },
      graphql: {
        type: 'ID',
      },
    },
    {
      name: 'column1',
      decorator: 'Column',
      type: 'string',
      options: {
        type: 'varchar',
        length: 150,
        nullable: false,
        comment: 'string column1',
      },
      graphql: {
        type: 'ID',
      },
    },
    {
      name: 'column2',
      decorator: 'Column',
      type: 'number',
      options: {
        type: 'integer',
        length: 10,
        nullable: false,
        comment: 'int column2',
      },
      graphql: {
        type: 'ID',
      },
    },
  ],
};

writeFileSync(process.cwd() + '/sample_entity.json', JSON.stringify(sample));
