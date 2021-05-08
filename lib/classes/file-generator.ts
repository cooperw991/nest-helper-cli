import { createFile } from '../utils/directory.util';
import { EntityJsonInterface } from '../interfaces/entity-json.interface';

import { BaseHandler } from './base-handler';

export class FileGenerator extends BaseHandler {
  constructor(json: EntityJsonInterface) {
    super(json);
  }

  public async writeFile(fileName: string, upperDir?: string) {
    const { suffix, output } = this;
    const targetDir = upperDir
      ? process.cwd() + '/src' + '/modules/' + this.moduleName + '/' + upperDir
      : process.cwd() + '/src' + '/modules/' + this.moduleName;

    await createFile(`${fileName}.${suffix}.ts`, `${targetDir}/`, output, true);
  }
}
