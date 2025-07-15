import { CONNECTION_URI, DB_DATABASE } from '@/config';
import { logger } from '@/utils/logger';
import mongoose, { connect } from 'mongoose';
import { seedRolePermission } from './rolePermission';
console.log({ CONNECTION_URI });
(async () => {
  try {
    const dbConfig = {
      url: `${CONNECTION_URI}/${DB_DATABASE}?retryWrites=true&w=majority&appName=node-rfp-app`,
    };

    await connect(dbConfig.url)
      .then(async () => {
        logger.info(`Seed DB Connected Successfully!`);
        await seedRolePermission();
        process.exit(0); // Exit with success status
      })
      .catch(err => {
        logger.error(`Seed DB Connection Error ${err.message}`);
        mongoose.connection.close();
        process.exit(1); // Exit with failure status
      });
  } catch (error) {
    logger.error(error.message);
  }
})();
