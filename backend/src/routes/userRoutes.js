const express = require('express');
const { getUsers, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getUsers);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
 
