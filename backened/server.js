require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const activityRoutes = require('./routes/activityRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const ngoRoutes = require('./routes/ngoRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || '*').split(',');
const io = new Server(server, { cors: { origin: allowedOrigins } });

// Make io reachable from controllers via req.app.get('io')
app.set('io', io);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'FoodCycle API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ngos', ngoRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FoodCycle API listening on port ${PORT}`));

module.exports = { app, server, io };
