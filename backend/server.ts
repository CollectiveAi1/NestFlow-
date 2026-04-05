import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import activitiesRoutes from './routes/activities';
import attendanceRoutes from './routes/attendance';
import messagesRoutes from './routes/messages';
import staffRoutes from './routes/staff';
import { createServer as createViteServer } from 'vite';
import path from 'path';

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/children', childrenRoutes);
  app.use('/api/activities', activitiesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/staff', staffRoutes);

  // Socket.IO for real-time updates
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join:child', (childId: string) => {
      socket.join(`child:${childId}`);
    });

    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('join:classroom', (classroomId: string) => {
      socket.join(`classroom:${classroomId}`);
    });

    socket.on('activity:created', (data: { childId: string; activity: any }) => {
      io.to(`child:${data.childId}`).emit('activity:new', data.activity);
    });

    socket.on('message:sent', (data: { recipientId: string; message: any }) => {
      io.to(`user:${data.recipientId}`).emit('message:new', data.message);
    });

    socket.on('attendance:update', (data: { classroomId: string; childId: string; status: string }) => {
      io.to(`classroom:${data.classroomId}`).emit('attendance:changed', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start server
  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
  🚀 Child Care Compass Server Started
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📡 HTTP Server: http://localhost:${PORT}
  🔌 WebSocket: ws://localhost:${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

startServer();
