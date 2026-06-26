const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const documentRoutes = require('./routes/documentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const registrarRoutes = require('./routes/registrarRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/documents', documentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/registrar', registrarRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Smart Document Request & Clearance Tracker API' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});