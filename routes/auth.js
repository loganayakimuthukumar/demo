const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const apiLimiter = require('../middlewares/rateLimiter');

router.post('/login', apiLimiter, userController.login);
router.post('/register', apiLimiter, userController.register);


module.exports = router;
