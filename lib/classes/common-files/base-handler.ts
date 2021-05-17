import { createFile } from '../../utils/directory.util';
import { mkdirOfPath } from '../../utils/directory.util';

export class BaseHandler {
  constructor() {
    this.outputs = {};
  }

  protected outputs: {
    [key: string]: string;
  };

  protected async writeFile(fileName: string, upperDir: string) {
    const { outputs } = this;

    const targetDir = process.cwd() + '.nest-helper-cli/' + upperDir;

    mkdirOfPath(targetDir);

    await createFile(`${fileName}`, `${targetDir}/`, outputs[fileName], true);
  }
}
