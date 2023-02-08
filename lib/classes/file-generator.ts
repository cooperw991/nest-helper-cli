import { createFile, ifFileExsist, renameFile } from '../utils/directory.util';

import { BaseHandler } from './base-handler';
import { GeneratorParams } from '../interfaces/generator-param.interface';
import dayjs from 'dayjs';

export class FileGenerator extends BaseHandler {
  constructor(params: GeneratorParams) {
    super(params);
  }

  public async writeFile(
    fileName: string,
    ifReplace = false,
    upperDir?: string,
  ) {
    const { suffix, output } = this;
    const targetDir = upperDir
      ? process.cwd() + '/src' + '/modules/' + this.moduleName + '/' + upperDir
      : process.cwd() + '/src' + '/modules/' + this.moduleName;

    if (!ifReplace) {
      if (await ifFileExsist(`${targetDir}/${fileName}.${suffix}.ts`)) {
        const now = dayjs().unix();
        const backupName = `${fileName}.${suffix}.${now}_bac.ts`;

        await renameFile(
          `${targetDir}/${fileName}.${suffix}.ts`,
          `${targetDir}/${backupName}`,
        );
      }
    }

    await createFile(`${fileName}.${suffix}.ts`, `${targetDir}/`, output, true);

    console.log(`${fileName}.${suffix}.ts created!`);
  }
}
