const express = require('express');
const router = express.Router();
const { getMyChallenges, getChallengeById } = require('../controllers/challenge.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMyChallenges);
router.get('/:id', protect, getChallengeById);

module.exports = router;