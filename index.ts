import express, { Application } from 'express';
import swaggerUi from "swagger-ui-express";
import { SWAGGER_PATHS } from './docs/paths';
import ENV from './config/conf';
import cors, { CorsOptions } from 'cors';
import connectDB from './config/db';
import authRouter from './routes/auth';
import { handleError } from './middlewares/error';
import generalRouter from './routes/general';

// CORS options
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // If no origin (like in some requests from Postman) or if the origin is in the allowed list
    if (!origin || ENV.CORS_ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],  // Allowed HTTP methods
  allowedHeaders: ['origin', 'content-type', 'accept', 'authorization', 'x-request-id'],  // Allowed headers
  credentials: true,  // Enable CORS for credentials (cookies, auth headers)
};

const app: Application = express();
app.use(express.json());
app.use(cors(corsOptions));

// Connect DB
if (ENV.NODE_ENV !== 'test') {
  // Connect DB
  connectDB()
}

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: ENV.SITE_NAME,
    version: '2.0.0',
    description: `
      Ecommerce Store API built with Node Express Typescript
    `
  },
  servers: [{ url: '/api/v2' }],
  paths: SWAGGER_PATHS,
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    security: [
      {
        BearerAuth: [],
      },
   ],
  },
};

// Register Routes
app.use("/api/v2/general", generalRouter)
app.use("/api/v2/auth", authRouter)

app.use(handleError)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (ENV.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`${ENV.SITE_NAME} server is running on port ${ENV.PORT}`);
    console.log(`Connected to MongoDB at ${ENV.MONGO_URI}`);
  });
}
export default app