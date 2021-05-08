import * as inflected from 'inflected';

import { EntityJsonInterface } from '../interfaces/entity-json.interface';
import { FileGenerator } from './file-generator';

export class OrderInterfaceGenerator extends FileGenerator {
  constructor(json: EntityJsonInterface) {
    super(json);
    this.suffix = 'interface';
    this.orderDecorator = this.uppperCamelPluralizeName + 'Order';
    this.orderByDecorator = this.orderDecorator + 'By';
    this.output += this.writeTypeGraphqlDependencies();
    this.output += this.writeEnum();
    this.output += this.writeOrderClass();
  }

  private orderDecorator: string;
  private orderByDecorator: string;

  public generateFile() {
    this.writeFile('orderby-' + this.moduleName, 'interfaces');
  }

  private writeTypeGraphqlDependencies(): string {
    return `import { Field, InputType, registerEnumType } from 'type-graphql';\n\n`;
  }

  private writeEnum(): string {
    const {
      orderByDecorator,
      variableName,
      data: { columns },
    } = this;

    let output = `export enum ${orderByDecorator} {\n`;
    for (const col of columns) {
      if (col.api && !col.api.view) {
        continue;
      }

      const enumKey = inflected.underscore(col.name).toUpperCase();

      output += `  ${enumKey} = '${variableName}.${col.name}',\n`;
    }

    output += `  CREATED_AT = '${variableName}.createdAt',\n  UPDATED_AT = '${variableName}.updatedAt',\n`;

    output += '}\n';

    const pluralize = inflected.pluralize(inflected.classify(this.data.name));

    output += `registerEnumType(${orderByDecorator}, {\n  name: '${orderByDecorator}',\n  description: '${pluralize} Sortable Fields',\n});\n\n`;

    return output;
  }

  private writeOrderClass(): string {
    const { orderByDecorator, orderDecorator } = this;

    return `@InputType()\nexport class ${orderDecorator} {\n  @Field(() => ${orderByDecorator})\n  by: ${orderByDecorator};\n\n  @Field({ defaultValue: false })\n  asc: boolean;\n}\n`;
  }
}
