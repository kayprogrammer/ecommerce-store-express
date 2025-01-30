import express, { Application } from 'express';
import swaggerUi from "swagger-ui-express";
import { SWAGGER_PATHS } from './docs/paths';
import ENV from './config/conf';
import cors, { CorsOptions } from 'cors';
import connectDB from './config/db';
import authRouter from './routes/auth';
import { handleError } from './middlewares/error';
import generalRouter from './routes/general';
import profilesRouter from './routes/profiles';
import sellerRouter from './routes/sellers';
import shopRouter from './routes/shop';

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
    title: "E-STORE EXPRESS API",
    version: '2.0.0',
    description: `
      Ecommerce Store API built with Node Express Typescript By Kenechi Ifeanyi (kayprogrammer)
      Github: https://github.com/kayprogrammer/ecommerce-store-express
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
      GuestAuth: {
        type: "apiKey",
        in: "header",
        name: "guest", // Header name
        description: `
          Custom header for guest access. Use 'guest' as the key and provide the required value.
          You can find the value in the response of cart or wishlist endpoints you visit as a guest.
          This is necessary for handling wishlists and carts for guests.
          I know say using cookies and sessions would have been easier, but I wanted a solution without cookies/sessions 😊
        `
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
app.use("/api/v2/profiles", profilesRouter)
app.use("/api/v2/shop", shopRouter)
app.use("/api/v2/sellers", sellerRouter)

app.use(handleError)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (ENV.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
    console.log(`Connected to MongoDB at ${ENV.MONGO_URI}`);
  });
}
export default app