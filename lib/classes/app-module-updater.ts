import { readFileSync, existsSync } from 'fs';
import { createFile } from '../utils/directory.util';
import * as R from 'ramda';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

interface MatchFuncInterfacce {
  (string): boolean;
}

export class AppModuleUpdater extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
  }

  private decoratorStartAt: number;
  private decoratorEndAt: number;
  private fileStr: string;
  private fileLines: string[];

  public async updateAppModuleFile() {
    if (!this.readAppModuleFile()) {
      return;
    }

    this.findDecoratorLines();

    this.updateAppFile();
    await createFile(
      'app.module.ts',
      process.cwd() + '/src/',
      this.fileStr,
      true,
    );
  }

  private readAppModuleFile(): boolean {
    const filePath = process.cwd() + '/src/app.module.ts';
    const ifExist = existsSync(filePath);

    if (!ifExist) {
      return false;
    }

    this.fileStr = readFileSync(filePath, 'utf8');
    this.fileLines = this.fileStr.split('\n');

    return true;
  }

  private updateAppFile() {
    const { className, moduleName } = this;
    const importingLineIdx = this.findImportingLine();

    this.fileLines = R.insert(
      importingLineIdx,
      `import { ${className}Module } from './modules/${moduleName}/${moduleName}.module';`,
    )(this.fileLines);

    const injectingLineIdx = this.findInjectingLine();

    if (injectingLineIdx !== -1) {
      this.fileLines = R.insert(
        injectingLineIdx,
        `    ${className}Module,`,
      )(this.fileLines);
    }

    this.fileStr = this.fileLines.join('\n');

    return;
  }

  private findDecoratorLines() {
    const { findLineWithValue, fileLines } = this;
    this.decoratorStartAt = R.findIndex(findLineWithValue('@Module({'))(
      fileLines,
    );
    this.decoratorEndAt = R.findLastIndex(findLineWithValue('})'))(fileLines);
  }

  private findImportingLine(): number {
    const { fileLines, findLineWithValue } = this;
    const lastImportingLineIndex = R.findLastIndex(findLineWithValue('from '))(
      fileLines,
    );

    return lastImportingLineIndex + 1;
  }

  private findInjectingLine(): number {
    const { fileLines, decoratorEndAt, findLineWithValue } = this;

    const importsIdx = R.findIndex(findLineWithValue('imports:'))(fileLines);

    if (importsIdx === -1) {
      return -1;
    }

    const controllersIdx = R.findIndex(findLineWithValue('controllers:'))(
      fileLines,
    );

    const providersIdx = R.findIndex(findLineWithValue('provides:'))(fileLines);

    const exportsIdx = R.findIndex(findLineWithValue('exports:'))(fileLines);

    const propertyIdxArr = R.sort((a, b) => a - b)([
      controllersIdx,
      providersIdx,
      exportsIdx,
    ]);

    let importsEndLine = decoratorEndAt - 1;

    for (const idx of propertyIdxArr) {
      if (idx > importsIdx) {
        importsEndLine = idx - 1;
        break;
      }
    }

    return importsEndLine === importsIdx ? -1 : importsEndLine;
  }

  private findLineWithValue(searchVal: string): MatchFuncInterfacce {
    return function (line: string) {
      return line.includes(searchVal);
    };
  }
}
