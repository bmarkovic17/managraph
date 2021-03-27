import express from 'express';
import config from './helpers/config.js';
import Memgraph from './memgraph.js';
import { getErrorMessage } from './helpers/utilities.js';

const port = config.ExpressPort;
const server = express();

const memgraphs = new Map<string, Memgraph>();

memgraphs.set('Instance 1', new Memgraph('localhost:7687'));
memgraphs.set('Instance 2', new Memgraph('localhost:7688'));

memgraphs.forEach(async memgraph => {
    try {
        console.log(await memgraph.getStorageInfo());
    } catch (error) {
        console.error(getErrorMessage(error, `There was an error during fetching of storage info for Memgraph instance at ${memgraph.getUri()}`));
    } finally {
        await memgraph.close();
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
