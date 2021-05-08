import logger from './logger.util';

export function run(f) {
  f()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      logger.error('Error encountered:', e);
      process.exit(1);
    });
}
