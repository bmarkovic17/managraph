import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.EXPRESS_PORT ?? '3000', 10);

export default {
    ExpressPort: isNaN(port) ? 3000 : port,
    IsNotProduction: process.env.NODE_ENV !== 'production',
    TestInstanceName: process.env.TEST_MEMGRAPH_INSTANCE_NAME ?? 'memgraph',
    TestInstanceUri: process.env.TEST_MEMGRAPH_INSTANCE_URI ?? 'localhost:7687',
    LogAllRequests: (process.env.LOG_ALL_REQUESTS ?? 'false') === 'true'
};
