import { BaseHandler } from './base-handler';

export class CommonUtilsGenerator extends BaseHandler {
  constructor() {
    super();

    this.generateErrorUtility();
    this.generateLoggerUtility();
    this.generatePaginationUtility();
    this.generateWordsUtility();
  }

  public generateFiles() {
    this.writeFile('errors.utility.ts', 'utils');
    this.writeFile('paging-query.interface.ts', 'utils');
    this.writeFile('pagination.utility.ts', 'utils');
    this.writeFile('words.interface.ts', 'utils');
  }

  private generateErrorUtility() {
    const output = `export const errorMsg = (msgArr = []) => {\n  return {\n    // Global\n    UNAUTHENTICATED: '',\n    PERMISSION_DENY: '',\n    INTERNAL_SERVER_ERROR: '',\n    NOT_EXIST: '',\n  };\n};\n`;

    this.outputs['errors.utility.ts'] = output;
  }

  private generateLoggerUtility() {
    let output = `import * as winston from 'winston';\nimport * as dayjs from 'dayjs';\n\n`;

    output += `const { combine, timestamp, printf } = winston.format;\n\nconst myFormat = printf((info) => {\n  return \`\${info.timestamp} \${info.level}: \${info.message}\`;\n});\n\n`;

    output += `const time = dayjs().format('YYYY-MM-DD');\n\n`;

    output += `winston.addColors({\n  error: 'red',\n  warn: 'yellow',\n  info: 'cyan',\n  debug: 'green',\n});\n\n`;

    output += `const logger = winston.createLogger({\n  level: 'info',\n  format: combine(timestamp(), myFormat),\n  transports: [\n    //\n    // - Write to all logs with level \`info\` and below to \`combined.log\`\n    // - Write all logs error (and below) to \`error.log\`.\n    //\n    new winston.transports.File({\n      filename: \`logs/\${time}-error.log\`,\n      level: 'error',\n    }),\n    new winston.transports.File({ filename: \`logs/\${time}-combined.log\` }),\n  ],\n});\n\n`;

    output += `//\n// If we're not in production then log to the \`console\` with the format:\n// \`\${info.level}: \${info.message} JSON.stringify({ ...rest }) \`\n//\nif (process.env.NODE_ENV !== 'production') {\n  logger.add(\n    new winston.transports.Console({\n      format: winston.format.combine(\n        winston.format.colorize(),\n        winston.format.simple(),\n      ),\n    }),\n  );\n}\n\n`;

    output += `export default logger;\n`;

    this.outputs['logger.utility.ts'] = output;
  }

  private generatePaginationUtility() {
    let output = `import { PagingInfo } from '../dto/paging-info.dto';\n\n`;

    output = `function fillWithDefaultPaging(paging): unknown {\n if (!paging) {\n    return {\n      offset: 0,\n      limit: 10,\n    };\n  }\n\n  if (!paging.offset) {\n    paging.offset = 0;\n  }\n  if (!paging.limit) {\n    paging.limit = 10;\n  }\n  return paging;\n}\n\n`;

    output += `export function typeormPaging(paging): unknown {\n  paging = fillWithDefaultPaging(paging);\n  return {\n    skip: paging.offset,\n    take: paging.limit,\n  };\n}\n\n`;

    output += `export function pagingResponse(paging:, totalCount): PagingInfo {\n  paging = fillWithDefaultPaging(paging);\n  return {\n    totalCount,\n    currentOffset: paging.offset,\n    currentLimit: paging.limit,\n  };\n}\n`;

    this.outputs['pagination.utility.ts'] = output;
  }

  private generateWordsUtility() {
    const pattern1 = /[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?/\，/\。/\；/\：/\“/\”/\》/\《/\|/\{/\}/\、/\!/\~/\`]/g;
    const pattern2 = /\s+/g;
    const output = `export function splitWordsBySymbol(value: string): string[] {\n  return value\n    .replace(\n${pattern1},\n      ' ',\n    )\n    .replace(${pattern2}, ' ')\n    .split(' ');\n}\n`;

    this.outputs['words.utility.ts'] = output;
  }
}
