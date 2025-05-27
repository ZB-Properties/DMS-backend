const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
app.use('/upload', express.static('upload'));


const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/documentRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

}).catch(err => console.error(err));
