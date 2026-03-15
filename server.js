import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'codesphere';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory in production
app.use(express.static(path.join(__dirname, 'dist')));

// Timer State
let timerState = {
  endTime: 0,
  isPaused: false,
  pauseTimeRemaining: 0, // When paused, store how much time was left so we can resume
};

// Start Date logic (from previous env variables)
const startDate = process.env.VITE_STARTING_DATE || "2026-03-15";
const startTime = process.env.VITE_STARTING_TIME || "00:00";
const targetDate = new Date(`${startDate}T${startTime}`);
timerState.endTime = targetDate.getTime();

// Auth Endpoint
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin Middleware for Socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    // If no token, allow connection but mark as public
    socket.data.isAdmin = false;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.isAdmin = decoded.role === 'admin';
    next();
  } catch (err) {
    // Invalid token, still connect but as public
    socket.data.isAdmin = false;
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} (Admin: ${socket.data.isAdmin})`);

  // Send initial state & authorization status
  socket.emit('timerState', timerState);
  socket.emit('authStatus', { isAdmin: socket.data.isAdmin });

  // Admin Commands
  socket.on('adminCommand', (command) => {
    if (!socket.data.isAdmin) {
      console.log('Unauthorized admin command ignored');
      return;
    }

    const now = Date.now();

    switch (command.type) {
      case 'PAUSE':
        if (!timerState.isPaused) {
          timerState.isPaused = true;
          // Calculate how much time was remaining when paused
          timerState.pauseTimeRemaining = Math.max(0, timerState.endTime - now);
        }
        break;
      case 'PLAY':
        if (timerState.isPaused) {
          timerState.isPaused = false;
          // Calculate new end time based on the remaining time
          timerState.endTime = now + timerState.pauseTimeRemaining;
        }
        break;
      case 'SET_TIME': // payload will be the remaining time in MS
         const remainingTimeMs = command.payload;
         timerState.isPaused = false;
         timerState.endTime = now + remainingTimeMs;
         break;
      case 'ADD_TIME': // adds/removes time to current remaining payload = ms (+ or -)
         const deltaMs = command.payload;
         if (timerState.isPaused) {
           timerState.pauseTimeRemaining += deltaMs;
         } else {
           timerState.endTime += deltaMs;
         }
         break;
    }

    // Broadcast new state to all clients
    io.emit('timerState', timerState);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Fallback for SPA routing if we ever use HTML history
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
