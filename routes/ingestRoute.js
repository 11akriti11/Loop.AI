const express = require('express');
const router = express.Router();
const { handleIngest } = require('../controllers/ingestController');

router.post('/', handleIngest);

module.exports = router;
