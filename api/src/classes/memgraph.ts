import neo4j from 'neo4j-driver';
import camelCase from 'camelcase';
import MemgraphInfo from '../types/memgraphInfo.js';
import ApiError from './apiError.js';
import { getNumber, initStorageInfo } from '../helpers/utilities.js';

export default class Memgraph {
    private driver;
    private memgraphInfo;

    constructor (memgraphInfo: MemgraphInfo) {
        this.memgraphInfo = memgraphInfo;
        this.driver = neo4j.driver(`bolt://${memgraphInfo.uri}`);
    };

    public getId = () => this.memgraphInfo.id;

    public getName = () => this.memgraphInfo.name;

    public getUri = () => this.memgraphInfo.uri;

    public getMemgraphInfo = async () => {
        await this.refreshMemgraphInfo();

        return this.memgraphInfo;
    }

    public setStorageInfo = async () => {
        const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });

        try {
            const result = await session.run('SHOW STORAGE INFO;');
            const records = result.records;

            records.forEach(record => {
                const key: string = camelCase(record.get('storage info'));

                if (key in this.memgraphInfo.storageInfo) {
                    this.memgraphInfo.storageInfo[key] = getNumber(record.get('value'));
                }
            });
        } catch {
            this.memgraphInfo.active = false;
            this.memgraphInfo.storageInfo = initStorageInfo();
        } finally {
            await session.close();
        }
    };

    public setConnectionStatus = async () => {
        try {
            const serverInfo = await this.driver.verifyConnectivity();

            if (serverInfo.address != null) {
                this.memgraphInfo.active = true;
            } else {
                this.memgraphInfo.active = false;
            }
        } catch (error) {
            this.memgraphInfo.active = false;
        }
    }

    public runCypherQuery = async (query: string) => {
        const isActive = (await this.getMemgraphInfo()).active;

        if (isActive) {
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

    private refreshMemgraphInfo = () =>
        Promise.all([
            this.setConnectionStatus(),
            this.setStorageInfo()
        ]);
}
