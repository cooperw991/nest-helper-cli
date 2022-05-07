import { BaseHandler } from './base-handler';

export class CommonDecoratorsGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['me.decorator.ts'] = this.generateDecoratorMe();
  }

  public async generateFiles() {
    await this.writeFile('me.decorator.ts', 'decorators');
  }

  private generateDecoratorMe() {
    let output = `import { createParamDecorator } from '@nestjs/common';\n\n`;

    output += `export const Me = createParamDecorator((_data, req) => {\n  return req.user;\n});\n`;

    return output;
  }
}
