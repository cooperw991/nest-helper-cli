import { createFile } from '../utils/directory.util';

import { BaseHandler } from './base-handler';

export class FileGenerator extends BaseHandler {
  constructor(modelName: string, modelLines: string[][]) {
    super(modelName, modelLines);
  }

  public async writeFile(fileName: string, upperDir?: string) {
    const { suffix, output } = this;
    const targetDir = upperDir
      ? process.cwd() + '/src' + '/modules/' + this.moduleName + '/' + upperDir
      : process.cwd() + '/src' + '/modules/' + this.moduleName;

    await createFile(`${fileName}.${suffix}.ts`, `${targetDir}/`, output, true);

    console.log(`${fileName}.${suffix}.ts created!`);
  }
}
