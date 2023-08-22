import { p2, p4, p6, p8 } from '../../utils/pad.util';
import { BaseHandler } from './base-handler';

export class CommonUtilsGenerator extends BaseHandler {
  constructor() {
    super();

    this.generateErrorUtility();
    this.generateLoggerUtility();
    this.generatePaginationUtility();
    this.generateWordsUtility();
  }

  public async generateFiles() {
    await this.writeFile('errors.utility.ts', 'utils');
    await this.writeFile('logger.utility.ts', 'utils');
    await this.writeFile('pagination.utility.ts', 'utils');
    await this.writeFile('words.utility.ts', 'utils');
  }

  private generateErrorUtility() {
    const output = `export const errorMsg = (msgArr = []) => {\n${p2}return {\n${p4}// Global\n${p4}UNAUTHENTICATED: '',\n${p4}PERMISSION_DENY: '',\n${p4}INTERNAL_SERVER_ERROR: '',\n${p4}NOT_EXIST: '',\n${p2}};\n};\n`;

    this.outputs['errors.utility.ts'] = output;
  }

  private generateLoggerUtility() {
    let output = `import * as winston from 'winston';\nimport * as dayjs from 'dayjs';\n\n`;

    output += `const { combine, timestamp, printf } = winston.format;\n\nconst myFormat = printf((info) => {\n${p2}return \`\${info.timestamp} \${info.level}: \${info.message}\`;\n});\n\n`;

    output += `const time = dayjs().format('YYYY-MM-DD');\n\n`;

    output += `winston.addColors({\n${p2}error: 'red',\n${p2}warn: 'yellow',\n${p2}info: 'cyan',\n${p2}debug: 'green',\n});\n\n`;

    output += `const logger = winston.createLogger({\n${p2}level: 'info',\n${p2}format: combine(timestamp(), myFormat),\n${p2}transports: [\n${p4}//\n${p4}// - Write to all logs with level \`info\` and below to \`combined.log\`\n${p4}// - Write all logs error (and below) to \`error.log\`.\n${p4}//\n${p4}new winston.transports.File({\n${p6}filename: \`logs/\${time}-error.log\`,\n${p6}level: 'error',\n${p4}}),\n${p4}new winston.transports.File({ filename: \`logs/\${time}-combined.log\` }),\n${p2}],\n});\n\n`;

    output += `//\n// If we're not in production then log to the \`console\` with the format:\n// \`\${info.level}: \${info.message} JSON.stringify({ ...rest }) \`\n//\nif (process.env.NODE_ENV !== 'production') {\n${p2}logger.add(\n${p4}new winston.transports.Console({\n${p6}format: winston.format.combine(\n${p8}winston.format.colorize(),\n${p8}winston.format.simple(),\n${p6}),\n${p4}}),\n${p2});\n}\n\n`;

    output += `export default logger;\n`;

    this.outputs['logger.utility.ts'] = output;
  }

  private generatePaginationUtility() {
    let output = `import { PagingInfo } from '../dto/paging-info.object';\nimport { PagingQuery } from '../interfaces/paging-query.interface';\n\n`;

    output += `export function fillWithDefaultPaging(\n${p2}paging: PagingQuery | null | undefined,\n): PagingQuery {\n${p2}if (!paging) {\n${p4}return {\n${p6}offset: 0,\n${p6}limit: 10,\n${p4}};\n${p2}}\n\n${p2}if (!paging.offset) {\n${p4}paging.offset = 0;\n${p2}}\n${p2}if (!paging.limit) {\n${p4}paging.limit = 10;\n${p2}}\n${p2}return paging;\n}\n\n`;

    output += `export function pagingResponse(paging: any, totalCount: number): PagingInfo {\n${p2}paging = fillWithDefaultPaging(paging);\n${p2}return {\n${p4}totalCount,\n${p4}currentOffset: paging.offset,\n${p4}currentLimit: paging.limit,\n${p2}};\n}\n`;

    this.outputs['pagination.utility.ts'] = output;
  }

  private generateWordsUtility() {
    const pattern1 =
      /[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?/\，/\。/\；/\：/\“/\”/\》/\《/\|/\{/\}/\、/\!/\~/\`]/g;
    const pattern2 = /\s+/g;
    const output = `export function splitWordsBySymbol(value: string): string[] {\n${p2}return value\n${p4}.replace(\n${p6}${pattern1},\n${p6}' ',\n${p4})\n${p4}.replace(${pattern2}, ' ')\n${p4}.split(' ');\n}\n`;

    this.outputs['words.utility.ts'] = output;
  }
}
