import * as fs from 'fs';

import {
  humpToDash,
  lineToHump,
  firstUpperCase,
  humpToUnderscore,
} from '../utils/conversion.util';
import { mkdirOfPath } from '../utils/directory.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';

export class BaseGenerator {
  constructor(json: EntityJsonInterface) {
    this.data = json;
    this.output = '';
    this.className = firstUpperCase(lineToHump(this.data.name));
    this.moduleName = humpToDash(this.data.name);
    this.tableName = this.data.prefix + humpToUnderscore(this.data.name);
  }
  protected data: EntityJsonInterface;
  protected output: string;
  protected suffix: string;
  protected className: string;
  protected moduleName: string;
  protected tableName: string;

  public async writeFile(fileName: string, upperDir?: string) {
    const { suffix, output } = this;
    const targetDir = upperDir
      ? process.cwd() + '/src' + '/modules/' + this.moduleName + '/' + upperDir
      : process.cwd() + '/src' + '/modules/' + this.moduleName;

    const status = await mkdirOfPath(targetDir);

    if (!status) {
      return;
    }

    fs.writeFileSync(`${targetDir}/${fileName}.${suffix}.ts`, output);
  }
}
