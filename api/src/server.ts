import express from 'express';
import config from './helpers/config.js';
import { getErrorMessage } from './helpers/utilities.js';
import Managraph from './classes/managraph.js';
import StorageInfo from './types/storageInfo.js';

const port = config.ExpressPort;
const server = express();
const managraph = new Managraph();

server.use(express.json());

server
    .route('/api/v1/managraph')
    .post((req, res) => {
        try {
            managraph.addInstance(req.body.name, req.body.uri);

            res
                .status(201)
                // TODO: postaviti location header s linkom na resurs
                .json();
        } catch (error) {
            res
                .status(error.statusCode ?? 500)
                .json(error.message ?? 'There was an error');
        }
    })
    .get(async (_req, res) => {
        try {
            const response: StorageInfo[] = [];
            const instances = managraph.getAllInstances();

            for (const instance of instances) {
                try {
                    response.push(await instance[1].getStorageInfo());
                } catch (error) {
                    console.error(getErrorMessage(error, `There was an error during fetching of storage info for Memgraph instance at ${instance[1].getUri()}`));
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
