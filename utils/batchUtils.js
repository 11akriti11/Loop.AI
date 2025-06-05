function splitIntoBatches(ids, batchSize) {
  const result = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    result.push(ids.slice(i, i + batchSize));
  }
  return result;
}

module.exports = { splitIntoBatches };
