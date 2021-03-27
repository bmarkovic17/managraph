import ApiError from './ApiError.js';
import Memgraph from './memgraph.js';

export default class Managraph {
    private memgraphs;

    constructor () {
        this.memgraphs = new Map<string, Memgraph>();
    }

    public getAllInstances = () => this.memgraphs;

    public addInstance = (name: string, uri: string) => {
        const sanitizedName = name.trim();
        const sanitizedUri = uri.trim();

        if (this.memgraphs.has(sanitizedName)) {
            throw new ApiError(422, `Memgraph instance with name ${name} already exists`);
        }

        this.memgraphs.forEach(memgraph => {
            if (memgraph.getUri() === sanitizedUri) {
                throw new ApiError(422, `Memgraph instance with uri ${uri} already exists`);
            }
        });

        this.memgraphs.set(sanitizedName, new Memgraph(sanitizedUri));
    }
}
