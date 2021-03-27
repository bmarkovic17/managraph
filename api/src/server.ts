import config from './config.js';
import express from 'express';
import neo4j from 'neo4j-driver';

const port = config.ExpressPort;
const server = express();

const driver = neo4j.driver('bolt://localhost:7687');
const session = driver.session({ defaultAccessMode: neo4j.session.READ });

try {
    const result = await session.run('SHOW STORAGE INFO;');
    const records = result.records;

    records.forEach(record => console.log(record.toObject()));

    records.forEach(record => console.log({ 0: record.get('storage info') }));
    records.forEach(record => console.log({ 1: record.get('value') }));
} finally {
    await session.close();
}

await driver.close();

server.listen(port, () => console.info(`Server started on http://localhost:${port}`));

process.on('uncaughtException', error => {
    console.error('There was an uncaught error', error);
    process.exit(1);
});
