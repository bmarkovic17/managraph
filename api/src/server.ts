import express from 'express';
import config from './helpers/config.js';
import { getErrorMessage, getErrorStatusCode } from './helpers/utilities.js';
import Managraph from './classes/managraph.js';
import MemgraphInfo from './types/memgraphInfo.js';

const port = config.ExpressPort;
const server = express();
const managraph = new Managraph();

server.use(express.json());

server
    .route('/api/v1/managraph')
    .post(async (req, res) => {
        try {
            const memgraphInfo = await managraph.addInstance(req.body.name, req.body.uri);

            res
                .status(201)
                .set('Location', `/api/v1/managraph/${memgraphInfo.id}`)
                .json(memgraphInfo);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    })
    .get(async (_req, res) => {
        try {
            const response: MemgraphInfo[] = [];
            const instances = await managraph.getAllInstances();

            for (const instance of instances) {
                try {
                    response.push(instance[1].getMemgraphInfo());
                } catch (error) {
                    console.error(getErrorMessage(error, `There was an error during fetching of storage info for Memgraph instance at ${instance[1].getMemgraphInfo().uri}`));
                }
            }

            res
                .status(200)
                .json(response);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    });

server
    .route('/api/v1/managraph/:id')
    .get(async (req, res) => {
        try {
            const instance = await managraph.getInstance(req.params.id);
            const response = instance?.getMemgraphInfo();

            res
                .status(200)
                .json(response);
        } catch (error) {
            res
                .status(getErrorStatusCode(error))
                .json(getErrorMessage(error));
        }
    });

const serverInstance = server.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error(getErrorMessage(error, 'There was an uncaught error'));
    process.exit(1);
});

process.on('SIGTERM', () =>
    serverInstance.close(() =>
        console.info('Process terminated')));
