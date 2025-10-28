import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Declare a global variable for the server Socket.IO instance
declare global {
  var ioServer: Server | undefined;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Create Socket.IO server instance
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // adjust based on your frontend URL
    },
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-chat', (chatId: string) => {
      console.log(`Socket ${socket.id} joining chat ${chatId}`);
      socket.join(chatId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Attach to globalThis to make accessible elsewhere if needed
  globalThis.ioServer = io;

  // Error handling
  httpServer.on('error', (err) => {
    console.error('Server error:', err);
    throw err;
  });

  // Start listening
  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
