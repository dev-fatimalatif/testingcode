import { UserModel } from '@/models/users.model';
import { UserStatusEnum } from '@/interfaces/users.interface';
import { logger } from '@/utils/logger';
import { CONNECTION_URI, DB_DATABASE } from '@/config';
import mongoose, { connect } from 'mongoose';

const updateAllUsersStatus = async () => {
  try {
    const dbConfig = {
      url: `${CONNECTION_URI}/${DB_DATABASE}?retryWrites=true&w=majority&appName=node-rfp-app`,
    };

    await connect(dbConfig.url)
      .then(async () => {
        logger.info('Connected to MongoDB');

        // Update all users' status to Active (1)
        const result = await UserModel.updateMany(
          {}, // empty filter means all documents
          { $set: { status: UserStatusEnum.Active } }
        );

        logger.info(`Updated ${result.modifiedCount} users to Active status`);
        process.exit(0); // Exit with success status
      })
      .catch(err => {
        logger.error(`DB Connection Error ${err.message}`);
        mongoose.connection.close();
        process.exit(1); // Exit with failure status
      });

  } catch (error) {
    logger.error('Error updating users:', error);
    process.exit(1);
  }
};

// Run the script
(async () => {
  try {
    await updateAllUsersStatus();
  } catch (error) {
    logger.error(error.message);
  }
})(); 