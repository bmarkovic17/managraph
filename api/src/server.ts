import config from './config.js';
import express from 'express';

const port = config.ExpressPort;
const server = express();

server.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error('There was an uncaught error', error);
    process.exit(1);
});
