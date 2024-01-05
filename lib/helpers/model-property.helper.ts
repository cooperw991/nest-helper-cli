import { DataType } from '../interfaces/model-property.interface';

export const DataTypeMap = {
  Int: {
    type: DataType.Int,
    gql: 'Int',
    ts: 'number',
  },
  BigInt: {
    type: DataType.BigInt,
    gql: 'Float',
    ts: 'number',
  },
  String: {
    type: DataType.String,
    gql: 'String',
    ts: 'string',
  },
  DateTime: {
    type: DataType.DateTime,
    gql: 'Date',
    ts: 'Date',
  },
  Boolean: {
    type: DataType.Boolean,
    gql: 'Boolean',
    ts: 'boolean',
  },
  Float: {
    type: DataType.Float,
    gql: 'Float',
    ts: 'number',
  },
  Decimal: {
    type: DataType.Decimal,
    gql: 'Float',
    ts: 'Prisma.Decimal',
  },
  Json: {
    type: DataType.Json,
    gql: 'String',
    ts: 'Prisma.JsonValue',
  },
  Bytes: {
    type: DataType.Bytes,
    gql: 'String',
    ts: 'string',
  },
  Unsupported: {
    type: DataType.Unsupported,
    gql: 'String',
    ts: 'string',
  },
  Relation: {
    type: DataType.Relation,
  },
  Enum: {
    type: DataType.Enum,
  },
  Money: {
    type: DataType.Money,
    gql: 'Float',
    ts: 'Prisma.Decimal',
  },
};
