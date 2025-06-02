require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();


const dynamicRoutes = require('./routes/dynamic.routes');
const dynamicJoinRoutes = require('./routes/dynamicJoin.route');
// Auth routes
const authRoutes = require('./routes/auth.routes');

app.use('/api', dynamicRoutes);
app.use("/api/join", dynamicJoinRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
