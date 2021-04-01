import { Get, Post, Delete, Route } from 'tsoa';
import { Request, Response } from 'express';
import Managraph from '../classes/managraph.js';

const managraph = new Managraph();

@Route('api/v1/managraph')
export class ManagraphController {
    @Post('/')
    public addMemgraph = async (request: Request, response: Response) =>
        managraph
            .addMemgraph(request.body.name, request.body.uri)
            .then(memgraphInfo =>
                response
                    .status(201)
                    .set('Location', `/api/v1/managraph/${memgraphInfo.id}`)
                    .json(memgraphInfo))

    @Get('/')
    public getMemgraphsInfo = async (_request: Request, response: Response) =>
        managraph
            .getMemgraphsInfo()
            .then(memgraphsInfo =>
                response
                    .status(200)
                    .json(memgraphsInfo))

    @Post('/:id')
    public runCypherQuery = async (request: Request, response: Response) =>
        managraph
            .runCypherQuery(request.params.id, request.body.query)
            .then(records =>
                response
                    .status(200)
                    .json(records))

    @Get('/:id')
    public getMemgraphInfo = async (request: Request, response: Response) =>
        managraph
            .getMemgraphsInfo(request.params.id)
            .then(memgraphInfo =>
                response
                    .status(200)
                    .json(memgraphInfo[0]))

    @Delete('/:id')
    public removeMemgraph = async (request: Request, response: Response) =>
        managraph
            .removeMemgraph(request.params.id)
            .then(() =>
                response
                    .status(204)
                    .json())
}
