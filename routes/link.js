const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const apiLimiter = require('../middlewares/rateLimiter');

router.post('/create-link', apiLimiter, linkController.createLink);
router.get('/verify-link/:token', linkController.verifyLink);

module.exports = router;
