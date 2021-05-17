import { mkdirOfPath } from '../../utils/directory.util';

export class CommonDirectoryCreator {
  private async createInterfacesPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/interfaces`);
  }

  private async createDTOPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/dto`);
  }

  private async createdecoratorsPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/decorators`);
  }

  private async createGuardsPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/guards`);
  }

  private async createHelpersPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/helpers`);
  }

  private async createUtilsPath() {
    return mkdirOfPath(process.cwd() + `/.nest-helper-cli/utils`);
  }

  public async createModulePath() {
    await mkdirOfPath(process.cwd() + `/.nest-helper-cli`);
    return Promise.all([
      this.createInterfacesPath(),
      this.createDTOPath(),
      this.createdecoratorsPath(),
      this.createGuardsPath(),
      this.createUtilsPath(),
      this.createHelpersPath(),
    ]);
  }
}
