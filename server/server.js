// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: __dirname + '/' + envFile });
console.log('==============================');
console.log('THE DIGITAL TRADING Backend Server Starting');
console.log('[DEBUG] MONGO_URI:', process.env.MONGO_URI);
console.log('[DEBUG] PORT:', process.env.PORT);
console.log('==============================');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const { startRoiCron } = require('./utils/roiCalculator');

const app = express();
// Trust proxy headers (needed for WebSocket support on Render and similar hosts)
app.set('trust proxy', 1);
// Log all /socket.io/ requests for debugging WebSocket handshake issues
app.use('/socket.io', (req, res, next) => {
  console.log(`[SOCKET.IO] ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  next();
});
const server = http.createServer(app);

// Parse CORS origins - handle both single origin and comma-separated multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

console.log('[CORS] Configured origins:', corsOrigins);

const io = socketio(server, { cors: { origin: corsOrigins, credentials: true } });

// Basic Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected to WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('[CORS] Blocked origin:', origin, 'Allowed origins:', corsOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization']
};

// CORS Middleware
app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
// Ensure Authorization header is explicitly allowed for all responses (safety for proxies)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  // Helpful debug logging for CORS issues
  if (req.method === 'OPTIONS') console.log('[CORS] Preflight', req.method, req.originalUrl, 'Headers:', Object.keys(req.headers));
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Register /api/plans route after app is initialized and after all require statements
app.use('/api/plans', require('./routes/plans'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    startRoiCron(); // Start ROI simulation cron after DB is connected
  })
  .catch(err => console.log(err));

// Routes
const authRouter = require('./routes/auth');
console.log('Mounting /api/auth routes...');
app.use('/api/auth', authRouter);
console.log('/api/auth routes mounted. All /api/auth/* requests will be logged by the router.');
app.use('/api/users', require('./routes/users'));
app.use('/api/funds', require('./routes/funds'));
app.use('/api/blogs', require('./routes/blog'));
app.use('/api/events', require('./routes/event'));
app.use('/api/user', require('./routes/user'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/portfolio', require('./routes/portfolio_invest'));
app.use('/api/deposit', require('./routes/deposit'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/plans', require('./routes/admin/plans'));
app.use('/api/market-updates', require('./routes/market-updates'));
app.use('/api/admin/roi-approvals', require('./routes/admin/roi-approvals'));
app.use('/api/admin/user-investments', require('./routes/admin/userInvestments'));
app.use('/uploads', require('./routes/uploads'));
app.use(require('./routes/sendTestEmail'));
app.use('/api/test', require('./routes/test'));
app.use('/uploads/announcements', express.static(__dirname + '/uploads/announcements'));
app.use('/uploads/cars', express.static(__dirname + '/uploads/cars'));
app.use('/uploads/kyc', express.static(__dirname + '/uploads/kyc'));
app.use('/api', require('./routes/announcementUploads'));
app.use('/api/performance', require('./routes/performance')); // Add performance metrics API route
app.use('/api/news', require('./routes/news')); // Add news API route
app.use('/api/investment', require('./routes/investment'));
app.use('/api/ai-chat', require('./routes/aiChat'));
app.use('/api/withdrawal', require('./routes/withdrawal'));
app.use('/api/cars', require('./routes/cars'));

// Socket.IO logic
io.on('connection', (socket) => {
  // Group chat logic
  socket.on('joinGroup', ({ name }) => {
    socket.join('groupchat');
    socket.data.nickname = name;
    // Optionally notify others someone joined
    // io.to('groupchat').emit('groupMessage', { name: 'System', text: `${name} joined the chat`, time: new Date().toLocaleTimeString(), isAdmin: false });
  });

  socket.on('groupMessage', (msg) => {
    // Broadcast to all in groupchat room
    io.to('groupchat').emit('groupMessage', msg);
  });
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log('Socket joined room:', userId);
  });
  socket.on('adminJoin', () => {
    socket.join('admins');
    console.log('Admin joined admins room');
  });
  socket.on('leaveAdmins', () => {
    socket.leave('admins');
    console.log('Admin left admins room');
  });
  socket.on('adminTyping', ({ userId }) => {
    io.to(userId).emit('adminTyping', { userId });
  });
  socket.on('adminStopTyping', ({ userId }) => {
    io.to(userId).emit('adminStopTyping', { userId });
  });
  socket.on('endSupportSession', ({ userId }) => {
    console.log('Backend received endSupportSession for user:', userId);
    io.to(userId).emit('endSupportSession');
  });
});

// Health check endpoint for DB and server status
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    let dbStatus = 'disconnected';
    if (dbState === 1) dbStatus = 'connected';
    else if (dbState === 2) dbStatus = 'connecting';
    else if (dbState === 3) dbStatus = 'disconnecting';
    res.json({
      status: 'ok',
      dbStatus,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Root route for health check
app.get('/', (req, res) => {
  res.send('API is running');
});

server.listen(process.env.PORT || 5001, () => {
  console.log('Server running on port', process.env.PORT || 5001);
});