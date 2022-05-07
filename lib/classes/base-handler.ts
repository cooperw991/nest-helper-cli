import * as R from 'ramda';
import * as inflected from 'inflected';

import { EnumObject } from '../interfaces/model-enum.interface';

export class BaseHandler {
  constructor(modelName: string, modelLines: string[][]) {
    this.modelName = modelName;
    this.data = modelLines;
    this.output = '';
    this.enums = [];
    this.gqlTypes = [];

    this.initNames();
  }
  protected modelName: string;
  protected data: string[][];
  protected output: string;
  protected suffix: string;
  protected className: string;
  protected moduleName: string;
  protected variableName: string;
  protected camelPluralizeName: string;
  protected uppperCamelPluralizeName: string;
  protected dasherizePluralizeName: string;
  protected upperUnderscoreName: string;
  protected enums: string[];
  protected enumObjects: EnumObject[];
  protected gqlTypes: string[];
  protected models: string[];

  private initNames() {
    // 类名称：首字母大写，驼峰
    this.className = inflected.camelize(this.modelName);

    // 变量名称：首字母小写，驼峰
    this.variableName = inflected.camelize(this.modelName, false);

    // 模块名称：全小写，短横线连接
    this.moduleName = inflected.dasherize(inflected.underscore(this.modelName));

    const nameArr = inflected.underscore(this.modelName).split('_');
    const pluralizedLastWord = inflected.pluralize(R.last(nameArr));
    nameArr[nameArr.length - 1] = pluralizedLastWord;
    const newPluralizedName = nameArr.join('_');

    // 首字母小写复数：首字母小写，驼峰，复数
    this.camelPluralizeName = inflected.camelize(newPluralizedName, false);

    // 首字母大写复数：首字母大写，驼峰，复数
    this.uppperCamelPluralizeName = inflected.camelize(newPluralizedName);

    // 全小写横线复数：全小写，短横线连接，复数
    this.dasherizePluralizeName = inflected.dasherize(newPluralizedName);

    // 全大写下划线连接
    this.upperUnderscoreName = inflected
      .underscore(this.modelName)
      .toUpperCase();
  }

  protected parseFieldType(type: string): [string, string] {
    switch (type) {
      case 'String':
        return ['String', 'string'];
      case 'Boolean':
        return ['Boolean', 'boolean'];
      case 'Int':
        this.gqlTypes = [...new Set([...this.gqlTypes, 'Int'])];
        return ['Int', 'number'];
      case 'BigInt':
        return ['Float', 'number'];
      case 'Float':
        return ['Float', 'number'];
      case 'Decimal':
        return ['Float', 'number'];
      case 'DateTime':
        return ['Date', 'Date'];
      case 'Json':
        return ['String', 'any'];
      case 'Bytes':
        return ['String', 'string'];
      case 'Unsupported':
        return ['String', 'string'];
      default:
        if (!R.includes(type, this.models)) {
          this.enums.push(type);
        }
        return [type, type];
    }
  }
}
