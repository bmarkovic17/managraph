import neo4j from 'neo4j-driver';
import camelCase from 'camelcase';
import MemgraphInfo from '../types/memgraphInfo.js';
import { getNumber, initStorageInfo } from '../helpers/utilities.js';

export default class Memgraph {
    private driver;
    private memgraphInfo;

    constructor (memgraphInfo: MemgraphInfo) {
        this.memgraphInfo = memgraphInfo;
        this.driver = neo4j.driver(`bolt://${memgraphInfo.uri}`);
    };

    public setStorageInfo = async () => {
        try {
            const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });

            const result = await session.run('SHOW STORAGE INFO;');
            const records = result.records;

            records.forEach(record => {
                const key: string = camelCase(record.get('storage info'));

                if (key in this.memgraphInfo.storageInfo) {
                    this.memgraphInfo.storageInfo[key] = getNumber(record.get('value'));
                }
            });

            await session.close();
        } catch {
            this.memgraphInfo.active = false;
            this.memgraphInfo.storageInfo = initStorageInfo();
        }
    };

    public getMemgraphInfo = () => this.memgraphInfo;

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

    public close = async () =>
        await this.driver.close();
}
