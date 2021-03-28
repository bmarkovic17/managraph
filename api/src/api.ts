import express from 'express';
import config from './helpers/config.js';
import { getErrorMessage, getErrorStatusCode } from './helpers/utilities.js';
import Managraph from './classes/managraph.js';
import MemgraphInfo from './types/memgraphInfo.js';

const port = config.ExpressPort;
const api = express();
const managraph = new Managraph();

api.use(express.json());

api
    .route('/api/v1/managraph')
    .post(async (req, res) => {
        try {
            const memgraph = await managraph.addMemgraph(req.body.name, req.body.uri);

            res
                .status(201)
                .set('Location', `/api/v1/managraph/${memgraph.id}`)
                .json(memgraph);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    })
    .get(async (_req, res) => {
        try {
            let memgraphs: MemgraphInfo[] = [];

            try {
                memgraphs = await managraph.getMemgraphs();
            } catch (error) {
                console.error(getErrorMessage(error));
            }

            res
                .status(200)
                .json(memgraphs);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    });

api
    .route('/api/v1/managraph/:id')
    .get(async (req, res) => {
        try {
            const memgraph = await managraph.getMemgraphs(req.params.id);

            res
                .status(200)
                .json(memgraph[0]);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    });

const server = api.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error(getErrorMessage(error));
    process.exit(1);
});

process.on('SIGTERM', () =>
    server.close(() =>
        console.info('Process terminated')));
