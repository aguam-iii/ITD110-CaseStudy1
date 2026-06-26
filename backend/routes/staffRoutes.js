const express = require('express');
const router = express.Router();
const {
    getOfficeRequests,
    searchStudent,
    updateClearanceStatus
} = require('../controllers/staffController');

router.get('/office/:office', getOfficeRequests);
router.get('/search', searchStudent);
router.put('/clearance/:requestId', updateClearanceStatus);

module.exports = router;
