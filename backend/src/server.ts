import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`✅ Grocery POS backend running`);
  console.log(`   Mode: ${config.deployMode} | Env: ${config.nodeEnv}`);
  console.log(`   Listening on http://localhost:${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
