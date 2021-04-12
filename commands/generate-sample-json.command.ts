import * as fs from 'fs'

const sample = {
  name: 'sampleEntity',
  prefix: 'sp_',
  isSoftDelete: false,
  enums: [],
  columns: [
    {
      name: 'id',
      type: 'PrimaryGenerated',
      options: {
        type: 'integer',
        length: 10,
        nullable: false,
        comment: ''
      },
      graphql: {
        type: 'ID'
      }
    }
  ]
}

fs.writeFileSync(process.cwd() + '/sample_entity.json', JSON.stringify(sample))
