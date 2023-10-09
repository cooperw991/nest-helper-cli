import { arrayToString } from '../../utils/array.util';

export class WriteDependencies {
  static writeGqlDependencies(
    gqlTypes: string[],
    classValidators: string[],
  ): string {
    let output = '';
    if (gqlTypes) {
      const gqlTypeStr = arrayToString([...gqlTypes, 'Field', 'InputType']);
      output += `import { ${gqlTypeStr} } from '@nestjs/graphql';\n`;
    } else {
      output += `import { Field, InputType } from '@nestjs/graphql';\n`;
    }

    if (classValidators.length) {
      const validatorStr = arrayToString(classValidators);
      output += `import { ${validatorStr} } from 'class-validator';\n`;
    }

    return output;
  }

  static writeEnumDependencies(enumRelations: string[]): string {
    if (!enumRelations.length) {
      return '';
    }

    const enumStr = enumRelations.join(', ');
    return `import { ${enumStr} } from '@prisma/client';\n`;
  }
}
