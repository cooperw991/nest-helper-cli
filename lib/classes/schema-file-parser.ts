import * as fs from 'fs';
import R from 'ramda';

import { ModelRelations } from '../interfaces/relation.interface';
import {
  ModelProperty,
  DataType,
} from '../interfaces/model-property.interface';
import { DataTypeMap } from '../helpers/model-property.helper';

export class SchemaFileParser {
  private _enums: string[];
  private _enumRelations: string[];
  private _models: string[];
  private _contentLines: string[];
  private _modelRelations: ModelRelations;
  private _properties: ModelProperty[];

  get enums(): string[] {
    return this._enums;
  }

  get models(): string[] {
    return this._models;
  }

  get modelRelations(): ModelRelations {
    return this._modelRelations;
  }

  get enumRelations(): string[] {
    return [...new Set(this._enumRelations)];
  }

  get properties(): ModelProperty[] {
    return this._properties;
  }

  private async readingSchemaFile(): Promise<string> {
    let buffer;
    try {
      buffer = await fs.readFileSync('prisma/schema.prisma', {
        encoding: 'utf-8',
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error('prisma/schema.prisma 文件不存在');
      } else {
        throw err;
      }
    }

    return buffer.toString();
  }

  private async parseFileContentToLines(
    fileContent: string,
  ): Promise<string[]> {
    return fileContent.split('\n');
  }

  private parseLineToArray(line: string): string[] {
    return line.trim().replace(/\s+/g, ' ').split(' ');
  }

  public async init() {
    const fileContent = await this.readingSchemaFile();
    this._contentLines = await this.parseFileContentToLines(fileContent);
    this._enums = [];
    this._models = [];
    this._modelRelations = {};
    this._properties = [];
    this._enumRelations = [];
    this.parseEnumsAndModels();
    this.parseRelations();
  }

  private async parseEnumsAndModels() {
    const { _contentLines } = this;

    for (let i = 0; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('//') !== -1) {
        continue;
      }
      const words = _contentLines[i].split(' ');
      if (words.length < 2) {
        continue;
      }
      const decorator = R.trim(words[0]);
      const type = R.trim(words[1]);
      if (decorator === 'enum') {
        this._enums.push(type);
      } else if (decorator === 'model') {
        this._models.push(type);
      }
    }
  }

  private async parseRelations() {
    const { _contentLines, _models } = this;

    let modelName = '';
    for (let i = 0; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('//') !== -1) {
        continue;
      }
      const words = R.trim(_contentLines[i].replace(/\s+/g, ' ')).split(' ');
      if (words.length < 2) {
        continue;
      }

      const decorator = R.trim(words[0]);
      const type = R.trim(words[1].split('?')[0]);

      if (decorator === 'model') {
        modelName = type;
        this._modelRelations[modelName] = {
          o: [],
          m: [],
        };
      }

      if (R.includes(type, _models) && decorator !== 'model') {
        this._modelRelations[modelName].o.push({
          key: decorator,
          value: type,
        });
      } else if (
        R.includes(type.split('[]')[0], _models) &&
        decorator !== 'model'
      ) {
        this._modelRelations[modelName].m.push({
          key: decorator,
          value: type.split('[]')[0],
        });
      }
    }
  }

  public async getModelProperties(modelName: string) {
    const lines = this.findModelLines(modelName);
    for (const line of lines) {
      if (line.indexOf('//') !== -1) {
        continue;
      }
      const lineArray = this.parseLineToArray(line);
      if (lineArray.length <= 1) {
        continue;
      }
      const typeKey = lineArray[1].replace('?', '').replace('[]', '');

      let type = DataTypeMap[typeKey];
      if (type === undefined) {
        type = this._enums.find((item) => item === typeKey)
          ? DataType.Enum
          : DataType.Relation;
      }

      const unique = line.indexOf('@unique') !== -1 ? true : false;
      const property: ModelProperty = {
        key: lineArray[0],
        type: type.type ?? type,
        nullable: lineArray[1].indexOf('?') !== -1,
        isArray: lineArray[1].indexOf('[]') !== -1,
        autoGenerated: line.indexOf('autoincrement') !== -1,
        gqlType: type.gql ?? typeKey,
        tsType: type.ts ?? typeKey,
        unique,
      };

      if (type === DataType.Enum) {
        property.enumName = typeKey;
      } else if (type === DataType.Relation) {
        property.relationName = typeKey;
      }

      this._properties.push(property);

      if (type === DataType.Enum) {
        this._enumRelations.push(typeKey);
      }
    }
  }

  private findModelLines(modelName: string) {
    const { _contentLines } = this;

    let startLine = 0;
    let endLine = 0;

    for (let i = startLine; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf(`model ${modelName}`) !== -1) {
        startLine = i;
        break;
      }
    }

    for (let i = startLine; i < _contentLines.length; i++) {
      if (_contentLines[i] === '}') {
        endLine = i;
        break;
      }
    }

    return _contentLines.slice(startLine + 1, endLine);
  }
}
