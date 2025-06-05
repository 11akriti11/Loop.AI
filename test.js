const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

function httpRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const dataString = data ? JSON.stringify(data) : null;
    const options = {
      method,
      hostname: 'localhost',
      port: 5000,
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString ? Buffer.byteLength(dataString) : 0,
      },
    };

    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => (chunks += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(chunks);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);

    if (dataString) req.write(dataString);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('Starting tests...');

  const res1 = await httpRequest('POST', '/ingest', {
    ids: [1, 2, 3, 4, 5],
    priority: 'MEDIUM',
  });
  assert.strictEqual(res1.statusCode, 200);
  assert.ok(res1.body.ingestion_id);
  console.log('Test 1 passed');

  const res2 = await httpRequest('POST', '/ingest', {
    ids: [1, 2],
    priority: 'INVALID',
  });
  assert.strictEqual(res2.statusCode, 400);
  assert.ok(res2.body.error);
  console.log('Test 2 passed');

  const res3 = await httpRequest('POST', '/ingest', {
    ids: 'wrong',
    priority: 'HIGH',
  });
  assert.strictEqual(res3.statusCode, 400);
  console.log('Test 3 passed');

  const highPrio = await httpRequest('POST', '/ingest', {
    ids: [6, 7, 8, 9],
    priority: 'HIGH',
  });
  assert.strictEqual(highPrio.statusCode, 200);
  console.log('Test 4 passed');

  const status1 = await httpRequest('GET', `/status/${res1.body.ingestion_id}`);
  assert.strictEqual(status1.statusCode, 200);
  assert.strictEqual(status1.body.ingestion_id, res1.body.ingestion_id);
  assert.ok(Array.isArray(status1.body.batches));
  status1.body.batches.forEach((b) => {
    assert.ok(b.ids.length <= 3);
    assert.ok(['yet_to_start', 'triggered', 'completed'].includes(b.status));
  });
  console.log('Test 5 passed');

  const lowPrio = await httpRequest('POST', '/ingest', {
    ids: [10, 11, 12, 13],
    priority: 'LOW',
  });

  await sleep(6000);

  const statusHigh = await httpRequest('GET', `/status/${highPrio.body.ingestion_id}`);
  const statusLow = await httpRequest('GET', `/status/${lowPrio.body.ingestion_id}`);

  assert.ok(statusHigh.body.batches.some(b => b.status === 'triggered' || b.status === 'completed'));
  console.log('Test 6 passed');

  const invalidStatus = await httpRequest('GET', '/status/invalidid');
  assert.strictEqual(invalidStatus.statusCode, 404);
  assert.ok(invalidStatus.body.error);
  console.log('Test 7 passed');

  console.log('All tests passed');
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
