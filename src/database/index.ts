import { connect, set } from 'mongoose';
import { NODE_ENV, CONNECTION_URI, DB_DATABASE } from '@config';
import { logger } from '@/utils/logger';

export const dbConnection = async () => {
  const dbConfig = {
    url: `${CONNECTION_URI}/${DB_DATABASE}?retryWrites=true&w=majority&appName=node-rfp-app`,
    options: {
 
      connectTimeoutMS: 30000,    // 30 seconds to establish connection
      socketTimeoutMS: 45000,     // 45 seconds for socket operations
    },
  };

  if (NODE_ENV !== 'production') {
    set('debug', true);
  }

  await connect(dbConfig.url)
    .then(() => {
      logger.info(`DB Connected Successfully!`);
    })
    .catch(err => {
      logger.error(`DB Connection Error ${err.message}`);
    });
};
