import express from 'express';
import { registerRoutes } from './server/routes';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist/public');
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the Express app for Vercel
export default app; 