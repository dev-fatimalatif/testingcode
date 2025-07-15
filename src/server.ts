import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ProjectRoute } from '@routes/projects.route';
import { OwnerRoute } from './routes/owners.route';
import { ValidateEnv } from '@utils/validateEnv';
import { RegionRoute } from './routes/regions.route';
import { ProductRoute } from './routes/products.route';
import { QuestionAnswerRoute } from './routes/questions-answers.route';
import { ChatMessageRoute } from './routes/chat-messages.route';
import { RolePermissionRoute } from './routes/role-permissions.route';
import { AnswerHistoryRoute } from './routes/answer-history.route';
import { LibraryTrainingRoute } from './routes/library-training.route';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
ValidateEnv();

const appInstance = new App([
  new AuthRoute(),
  new UserRoute(),
  new ProjectRoute(),
  new OwnerRoute(),
  new RegionRoute(),
  new ProductRoute(),
  new QuestionAnswerRoute(),
  new ChatMessageRoute(),
  new RolePermissionRoute(),
  new AnswerHistoryRoute(),
  new LibraryTrainingRoute(),
]);

const serverlessApp = serverless(appInstance.getServer());

export const handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
  return serverlessApp(event, context, callback);
};
