import * as fs from 'fs';
import * as R from 'ramda';
import * as inflected from 'inflected';

import { mkdirOfPath } from '../utils/directory.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';

export class BaseGenerator {
  constructor(json: EntityJsonInterface) {
    this.data = json;
    this.output = '';

    this.initNames();
  }
  protected data: EntityJsonInterface;
  protected output: string;
  protected suffix: string;
  protected className: string;
  protected moduleName: string;
  protected tableName: string;
  protected variableName: string;
  protected camelPluralizeName: string;
  protected uppperCamelPluralizeName: string;

  private initNames() {
    // 类名称：首字母大写，驼峰
    this.className = inflected.camelize(this.data.name);

    // 变量名称：首字母小写，驼峰
    this.variableName = inflected.camelize(this.data.name, false);

    // 模块名称：全小写，短横线连接
    this.moduleName = inflected.dasherize(inflected.underscore(this.data.name));

    // 表名称：全小写，下划线连接，前缀
    this.tableName = this.data.prefix + inflected.tableize(this.data.name);

    const nameArr = inflected.underscore(this.data.name).split('_');
    const pluralizedLastWord = inflected.pluralize(R.last(nameArr));
    nameArr[nameArr.length - 1] = pluralizedLastWord;
    const newPluralizedName = nameArr.join('_');

    // 首字母小写复数：首字母小写，驼峰，复数
    this.camelPluralizeName = inflected.camelize(newPluralizedName, false);

    // 首字母大写复数：首字母小写，驼峰，复数
    this.uppperCamelPluralizeName = inflected.camelize(newPluralizedName);
  }

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
