const store = require('../store/memoryStore');

function getStatus(req, res) {
  const ingestion_id = req.params.ingestion_id;
  const ingestion = store.ingestions[ingestion_id];

  if (!ingestion) {
    return res.status(404).json({ error: 'Ingestion ID not found.' });
  }

  const batchStatuses = ingestion.batches.map((batch) => ({
    batch_id: batch.batch_id,
    ids: batch.ids,
    status: batch.status,
  }));

  let statuses = new Set(batchStatuses.map((b) => b.status));
  let overallStatus = 'yet_to_start';
  if (statuses.has('triggered')) overallStatus = 'triggered';
  if (statuses.size === 1 && statuses.has('completed')) overallStatus = 'completed';

  res.json({
    ingestion_id,
    status: overallStatus,
    batches: batchStatuses,
  });
}

module.exports = { getStatus };
