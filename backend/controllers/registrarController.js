const DocumentRequest = require('../models/DocumentRequest');

// Get fully cleared requests awaiting registrar processing
const getFullyClearedRequests = async (req, res) => {
    try {
        const requests = await DocumentRequest.find({
            globalStatus: 'Fully Cleared'
        }).sort({ updatedAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all requests for registrar dashboard
const getAllRequestsForRegistrar = async (req, res) => {
    try {
        const { globalStatus, search } = req.query;
        let filter = {};

        if (globalStatus) filter.globalStatus = globalStatus;

        if (search) {
            filter.$or = [
                { studentId: { $regex: search, $options: 'i' } },
                { studentName: { $regex: search, $options: 'i' } },
                { studentEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const requests = await DocumentRequest.find(filter).sort({ updatedAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update dispatch information
const updateDispatch = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { method, trackingNumber, registrarNotes } = req.body;

        const request = await DocumentRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.dispatchCoordinates = {
            method: method || 'In-Person',
            date: new Date(),
            trackingNumber: trackingNumber || null
        };

        request.registrarNotes = registrarNotes || '';
        request.globalStatus = 'Ready for Pickup';
        request.completedAt = new Date();

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark as dispatched
const markDispatched = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await DocumentRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.globalStatus = 'Dispatched';
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const total = await DocumentRequest.countDocuments();
        const pending = await DocumentRequest.countDocuments({ globalStatus: 'Pending' });
        const inProgress = await DocumentRequest.countDocuments({ globalStatus: 'In Progress' });
        const fullCleared = await DocumentRequest.countDocuments({ globalStatus: 'Fully Cleared' });
        const readyPickup = await DocumentRequest.countDocuments({ globalStatus: 'Ready for Pickup' });
        const dispatched = await DocumentRequest.countDocuments({ globalStatus: 'Dispatched' });

        const byDocument = await DocumentRequest.aggregate([
            {
                $group: {
                    _id: '$documentType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const byOffice = await DocumentRequest.aggregate([
            { $unwind: '$clearanceHistory' },
            {
                $group: {
                    _id: '$clearanceHistory.office',
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$clearanceHistory.status', 'Pending'] }, 1, 0]
                        }
                    },
                    cleared: {
                        $sum: {
                            $cond: [{ $eq: ['$clearanceHistory.status', 'Cleared'] }, 1, 0]
                        }
                    },
                    hold: {
                        $sum: {
                            $cond: [{ $eq: ['$clearanceHistory.status', 'Hold'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            summary: {
                total,
                pending,
                inProgress,
                fullCleared,
                readyPickup,
                dispatched
            },
            byDocument,
            byOffice
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFullyClearedRequests,
    getAllRequestsForRegistrar,
    updateDispatch,
    markDispatched,
    getDashboardStats
};
