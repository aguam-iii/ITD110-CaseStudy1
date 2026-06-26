const express = require('express');
const router = express.Router();
const {
    getFullyClearedRequests,
    getAllRequestsForRegistrar,
    updateDispatch,
    markDispatched,
    getDashboardStats
} = require('../controllers/registrarController');

router.get('/cleared', getFullyClearedRequests);
router.get('/all', getAllRequestsForRegistrar);
router.get('/stats', getDashboardStats);
router.put('/dispatch/:requestId', updateDispatch);
router.put('/mark-dispatched/:requestId', markDispatched);

module.exports = router;
