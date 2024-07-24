const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');

router.get('/current-time', timeController.getTime);

module.exports = router;
