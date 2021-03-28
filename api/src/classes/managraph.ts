import { initMemgraphInfo } from '../helpers/utilities.js';
import MemgraphInfo from '../types/memgraphInfo.js';
import ApiError from './apiError.js';
import Memgraph from './memgraph.js';

export default class Managraph {
    private memgraphs: Memgraph[]

    constructor () {
        this.memgraphs = [];
    }

    public addMemgraph = (name: string, uri: string) => {
        if (name == null) {
            throw new ApiError(400, 'Memgraph name must be provided');
        }

        if (uri == null) {
            throw new ApiError(400, 'Memgraph URI must be provided');
        }

        const sanitizedName = name.trim();
        const sanitizedUri = uri.trim();

        for (const memgraph of this.memgraphs) {
            if (memgraph.getName() === sanitizedName) {
                throw new ApiError(422, `Memgraph instance with name ${sanitizedName} already exists`);
            }

            if (memgraph.getUri() === sanitizedUri) {
                throw new ApiError(422, `Memgraph instance with URI ${sanitizedUri} already exists`);
            }
        }

        let memgraphInfo;

        // Check for duplicate IDs
        do {
            memgraphInfo = initMemgraphInfo(sanitizedName, sanitizedUri);
        } while (this.isValidId(memgraphInfo.id) === false);

        const memgraph = new Memgraph(memgraphInfo);

        this.memgraphs.push(memgraph);

        return memgraph.getMemgraphInfo();
    }

    public getMemgraphsInfo = (id?: string) => {
        let memgraphs: Promise<MemgraphInfo[]>;

        if (id != null) {
            const memgraph = this.getMemgraph(id);

            if (memgraph != null) {
                memgraphs = Promise.all([memgraph.getMemgraphInfo()]);
            } else {
                throw new ApiError(404, `There isn't any tracking instance with ID ${id}`);
            }
        } else {
            try {
                memgraphs = Promise.all(
                    this.memgraphs.map(memgraph =>
                        memgraph.getMemgraphInfo()));
            } catch {
                throw new ApiError(500, 'There was an unexpected error');
            }
        }

        return memgraphs;
    }

    public runCypherQuery = (id: string, query: string) => {
        if (id == null) {
            throw new ApiError(400, 'Memgraph ID must be provided');
        }

        const memgraph = this.getMemgraph(id);

        if (memgraph == null) {
            throw new ApiError(404, `There isn't any tracking instance with ID ${id}`);
        }

        return memgraph.runCypherQuery(query);
    }

    private getMemgraph = (id: string) => {
        let memgraph;

        if (id != null) {
            memgraph = this.memgraphs.find(memgraph => memgraph.getId() === id);
        }

        return memgraph;
    }

    private isValidId = (id: string) =>
        this.memgraphs.findIndex(memgraph => memgraph.getId() === id) === -1;
}
