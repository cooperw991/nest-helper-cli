import * as fs from 'fs';
import * as R from 'ramda';
import * as inflected from 'inflected';

import { createFile } from '../utils/directory.util';

export class AppModuleFileParser {
  private _modelName: string;
  private _contentLines: string[];

  private async readingAppModuleFile(): Promise<string> {
    let buffer;
    try {
      buffer = await fs.readFileSync('src/app.module.ts', {
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

  public async init(modelName: string) {
    this._modelName = modelName;
    const fileContent = await this.readingAppModuleFile();
    this._contentLines = await this.parseFileContentToLines(fileContent);
  }

  public async updateAppModuleFile() {
    const { _contentLines, _modelName } = this;

    const moduleName = inflected.dasherize(inflected.underscore(_modelName));

    let idx = 0;

    for (let i = idx; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('@Module') !== -1) {
        idx = i;
        break;
      }
    }

    for (let i = idx; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('@Module') === -1) {
        idx = ++i;
        break;
      }
    }

    let importLine = `import { ${_modelName}Module } from '@Module/${moduleName}/${moduleName}.module';`;

    this._contentLines = R.insert(idx, importLine, this._contentLines);

    for (let i = idx; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('Module,') !== -1) {
        idx = i;
        break;
      }
    }

    for (let i = idx; i < _contentLines.length; i++) {
      if (_contentLines[i].indexOf('Module,') === -1) {
        idx = ++i;
        break;
      }
    }

    importLine = `    ${_modelName}Module,`;

    this._contentLines = R.insert(idx, importLine, this._contentLines);
  }

  public async writeFile() {
    const targetDir = process.cwd() + '/src/';
    const output = this._contentLines.join('\n');

    await createFile('app.module.ts', targetDir, output, true);

    console.log(`app.module.ts updated!`);
  }
}
