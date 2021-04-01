import express, { NextFunction, Request, Response } from 'express';
import config from './helpers/config.js';
import { getErrorMessage, getErrorStatusCode } from './helpers/utilities.js';
import ApiError from './classes/apiError.js';
import swaggerUi from 'swagger-ui-express';
import Router from './routes/managraph.js';
import { RegisterRoutes } from './routes.js';

const port = config.ExpressPort;
const api = express();

// Body parser
api
    .use(express.json());

// Serve static files
api
    .use(express.static('dist'));

// Router
api
    .use(Router);

// Swagger
api
    .use(
        '/',
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
            swaggerOptions: {
                url: '/swagger.json'
            }
        })
    );

RegisterRoutes(api);

// Error handling
api
    // Log errors to the console
    .use((error: ApiError, request: Request, _response: Response, next: NextFunction) => {
        console.error(new Date());
        console.error('URL:', request.url);
        console.error('Body:', request.body);
        console.error(error.stack);

        next(error);
    })
    // Handle API error
    .use((error: ApiError, _request: Request, response: Response, next: NextFunction) => {
        if (error instanceof ApiError) {
            response
                .status(getErrorStatusCode(error))
                .json({ error: getErrorMessage(error) });
        } else {
            next(error);
        }
    })
    // Handle all other errors
    .use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
        response
            .status(500)
            .json({ error: getErrorMessage(error) });
    });

// Start server
const server = api.listen(port, () => console.info(`Server started on http://localhost:${port}`));

// Graceful exit on uncaught exception
process.on('uncaughtException', error => {
    console.error(getErrorMessage(error));
    process.exit(1);
});

// Graceful exit on SIGTERM signal
process.on('SIGTERM', () =>
    server.close(() =>
        console.info('Process terminated')));
