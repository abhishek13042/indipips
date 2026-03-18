const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getGlobalAnalytics } = require('../controllers/analytics.controller');

const router = express.Router();

router.use(protect); // Ensure all analytics endpoints are for logged in users

router.get('/global', getGlobalAnalytics);

module.exports = router;
