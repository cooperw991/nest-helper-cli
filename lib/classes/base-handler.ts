import * as R from 'ramda';
import * as inflected from 'inflected';

import { ModelRelations } from '../interfaces/relation.interface';
import { ModelProperty } from '../interfaces/model-property.interface';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class BaseHandler {
  constructor(params: GeneratorParams) {
    this.modelName = params.modelName;
    this.properties = params.properties;
    this.modelRelations = params.modelRelations;
    this.models = params.models;
    this.enumRelations = params.enumRelations;
    this.enums = params.enums;
    this.output = '';
    this.gqlTypes = [];
    this.classValidators = [];

    this.initNames();
    this.findGqlTypes();
  }
  protected modelName: string;
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
  protected gqlTypes: string[];
  protected models: string[];
  protected modelRelations: ModelRelations;
  protected enumRelations: string[];
  protected properties: ModelProperty[];
  protected classValidators: string[];

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

  private findGqlTypes() {
    const { properties } = this;

    for (const property of properties) {
      if (property.gqlType === 'Int' || property.gqlType === 'Float') {
        this.gqlTypes.push(property.gqlType);
      }
    }

    this.gqlTypes = [...new Set(this.gqlTypes)];
  }
}
