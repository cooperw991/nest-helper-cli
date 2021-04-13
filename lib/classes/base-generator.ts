import * as fs from 'fs';
import { mkdirOfPath } from '../utils/directory.util';

export class BaseGenerator {
  protected data;
  protected output;
  protected suffix;

  public async writeFile(fileName: string) {
    const { output, suffix } = this;
    const targetDir = process.cwd() + '/src' + '/modules/' + fileName;

    const status = await mkdirOfPath(targetDir);

    if (!status) {
      return;
    }

    fs.writeFileSync(`${targetDir}/${fileName}.${suffix}.ts`, output);
  }
}
