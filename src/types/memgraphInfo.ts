import StorageInfo from './storageInfo';

type MemgraphInfo = {
    id: string;
    name: string;
    uri: string;
    active: boolean;
    storageInfo: StorageInfo;
}

export default MemgraphInfo;
