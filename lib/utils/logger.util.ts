import * as winston from 'winston';
const { combine, timestamp, printf } = winston.format;
import * as dayjs from 'dayjs';

const myFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});
const time = dayjs().format('YYYY-MM-DD');
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
});
const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: `logs/${time}-error.log`,
      level: 'error',
    }),
    new winston.transports.File({ filename: `logs/${time}-combined.log` }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default logger;
