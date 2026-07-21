import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Nova Runner API escuchando en http://localhost:${config.port}`, {
    env: config.nodeEnv,
  });
});
