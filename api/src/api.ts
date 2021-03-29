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
            let memgraphsInfo: MemgraphInfo[] = [];

            try {
                memgraphsInfo = await managraph.getMemgraphsInfo();
            } catch (error) {
                console.error(getErrorMessage(error));
            }

            res
                .status(200)
                .json(memgraphsInfo);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    });

api
    .route('/api/v1/managraph/:id')
    .post(async (req, res) => {
        try {
            const records = await managraph.runCypherQuery(req.params.id, req.body.query);

            res
                .status(200)
                .json(records);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    })
    .get(async (req, res) => {
        try {
            const memgraphInfo = (await managraph.getMemgraphsInfo(req.params.id))[0];

            res
                .status(200)
                .json(memgraphInfo);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    })
    .delete(async (req, res) => {
        try {
            await managraph.removeMemgraph(req.params.id);

            res
                .status(204)
                .json();
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
