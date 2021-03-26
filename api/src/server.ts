import express from 'express';

const server = express();
const port = 3000;

server.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error('There was an uncaught error', error);
    process.exit(1);
});
