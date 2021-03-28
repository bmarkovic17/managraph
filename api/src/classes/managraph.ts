import { initMemgraphInfo } from '../helpers/utilities.js';
import ApiError from './ApiError.js';
import Memgraph from './memgraph.js';

export default class Managraph {
    private memgraphs;

    constructor () {
        this.memgraphs = new Map<string, Memgraph>();
    }

    public addInstance = async (name: string, uri: string) => {
        if (name == null) {
            throw new ApiError(400, 'Memgraph name must be provided');
        }

        if (uri == null) {
            throw new ApiError(400, 'Memgraph URI must be provided');
        }

        const sanitizedName = name.trim();
        const sanitizedUri = uri.trim();

        this.memgraphs.forEach(memgraph => {
            if (memgraph.getMemgraphInfo().name === sanitizedName) {
                throw new ApiError(422, `Memgraph instance with name ${sanitizedName} already exists`);
            }

            if (memgraph.getMemgraphInfo().uri === sanitizedUri) {
                throw new ApiError(422, `Memgraph instance with URI ${sanitizedUri} already exists`);
            }
        });

        const memgraphInfo = initMemgraphInfo(sanitizedName, sanitizedUri);
        const memgraph = new Memgraph(memgraphInfo);

        await memgraph.setConnectionStatus();
        await memgraph.setStorageInfo();

        this.memgraphs.set(memgraphInfo.id, memgraph);

        return memgraph.getMemgraphInfo();
    }

    public getInstance = async (id: string) => {
        if (!this.memgraphs.has(id)) {
            throw new ApiError(404, `There isn't any tracking instance with ID ${id}`);
        }

        const memgraph = this.memgraphs.get(id);

        await memgraph?.setConnectionStatus();
        await memgraph?.setStorageInfo();

        return memgraph;
    }

    public getAllInstances = async () => {
        for (const memgraph of this.memgraphs) {
            await memgraph[1].setConnectionStatus();
            await memgraph[1].setStorageInfo();
        }

        return this.memgraphs;
    }
}
