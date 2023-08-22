import { BaseHandler } from './base-handler';

export class CommonDecoratorsGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['current-user.decorator.ts'] = this.generateDecoratorMe();
  }

  public async generateFiles() {
    await this.writeFile('current-user.decorator.ts', 'decorators');
  }

  private generateDecoratorMe() {
    let output = `import { createParamDecorator } from '@nestjs/common';\n\n`;

    output += `export const CurrentUser = createParamDecorator((_data, req) => {\n  return req.user;\n});\n`;

    return output;
  }
}
