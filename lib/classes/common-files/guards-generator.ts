import { BaseHandler } from './base-handler';
import { p2, p4, p6 } from '../../utils/pad.util';

export class CommonGuardsGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['gql-auth.guard.ts'] = this.generateGuardGqlAuth();
  }

  public async generateFiles() {
    await this.writeFile('gql-auth.guard.ts', 'guards');
  }

  private generateGuardGqlAuth() {
    let output = `import {\n${p2}Injectable,\n${p2}ExecutionContext,\n${p2}UnauthorizedException,\n} from '@nestjs/common';\n`;

    output += `import { AuthGuard } from '@nestjs/passport';\n`;

    output += `import { GqlExecutionContext } from '@nestjs/graphql';\n\n`;

    output += `import { errorMsg } from '../utils/errors.utility';\n\n`;

    output += `@Injectable()\nexport class GqlAuthGuard extends AuthGuard('jwt') {\n`;
    output += `${p2}getRequest(context: ExecutionContext) {\n${p4}const ctx = GqlExecutionContext.create(context);\n${p4}return ctx.getContext().req;\n  }\n\n`;
    output += `${p2}handleRequest<TUser>(err, user: TUser): TUser {\n    if (err || !user) {\n${p6}throw err || new UnauthorizedException(errorMsg().UNAUTHENTICATED);\n${p4}}\n${p4}return user;\n  }\n}\n`;

    return output;
  }
}
