import express, { NextFunction, Request, Response } from 'express';
import config from './helpers/config.js';
import { getErrorMessage, getErrorStatusCode } from './helpers/utilities.js';
import Managraph from './classes/managraph.js';
import ApiError from './classes/apiError.js';

const port = config.ExpressPort;
const api = express();
const managraph = new Managraph();

api
    .use(express.json());

api
    .route('/api/v1/managraph')
    .post((request, response, next) =>
        managraph
            .addMemgraph(request.body.name, request.body.uri)
            .then(memgraph =>
                response
                    .status(201)
                    .set('Location', `/api/v1/managraph/${memgraph.id}`)
                    .json(memgraph))
            .catch(next)
    )
    .get((_request, response, next) =>
        managraph
            .getMemgraphsInfo()
            .then(memgraphsInfo =>
                response
                    .status(200)
                    .json(memgraphsInfo))
            .catch(next)
    );

api
    .route('/api/v1/managraph/:id')
    .post((request, response, next) =>
        managraph
            .runCypherQuery(request.params.id, request.body.query)
            .then(records =>
                response
                    .status(200)
                    .json(records))
            .catch(next)
    )
    .get((request, response, next) => {
        managraph
            .getMemgraphsInfo(request.params.id)
            .then(memgraphInfo =>
                response
                    .status(200)
                    .json(memgraphInfo[0]))
            .catch(next);
    })
    .delete((request, response, next) =>
        managraph
            .removeMemgraph(request.params.id)
            .then(() =>
                response
                    .status(204)
                    .json())
            .catch(next)
    );

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

const server = api.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error(getErrorMessage(error));
    process.exit(1);
});

process.on('SIGTERM', () =>
    server.close(() =>
        console.info('Process terminated')));
