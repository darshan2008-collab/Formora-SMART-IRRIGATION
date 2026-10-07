import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import devicesRoutes from './routes/devices.routes.js';
import sensorsRoutes from './routes/sensors.routes.js';
import wateringRoutes from './routes/watering.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { getActiveDevice, getDatabase } from './database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): express.Application {
  const app = express();

  // Middleware
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or any localhost origin
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === frontendUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Dev friendly
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint (Section 36)
  app.get('/api/health', (req: Request, res: Response) => {
    try {
      // Test DB connection
      getDatabase().prepare('SELECT 1').get();
      const device = getActiveDevice();
      const esp32Status = device ? device.status : 'demo';

      res.json({
        status: 'ok',
        database: 'connected',
        esp32: esp32Status,
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      res.status(500).json({
        status: 'error',
        database: 'error',
        message: e.message
      });
    }
  });

  // REST API Routes
  app.use('/api/devices', devicesRoutes);
  app.use('/api/sensors', sensorsRoutes);
  app.use('/api/watering', wateringRoutes);
  app.use('/api/settings', settingsRoutes);

  // Serve Frontend Single Page App if dist exists
  const possibleDistPaths = [
    path.resolve(process.cwd(), 'frontend', 'dist'),
    path.resolve(process.cwd(), '..', 'frontend', 'dist'),
    path.resolve(__dirname, '..', '..', 'frontend', 'dist')
  ];
  const distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

  if (distPath) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Informative root response when running in API mode
    app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Formora - Soil Irrigation System API',
        status: 'online',
        version: '1.0.0',
        documentation: 'https://github.com/darshan2008-collab/Formora-SMART-IRRIGATION',
        endpoints: {
          health: '/api/health',
          realtimeSensors: '/api/sensors/realtime',
          sensorHistory: '/api/sensors/history',
          devices: '/api/devices',
          activeDevice: '/api/devices/active',
          wateringStatus: '/api/watering/status',
          settings: '/api/settings'
        }
      });
    });
  }

  // 404 Handler for undefined API routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[App Error]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error occurred'
    });
  });

  return app;
}
