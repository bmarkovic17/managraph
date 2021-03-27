import express from 'express';
import config from './helpers/config.js';
import Memgraph from './memgraph.js';

const port = config.ExpressPort;
const server = express();
const memgraph = new Memgraph('localhost:7687');

try {
    const storageInfo = await memgraph.getStorageInfo();

    console.log(storageInfo);
} catch (error) {
    console.error('There was an error during fetching of storage info:', error);
} finally {
    await memgraph.close();
}

const serverInstance = server.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error('There was an uncaught error', error);
    process.exit(1);
});

process.on('SIGTERM', () =>
    serverInstance.close(() =>
        console.log('Process terminated')));
