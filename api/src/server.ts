import express from 'express';
import config from './helpers/config.js';
import { getErrorMessage } from './helpers/utilities.js';
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
                .json(memgraphInfo);
        } catch (error) {
            res
                .status(error.statusCode ?? 500)
                .json(error.message ?? 'There was an error');
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
                .status(error.statusCode ?? 500)
                .json(error.message ?? 'There was an error');
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
