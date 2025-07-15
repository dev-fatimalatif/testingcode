import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, PROMPT_API_BASE_PATH } from '@config';
import { dbConnection } from '@database';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import HttpStatus from './constants/HttpStatus';
import { responseHandler } from './utils/responseHandler';
import { AuthMiddleware } from './middlewares/auth.middleware';
export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    process.on('uncaughtException', error => {
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', reason => {
      console.error('Unhandled Rejection:', reason);
    });
  }

  public listen() {
    const server = this.app.listen(this.port, '0.0.0.0', () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
    server.on('error', err => {
      console.log(err);
    });
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    await dbConnection();
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    //this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    // this.app.options('*', cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    // this.app.use(hpp());
    this.app.use( 
      cors({
        origin:  ['http://localhost:5174', 'http://frontend_server:5174', 'http://autobid.netsolpk.com', 'https://autobid.netsolpk.com', "*"], // Explicitly set the allowed origin
        credentials: true, // Allow credentials (cookies, authorization headers)
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed headers
        preflightContinue: false, // Do not pass the OPTIONS request to the next handler
        optionsSuccessStatus: 200, // For legacy browsers (e.g., IE)
      }),
    );

    // Handle OPTIONS requests (preflight)
    this.app.options('*', cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ limit: '100mb', extended: true }));
    this.app.use(cookieParser());
    this.app.all('/', (req, res) => {
      res.status(HttpStatus.OK).send({ status: 'Ok', timestamp: new Date().toISOString() });
    });
    this.app.use(
      '/api',
      AuthMiddleware, // Ensure AuthMiddleware runs before the proxy
      createProxyMiddleware({
        target: PROMPT_API_BASE_PATH,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // Remove /api prefix before forwarding
        },
        timeout: 3600000, // 60 minutes for client-proxy connection
        proxyTimeout: 3600000, // 60 minutes for proxy-backend connection

        on: {
          proxyReq: (proxyReq, req, res) => {
            try {
              const token = (req?.user as any)?.token; // Get token from incoming request
              // console.log('Incoming Authorization Token:', token); // Debugging

              if (token) {
                proxyReq.setHeader('Authorization', `Bearer ${token}`); // Attach token to forwarded request
                console.log('✅ Authorization token attached to proxy request==',token); // Debugging
                console.log('ending');
              } else {
                console.warn('⚠️ No Authorization token found in request headers');
              }

              // Fix request body issues for some requests
              fixRequestBody(proxyReq, req);
              // console.log('✅ Request body fixed for proxy request'); // Debugging
            } catch (error) {
              console.error('❌ Error modifying proxy request headers:', error);
            }
          },

          /** ✅ Handle Proxy Errors */
          error: (err, req, res) => {
            console.error('🚨 Proxy error:', err);
          },
        },
      }),
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
    this.app.use((req, res) => {
      responseHandler(res, { data: null, error: null, success: false, message: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
    process.on('unhandledRejection', (err: Error) => {
      logger.error(`${err.name}=>${err.message}`);

      // server.close(() => {
      //   process.exit(1);
      // });
    });
  }
}

