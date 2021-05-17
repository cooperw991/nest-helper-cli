import { BaseHandler } from './base-handler';

export class CommonGuardsGenerator extends BaseHandler {
  constructor() {
    super();

    this.outputs['gql-auth.guard.ts'] = this.generateGuardGqlAuth();
  }

  public generateFiles() {
    this.writeFile('gql-auth.guard.ts', 'guards');
  }

  private generateGuardGqlAuth() {
    let output = `import {\n  Injectable,\n  ExecutionContext,\n  UnauthorizedException,\n} from '@nestjs/common';\n`;

    output += `import { AuthGuard } from '@nestjs/passport';\n`;

    output += `import { GqlExecutionContext } from '@nestjs/graphql';\n\n`;

    output += `import { errorMsg } from '../utils/errors.utility';\n\n`;

    output += `@Injectable()\nexport class GqlAuthGuard extends AuthGuard('jwt') {\n`;
    output += `  getRequest(context: ExecutionContext) {\n    const ctx = GqlExecutionContext.create(context);\n    return ctx.getContext().req;\n  }\n\n`;
    output += `  handleRequest<TUser>(err, user: TUser): TUser {\n    if (err || !user) {\n      throw err || new UnauthorizedException(errorMsg().UNAUTHENTICATED);\n    }\n    return user;\n  }\n}\n`;

    return output;
  }
}
