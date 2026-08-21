const { Server } = require('socket.io');

let io;

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🟢 New WebSocket connection: ${socket.id}`);

    // Merchants or Admins can join a specific room for secure updates
    socket.on('join_merchant_room', (userId) => {
      socket.join('merchant_room');
      console.log(`User ${userId} joined merchant_room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 WebSocket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet.');
  }
  return io;
};

module.exports = { initSocket, getIo };
