const store = require('../store/memoryStore');

// Queue polling interval and batch processing rate limit (5 seconds)
const RATE_LIMIT_MS = 5000;

function enqueueBatches(ingestion_id, batches) {
  batches.forEach((batch) => {
    store.processingQueue.push({ ingestion_id, batch });
  });

  // Sort queue by priority (1 = HIGH) and created_at (earlier first)
  store.processingQueue.sort((a, b) => {
    if (a.batch.priority !== b.batch.priority) {
      return a.batch.priority - b.batch.priority;
    }
    return a.batch.created_at - b.batch.created_at;
  });
}

function startQueueProcessor() {
  setInterval(() => {
    if (store.processingQueue.length === 0) return;

    const item = store.processingQueue.shift();
    const { ingestion_id, batch } = item;

    batch.status = 'triggered';
    updateBatchStatus(ingestion_id, batch.batch_id, 'triggered');

    // Simulate external fetch
    setTimeout(() => {
      console.log(`Processed batch ${batch.batch_id} [${batch.ids.join(', ')}]`);
      updateBatchStatus(ingestion_id, batch.batch_id, 'completed');
    }, 1000); // simulate ~1s per batch processing

  }, RATE_LIMIT_MS); // Rate-limited to 1 batch every 5 seconds
}

function updateBatchStatus(ingestion_id, batch_id, status) {
  const ingestion = store.ingestions[ingestion_id];
  if (!ingestion) return;

  for (let batch of ingestion.batches) {
    if (batch.batch_id === batch_id) {
      batch.status = status;
      break;
    }
  }
}

module.exports = {
  enqueueBatches,
  startQueueProcessor,
};
