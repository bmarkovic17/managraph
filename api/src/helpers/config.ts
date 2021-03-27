import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.EXPRESS_PORT ?? '3000', 10);
const production = (process.env.PRODUCTION ?? 'false') === 'true';

export default {
    ExpressPort: isNaN(port) ? 3000 : port,
    IsNotProduction: !production
};
