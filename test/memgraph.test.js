import { strict as assert } from 'assert';
import Memgraph from '../dist/classes/memgraph.js';
import ApiError from '../dist/classes/apiError.js';
import config from '../dist/helpers/config.js';
import { initMemgraphInfo } from '../dist/helpers/utilities.js';

let memgraph;

describe('MemGraph', function () {
    describe('Active', function () {
        before(function () {
            const memgraphInfo = initMemgraphInfo(config.TestInstanceName, config.TestInstanceUri);

            memgraph = new Memgraph(memgraphInfo);
        });

        it('Should return ID with length of 6', function () {
            assert.equal(memgraph.getId().length, 6);
        });

        it('Should return not null Name', function () {
            assert.notEqual(memgraph.getName(), null);
        });

        it('Should return not null URI', function () {
            assert.notEqual(memgraph.getUri(), null);
        });

        it('Should return active connection', async function () {
            await memgraph.refreshMemgraphInfo();

            assert.equal(memgraph.isActive(), true);
        });

        it('Should return memgraph info object', async function () {
            const memgraphInfo = await memgraph.getMemgraphInfo();

            assert.equal(typeof memgraphInfo, 'object');
            assert.equal(typeof memgraphInfo.storageInfo, 'object');
            assert.equal(typeof memgraphInfo.storageInfo.edgeCount, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.averageDegree, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.memoryUsage, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.diskUsage, 'number');
        });

        it('Should set storage info and connection status', function () {
            assert.doesNotReject(memgraph.refreshMemgraphInfo);
        });

        it('Should run cypher query', async function () {
            assert(await memgraph.runCypherQuery('SHOW STORAGE INFO;'));
        });

        it('Should close connection', function () {
            assert.doesNotReject(memgraph.close);
        });
    });

    describe('Inactive', function () {
        before(function () {
            const memgraphInfo = initMemgraphInfo(
                config.TestInstanceName.split('').reverse().join(''),
                config.TestInstanceUri.split('').reverse().join(''));

            memgraph = new Memgraph(memgraphInfo);
        });

        it('Should return ID with length of 6', function () {
            assert.equal(memgraph.getId().length, 6);
        });

        it('Should return not null Name', function () {
            assert.notEqual(memgraph.getName(), null);
        });

        it('Should return not null URI', function () {
            assert.notEqual(memgraph.getUri(), null);
        });

        it('Should return not active connection', async function () {
            await memgraph.refreshMemgraphInfo();

            assert.equal(memgraph.isActive(), false);
        });

        it('Should return memgraph info object', async function () {
            const memgraphInfo = await memgraph.getMemgraphInfo();

            assert.equal(typeof memgraphInfo, 'object');
            assert.equal(typeof memgraphInfo.storageInfo, 'object');
            assert.equal(memgraphInfo.storageInfo.edgeCount, null);
            assert.equal(memgraphInfo.storageInfo.averageDegree, null);
            assert.equal(memgraphInfo.storageInfo.memoryUsage, null);
            assert.equal(memgraphInfo.storageInfo.diskUsage, null);
        });

        it('Should set storage info and connection status', function () {
            assert.doesNotReject(memgraph.refreshMemgraphInfo);
        });

        it('Should reject on cypher query run', function () {
            assert.rejects(
                function () { memgraph.runCypherQuery('SHOW STORAGE INFO;'); },
                ApiError,
                `Connection to Memgraph at ${memgraph.getUri()} isn't active`);
        });

        it('Should close connection', function () {
            assert.doesNotReject(memgraph.close);
        });
    });
});
