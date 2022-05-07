import * as fs from 'fs';
import * as R from 'ramda';

import { EnumObject } from '../interfaces/model-enum.interface';

export class SchemaFileParser {
  private _modelName: string;
  private _contentLines: string[];
  private _targetModel: string[][];
  private _enums: EnumObject[];
  private _models: string[];

  get targetModel(): string[][] {
    return this._targetModel;
  }

  get enums(): EnumObject[] {
    return this._enums;
  }

  get models(): string[] {
    return this._models;
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

  private scanSchemaFile() {
    const { _modelName, _contentLines } = this;

    let targetStart;

    for (const [i, v] of _contentLines.entries()) {
      if (v.indexOf('model ' + _modelName + ' ') !== -1) {
        targetStart = i + 1;
        break;
      }
    }

    for (let i = targetStart; i < _contentLines.length; i++) {
      const line = R.trim(_contentLines[i]);
      if (line === '}') {
        break;
      } else if (line === '') {
        continue;
      } else {
        this._targetModel.push(this.parseLineToArray(line));
      }
    }
  }

  private parseLineToArray(line: string): string[] {
    const trimLine = line.replace(/ +/g, ' ');
    const lineArr = trimLine.split(' ');
    return lineArr;
  }

  public async init(modelName: string) {
    this._modelName = modelName;
    const fileContent = await this.readingSchemaFile();
    this._contentLines = await this.parseFileContentToLines(fileContent);
    this._targetModel = [];
    this._enums = [];
    this._models = [];
    this.scanSchemaFile();
  }

  public parseModelNames() {
    const { _contentLines } = this;

    for (const line of _contentLines) {
      if (line.indexOf('model ') !== -1) {
        const words = line.split(' ');
        this._models.push(words[1]);
      }
    }
  }

  private findUsingEnums(): string[] {
    const { _targetModel } = this;

    const enums = [];

    const baseTypes = [
      'String',
      'Boolean',
      'Int',
      'BigInt',
      'Float',
      'Decimal',
      'DateTime',
      'Json',
      'Bytes',
      'Unsupported',
    ];

    for (const line of _targetModel) {
      let type = line[1];

      if (!type) {
        continue;
      }

      if (type.indexOf('?') !== -1) {
        type = R.dropLast(1, type);
      }

      if (type.indexOf('@') !== -1 || R.includes(type, baseTypes)) {
        continue;
      }

      enums.push(type);
    }

    return enums;
  }

  public async parseEnums(startLine = 0) {
    const { _contentLines } = this;

    const usingEnums = this.findUsingEnums();

    let targetStart;
    const enumObject: EnumObject = {
      name: '',
      values: [],
    };
    for (let i = startLine; i < _contentLines.length; i++) {
      const words = _contentLines[i].split(' ');
      if (words.length < 2) {
        continue;
      }
      const decorator = R.trim(words[0]);
      const type = R.trim(words[1]);
      if (decorator === 'enum' && R.includes(type, usingEnums)) {
        targetStart = i + 1;
        enumObject.name = type;
        break;
      }
    }

    console.log(enumObject);

    for (let j = targetStart; j < _contentLines.length; j++) {
      if (_contentLines[j].indexOf('}') !== -1) {
        targetStart = j + 1;
        break;
      }
      enumObject.values.push(R.trim(_contentLines[j]));
    }

    console.log(enumObject);

    if (enumObject.name && enumObject.values.length) {
      this._enums.push(enumObject);
    }

    console.log(this._enums);

    if (targetStart > _contentLines.length - 1) {
      return this.parseEnums(targetStart);
    }
  }
}
