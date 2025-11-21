import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// eslint-disable-next-line no-var
declare global {
  var ioServer: Server | undefined;
}

(async () => {
  try {
    await app.prepare();

    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
      cors: {
        origin: '*', // adjust to your frontend URL in production
      },
    });

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

    // Attach to globalThis for access in other modules
    globalThis.ioServer = io;

    httpServer.on('error', (err) => {
      console.error('Server error:', err);
      throw err;
    });

    httpServer.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
})();
