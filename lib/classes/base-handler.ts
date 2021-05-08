import * as R from 'ramda';
import * as inflected from 'inflected';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';

export class BaseHandler {
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
  protected dasherizePluralizeName: string;

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

    // 全小写横线复数：全小写，短横线连接，复数
    this.dasherizePluralizeName = inflected.dasherize(newPluralizedName);
  }
}
