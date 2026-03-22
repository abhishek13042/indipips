const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Authenticate socket connection
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect();
      return;
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId;
      
      // Join user-specific room for order confirmations
      socket.join('user:' + userId);
      console.log('👤 User joined room:', userId);
      
      // Existing: join challenge room
      socket.on('join', ({ challengeId }) => {
        if (challengeId) {
          socket.join('challenge:' + challengeId);
          console.log('📊 Challenge room joined:', challengeId);
          socket.emit('joined', { challengeId, status: 'connected' });
        }
      });

      socket.on('leave', ({ challengeId }) => {
        if (challengeId) {
          socket.leave('challenge:' + challengeId);
        }
      });

      socket.on('disconnect', () => {
        console.log('👤 User disconnected:', userId);
      });
    } catch (err) {
      console.error('Socket auth failed:', err.message);
      socket.disconnect();
    }
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit to a specific user's room
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

module.exports = { init, getIO, emitToUser };
