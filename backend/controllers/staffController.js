const DocumentRequest = require('../models/DocumentRequest');

// Get pending requests for a specific office
const getOfficeRequests = async (req, res) => {
    try {
        const { office } = req.params;

        const validOffices = ['Library', 'Laboratory', 'Finance', 'Health Center'];
        if (!validOffices.includes(office)) {
            return res.status(400).json({ message: 'Invalid office' });
        }

        const requests = await DocumentRequest.find({
            'clearanceHistory.office': office,
            'clearanceHistory.status': 'Pending'
        });

        const filtered = requests.map(req => ({
            ...req.toObject(),
            currentStage: req.clearanceHistory.find(stage => stage.office === office)
        }));

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search student by ID
const searchStudent = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query required' });
        }

        const request = await DocumentRequest.findOne({
            $or: [
                { studentId: { $regex: query, $options: 'i' } },
                { studentEmail: { $regex: query, $options: 'i' } }
            ]
        });

        if (!request) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update clearance status
const updateClearanceStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { office, status, feedback, staffName } = req.body;

        if (!['Pending', 'Cleared', 'Hold'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await DocumentRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const stageIndex = request.clearanceHistory.findIndex(s => s.office === office);
        if (stageIndex === -1) {
            return res.status(400).json({ message: 'Office not found in clearance history' });
        }

        request.clearanceHistory[stageIndex].status = status;
        request.clearanceHistory[stageIndex].feedback = feedback || '';
        request.clearanceHistory[stageIndex].staffName = staffName || '';
        request.clearanceHistory[stageIndex].completedAt = new Date();

        // Update global status
        const allClearedOrHold = request.clearanceHistory.every(stage =>
            stage.status === 'Cleared' || stage.status === 'Hold'
        );

        const allCleared = request.clearanceHistory.every(stage => stage.status === 'Cleared');
        const hasHold = request.clearanceHistory.some(stage => stage.status === 'Hold');

        if (allCleared) {
            request.globalStatus = 'Fully Cleared';
        } else if (hasHold) {
            request.globalStatus = 'In Progress';
        } else if (allClearedOrHold) {
            request.globalStatus = 'In Progress';
        } else {
            request.globalStatus = 'In Progress';
        }

        await request.save();
        res.json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getOfficeRequests,
    searchStudent,
    updateClearanceStatus
};
