import neo4j from 'neo4j-driver';
import camelCase from 'camelcase';
import StorageInfo from './types/storageInfo.js';
import { getNumber, initStorageInfo } from './helpers/utilities.js';

export default class Memgraph {
    private uri;
    private driver;

    constructor (uri: string) {
        this.uri = uri;
        this.driver = neo4j.driver(`bolt://${uri}`);
    };

    public getStorageInfo = async () => {
        try {
            await this.driver.verifyConnectivity();
        } catch (error) {
            console.error(`There was an error while trying to establish a connection to ${this.uri}:`, error);

            return Promise.reject(new Error(`Couldn't connect to ${this.uri}`));
        }

        const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });

        const storageInfo = initStorageInfo();

        const result = await session.run('SHOW STORAGE INFO;');
        const records = result.records;

        const promise = new Promise<StorageInfo>(resolve => {
            records.forEach(record => {
                const key: string = camelCase(record.get('storage info'));

                if (key in storageInfo) {
                    storageInfo[key] = getNumber(record.get('value'));
                }
            });

            resolve(storageInfo);
        });

        await session.close();

        return promise;
    };

    public close = async () =>
        await this.driver.close();
}
