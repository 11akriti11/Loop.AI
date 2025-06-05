const express = require('express');
const ingestRoutes = require('./routes/ingestRoute');
const statusRoutes = require('./routes/statusRoutes');
const processor = require('./services/processor');

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Data Ingestion API is running');
});
app.use('/ingest', ingestRoutes);
app.use('/status', statusRoutes);

// Start the background batch processor
processor.startQueueProcessor();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
