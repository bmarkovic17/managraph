import express from 'express';
import { ManagraphController } from '../controllers/managraph.js';

const router = express.Router();
const managraphController = new ManagraphController();

router
    .route('/api/v1/managraph')
    .post((request, response, next) =>
        managraphController
            .addMemgraph(request, response)
            .catch(next)
    )
    .get((request, response, next) =>
        managraphController
            .getMemgraphsInfo(request, response)
            .catch(next)
    );

router
    .route('/api/v1/managraph/:id')
    .post((request, response, next) =>
        managraphController
            .runCypherQuery(request, response)
            .catch(next)
    )
    .get((request, response, next) =>
        managraphController
            .getMemgraphInfo(request, response)
            .catch(next)
    )
    .delete((request, response, next) =>
        managraphController
            .removeMemgraph(request, response)
            .catch(next)
    );

export default router;
