import neo4j from 'neo4j-driver';
import camelCase from 'camelcase';
import MemgraphInfo from '../types/memgraphInfo.js';
import ApiError from './apiError.js';
import { getNumber, initStorageInfo } from '../helpers/utilities.js';
import config from '../helpers/config.js';

export default class Memgraph {
    private driver;
    private memgraphInfo;

    constructor (memgraphInfo: MemgraphInfo) {
        this.memgraphInfo = memgraphInfo;
        this.driver = neo4j.driver(`bolt://${memgraphInfo.uri}`, undefined, { connectionTimeout: config.ConnectionTimeout });
    };

    public getId = () => this.memgraphInfo.id;

    public getName = () => this.memgraphInfo.name;

    public getUri = () => this.memgraphInfo.uri;

    public isActive = () => this.memgraphInfo.active;

    public getMemgraphInfo = async () => {
        await this.refreshMemgraphInfo();

        return this.memgraphInfo;
    }

    public runCypherQuery = async (query: string) => {
        await this.refreshMemgraphInfo();

        if (this.isActive()) {
            const session = this.driver.session();

            try {
                const result = await session.run(query);

                return result.records;
            } finally {
                await session.close();
            }
        } else {
            throw new ApiError(503, `Connection to Memgraph at ${this.getUri()} isn't active`);
        }
    }

    public close = () =>
        this.driver.close();

    public refreshMemgraphInfo = async () => {
        const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });

        try {
            const result = await session.run('SHOW STORAGE INFO;');
            const records = result.records;

            records.forEach(record => {
                const key: string = camelCase(record.get('storage info'));

                if (key in this.memgraphInfo.storageInfo) {
                    this.memgraphInfo.storageInfo[key] = getNumber(record.get('value'));

                    if (this.memgraphInfo.storageInfo[key] != null) {
                        this.memgraphInfo.active = true;
                    }
                }
            });
        } catch {
            this.memgraphInfo.active = false;
            this.memgraphInfo.storageInfo = initStorageInfo();
        } finally {
            await session.close();
        }
    }
}
