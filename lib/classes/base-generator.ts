import * as fs from 'fs';
import * as inflected from 'inflected';

import { mkdirOfPath } from '../utils/directory.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';

export class BaseGenerator {
  constructor(json: EntityJsonInterface) {
    this.data = json;
    this.output = '';
    this.className = inflected.camelize(this.data.name);
    this.variableName = inflected.camelize(this.data.name, false);
    this.moduleName = inflected.dasherize(this.data.name);
    this.tableName = this.data.prefix + inflected.tableize(this.data.name);
  }
  protected data: EntityJsonInterface;
  protected output: string;
  protected suffix: string;
  protected className: string;
  protected moduleName: string;
  protected tableName: string;
  protected variableName: string;

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
