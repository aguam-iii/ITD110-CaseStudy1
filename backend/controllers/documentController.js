const DocumentRequest = require('../models/DocumentRequest');

const CLEARANCE_OFFICES = ['Library', 'Laboratory', 'Finance', 'Health Center'];

// Student: Submit new document request
const submitRequest = async (req, res) => {
    try {
        const { studentId, studentName, studentEmail, studentCourse, documentType } = req.body;

        if (!studentId || !studentName || !studentEmail || !studentCourse || !documentType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const clearanceHistory = CLEARANCE_OFFICES.map(office => ({
            office,
            status: 'Pending',
            feedback: '',
            staffName: '',
            completedAt: null
        }));

        const request = await DocumentRequest.create({
            studentId,
            studentName,
            studentEmail,
            studentCourse,
            documentType,
            globalStatus: 'Pending',
            clearanceHistory
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Student: Get their requests
const getStudentRequests = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requests = await DocumentRequest.find({ studentId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Student: Get single request
const getRequest = async (req, res) => {
    try {
        const request = await DocumentRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// All: Get all requests with optional filters
const getAllRequests = async (req, res) => {
    try {
        const { globalStatus, documentType, search, office } = req.query;
        let filter = {};

        if (globalStatus) filter.globalStatus = globalStatus;
        if (documentType) filter.documentType = documentType;

        if (search) {
            filter.$or = [
                { studentId: { $regex: search, $options: 'i' } },
                { studentName: { $regex: search, $options: 'i' } },
                { studentEmail: { $regex: search, $options: 'i' } }
            ];
        }

        let requests = await DocumentRequest.find(filter).sort({ createdAt: -1 });

        if (office) {
            requests = requests.filter(req =>
                req.clearanceHistory.some(stage => stage.office === office)
            );
        }

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete request
const deleteRequest = async (req, res) => {
    try {
        const request = await DocumentRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export for JSON backup
const exportRequests = async (req, res) => {
    try {
        const requests = await DocumentRequest.find();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=requests-backup.json');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitRequest,
    getStudentRequests,
    getRequest,
    getAllRequests,
    deleteRequest,
    exportRequests
};
