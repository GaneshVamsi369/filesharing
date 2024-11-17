const express = require('express');
const { signup, verifyEmail, login } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);

module.exports = router;
