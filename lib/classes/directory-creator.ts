import { mkdirOfPath } from '../utils/directory.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';

import { BaseHandler } from './base-handler';

export class DirectoryCreator extends BaseHandler {
  constructor(json: EntityJsonInterface) {
    super(json);
  }

  private async createInterfacePath() {
    return mkdirOfPath(
      process.cwd() + `/src/modules/${this.moduleName}/interfaces`,
    );
  }

  private async createDTOPath() {
    return mkdirOfPath(process.cwd() + `/src/modules/${this.moduleName}/dto`);
  }

  public async createModulePath() {
    await mkdirOfPath(process.cwd() + `/src/modules/${this.moduleName}`);
    return Promise.all([this.createInterfacePath(), this.createDTOPath()]);
  }
}
