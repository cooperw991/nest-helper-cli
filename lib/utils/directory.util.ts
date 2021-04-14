import * as fs from 'fs';
import * as path from 'path';

export async function mkdirOfPath(dir: string) {
  const tempstats: boolean = await new Promise((resolve) => {
    fs.stat(dir, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });

  if (tempstats) {
    return true;
  }

  const tempDir = path.parse(dir).dir;
  const status = await mkdirOfPath(tempDir);

  if (status) {
    fs.mkdirSync(dir);
  }

  return true;
}

export async function createFile(
  fileName: string,
  dirPath: string,
  content: string,
) {
  const filePath = dirPath + fileName;
  const tempstats: boolean = await new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats.isFile());
      }
    });
  });

  if (tempstats) {
    return true;
  }

  const tempDir = path.parse(filePath).dir;
  const status = await mkdirOfPath(tempDir);

  if (status) {
    fs.writeFileSync(filePath, content);
  }

  return true;
}
