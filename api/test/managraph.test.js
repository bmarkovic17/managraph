import { strict as assert } from 'assert';
import Managraph from '../dist/classes/managraph.js';
import ApiError from '../dist/classes/apiError.js';
import config from '../dist/helpers/config.js';

let managraph;
const instanceName = config.TestInstanceName;
const instanceNameReversed = instanceName.split('').reverse().join('');
const instanceUri = config.TestInstanceUri;
const instanceUriReversed = instanceUri.split('').reverse().join('');

describe('ManaGraph', function () {
    this.timeout(5000);

    describe('Valid instance', function () {
        let activeInstance;
        let inactiveInstance;

        before(function () {
            managraph = new Managraph();
        });

        it('Should return memgraph info object on add new active instance', async function () {
            const memgraphInfo = await managraph.addMemgraph(instanceName, instanceUri);

            assert.equal(typeof memgraphInfo, 'object');
            assert.equal(memgraphInfo.id.length, 6);
            assert.notEqual(memgraphInfo.name, null);
            assert.notEqual(memgraphInfo.uri, null);
            assert.equal(memgraphInfo.active, true);

            assert.equal(typeof memgraphInfo.storageInfo, 'object');
            assert.equal(typeof memgraphInfo.storageInfo.edgeCount, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.averageDegree, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.memoryUsage, 'number');
            assert.equal(typeof memgraphInfo.storageInfo.diskUsage, 'number');
        });

        it('Should return memgraph info object on add new inactive instance', async function () {
            const memgraphInfo = await managraph.addMemgraph(instanceNameReversed, instanceUriReversed);

            assert.equal(typeof memgraphInfo, 'object');
            assert.equal(memgraphInfo.id.length, 6);
            assert.notEqual(memgraphInfo.name, null);
            assert.notEqual(memgraphInfo.uri, null);
            assert.equal(memgraphInfo.active, false);

            assert.equal(typeof memgraphInfo.storageInfo, 'object');
            assert.equal(memgraphInfo.storageInfo.edgeCount, null);
            assert.equal(memgraphInfo.storageInfo.averageDegree, null);
            assert.equal(memgraphInfo.storageInfo.memoryUsage, null);
            assert.equal(memgraphInfo.storageInfo.diskUsage, null);
        });

        it('Should return two memgraph info objects', async function () {
            const memgraphInfos = await managraph.getMemgraphsInfo();

            activeInstance = memgraphInfos.find(memgraphInfo => memgraphInfo.active === true);
            inactiveInstance = memgraphInfos.find(memgraphInfo => memgraphInfo.active === false);

            assert.equal(memgraphInfos.length, 2);
        });

        it('Should return a single memgraph info object for active instance', async function () {
            const memgraphInfos = await managraph.getMemgraphsInfo(activeInstance.id);

            assert.equal(memgraphInfos.length, 1);

            assert.equal(typeof memgraphInfos[0], 'object');
            assert.equal(memgraphInfos[0].id.length, 6);
            assert.notEqual(memgraphInfos[0].name, null);
            assert.notEqual(memgraphInfos[0].uri, null);
            assert.equal(memgraphInfos[0].active, true);

            assert.equal(typeof memgraphInfos[0].storageInfo, 'object');
            assert.equal(typeof memgraphInfos[0].storageInfo.edgeCount, 'number');
            assert.equal(typeof memgraphInfos[0].storageInfo.averageDegree, 'number');
            assert.equal(typeof memgraphInfos[0].storageInfo.memoryUsage, 'number');
            assert.equal(typeof memgraphInfos[0].storageInfo.diskUsage, 'number');
        });

        it('Should return a single memgraph info object for inactive instance', async function () {
            const memgraphInfos = await managraph.getMemgraphsInfo(inactiveInstance.id);

            assert.equal(memgraphInfos.length, 1);

            assert.equal(typeof memgraphInfos[0], 'object');
            assert.equal(memgraphInfos[0].id.length, 6);
            assert.notEqual(memgraphInfos[0].name, null);
            assert.notEqual(memgraphInfos[0].uri, null);
            assert.equal(memgraphInfos[0].active, false);

            assert.equal(typeof memgraphInfos[0].storageInfo, 'object');
            assert.equal(memgraphInfos[0].storageInfo.edgeCount, null);
            assert.equal(memgraphInfos[0].storageInfo.averageDegree, null);
            assert.equal(memgraphInfos[0].storageInfo.memoryUsage, null);
            assert.equal(memgraphInfos[0].storageInfo.diskUsage, null);
        });

        it('Should run cypher query for active instance', async function () {
            assert(await managraph.runCypherQuery(activeInstance.id, 'SHOW STORAGE INFO;'));
        });

        it('Should reject on cypher query run for inactive instance', function () {
            assert.rejects(
                function () { managraph.runCypherQuery(inactiveInstance.id, 'SHOW STORAGE INFO;'); },
                ApiError,
                `Connection to Memgraph at ${inactiveInstance.uri} isn't active`);
        });

        it('Should remove active instance', function () {
            assert.doesNotReject(function () { managraph.removeMemgraph(activeInstance.id); });
        });

        it('Should remove inactive instance', function () {
            assert.doesNotReject(function () { managraph.removeMemgraph(inactiveInstance.id); });
        });
    });

    describe('Invalid instance', function () {
        let instanceId;

        before(async function () {
            managraph = new Managraph();

            instanceId = (await managraph.addMemgraph(instanceName, instanceUri)).id;
        });

        it('Should throw for instance without name', function () {
            assert.throws(
                function () { managraph.addMemgraph(undefined, instanceUri); },
                ApiError,
                'Memgraph name must be provided');
        });

        it('Should throw for instance with same name', function () {
            assert.throws(
                function () { managraph.addMemgraph(instanceName, instanceUriReversed); },
                ApiError,
                `Memgraph instance with name ${instanceName.trim()} already exists`);
        });

        it('Should throw for instance without URI', function () {
            assert.throws(
                function () { managraph.addMemgraph(instanceName, undefined); },
                ApiError,
                'Memgraph URI must be provided');
        });

        it('Should throw for instance with same URI', function () {
            assert.throws(
                function () { managraph.addMemgraph(instanceNameReversed, instanceUri); },
                ApiError,
                `Memgraph instance with URI ${instanceUri.trim()} already exists`);
        });

        it('Should reject get memgraph info for nonexisting id', function () {
            assert.rejects(
                function () { managraph.getMemgraphsInfo('X'); },
                ApiError,
                'There isn\'t any tracking instance with ID X');
        });

        it('Should reject run cypher query for undefined id', function () {
            assert.rejects(
                function () { managraph.runCypherQuery(undefined, 'SHOW STORAGE INFO;'); },
                ApiError,
                'Memgraph ID must be provided');
        });

        it('Should reject run cypher query for nonexisting id', function () {
            assert.rejects(
                function () { managraph.runCypherQuery('X', 'SHOW STORAGE INFO;'); },
                ApiError,
                'There isn\'t any tracking instance with ID X');
        });

        it('Should reject remove instance for undefined id', function () {
            assert.rejects(
                function () { managraph.removeMemgraph(undefined); },
                ApiError,
                'Memgraph ID must be provided');
        });

        it('Should reject remove instance for nonexisting id', function () {
            assert.rejects(
                function () { managraph.removeMemgraph('X'); },
                ApiError,
                'Memgraph ID must be provided');
        });

        after(async function () {
            await managraph.removeMemgraph(instanceId);
        });
    });
});
