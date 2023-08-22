import * as R from 'ramda';

import { FileGenerator } from './file-generator';
import { GeneratorParams } from '../interfaces/generator-param.interface';

export class FindIncludeGenerator extends FileGenerator {
  constructor(params: GeneratorParams) {
    super(params);

    this.suffix = 'input';
    this.models = params.models;
    this.output += this.writeGqlDependencies();
    this.output += this.writeFindIncludeClass();
  }

  public async generateFile(ifReplace: boolean) {
    await this.writeFile('dto/find-include', ifReplace);
  }

  private writeGqlDependencies(): string {
    return `import { Field, InputType } from '@nestjs/graphql';\n\n`;
  }

  private writeFindIncludeClass(): string {
    const { className, modelRelations, modelName } = this;

    let output = `@InputType({\n  description: '${className} Relations Querying',\n})\n`;
    output += `export class ${this.className}FindInclude {\n`;

    const { o, m } = modelRelations[modelName];

    for (const item of o) {
      output += `@Field(() => Boolean, { nullable: true })\n  ${item.key}: boolean | null;\n\n`;
    }

    for (const item of m) {
      output += `@Field(() => Boolean, { nullable: true })\n  ${item.key}: boolean | null;\n\n`;
    }

    output = R.dropLast(1, output);
    output += '}\n';
    return output;
  }
}
