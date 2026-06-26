const express = require('express');
const router = express.Router();
const {
    submitRequest,
    getStudentRequests,
    getRequest,
    getAllRequests,
    deleteRequest,
    exportRequests
} = require('../controllers/documentController');

router.post('/submit', submitRequest);
router.get('/student/:studentId', getStudentRequests);
router.get('/export', exportRequests);
router.get('/', getAllRequests);
router.get('/:id', getRequest);
router.delete('/:id', deleteRequest);

module.exports = router;
