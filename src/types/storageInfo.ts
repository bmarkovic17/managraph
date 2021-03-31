type StorageInfo = {
    [key: string]: number | null;

    vertexCount: number | null;
    edgeCount: number | null;
    averageDegree: number | null;
    memoryUsage: number | null;
    diskUsage: number | null;
}

export default StorageInfo;
