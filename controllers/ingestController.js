const { v4: uuidv4 } = require('../utils/idGenerator');
const { splitIntoBatches } = require('../utils/batchUtils');
const store = require('../store/memoryStore');
const { enqueueBatches } = require('../services/processor');

const PRIORITY_LEVELS = { HIGH: 1, MEDIUM: 2, LOW: 3 };

function handleIngest(req, res) {
  const { ids, priority } = req.body;

  if (!Array.isArray(ids) || typeof priority !== 'string') {
    return res.status(400).json({ error: 'Invalid input format.' });
  }

  if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Use HIGH, MEDIUM or LOW.' });
  }

  const ingestion_id = uuidv4();
  const created_at = Date.now();
  const batches = splitIntoBatches(ids, 3);

  const batchList = batches.map((batch) => {
    const batch_id = uuidv4();
    return {
      batch_id,
      ids: batch,
      status: 'yet_to_start',
      created_at,
      priority: PRIORITY_LEVELS[priority],
    };
  });

  // Save to store
  store.ingestions[ingestion_id] = {
    ingestion_id,
    status: 'yet_to_start',
    created_at,
    priority: PRIORITY_LEVELS[priority],
    batches: batchList,
  };

  // Enqueue for processing
  enqueueBatches(ingestion_id, batchList);

  res.json({ ingestion_id });
}

module.exports = { handleIngest };
