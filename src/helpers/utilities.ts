import { nanoid } from 'nanoid';
import MemgraphInfo from '../types/memgraphInfo.js';
import StorageInfo from '../types/storageInfo.js';
import config from './config.js';

export function getNumber (value: any): number | null {
    let numericValue: number | null = null;

    if (typeof value.toNumber === 'function') {
        numericValue = value.toNumber();
    } else if (typeof value === 'number') {
        numericValue = value;
    }

    return numericValue;
}

export function initStorageInfo (): StorageInfo {
    return {
        vertexCount: null,
        edgeCount: null,
        averageDegree: null,
        memoryUsage: null,
        diskUsage: null
    };
}

export function initMemgraphInfo (name: string, uri: string): MemgraphInfo {
    return {
        id: nanoid(6),
        name: name,
        uri: uri,
        active: false,
        storageInfo: initStorageInfo()
    };
}

export function getErrorMessage (error: Error): string {
    return config.IsNotProduction && error.stack != null ? error.stack : error.message;
}

export function getErrorStatusCode (error: any): number {
    return error?.statusCode ?? 500;
}
