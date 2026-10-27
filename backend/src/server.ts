import { createApp } from './app';
import { config } from './config/env';
import { getDb } from './database';

const app = createApp();

// Ensure DB is initialized
getDb();

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`  🌾 AgriPassport Backend Service Running`);
  console.log(`  📍 Port: http://localhost:${config.port}`);
  console.log(`  🔗 API Health: http://localhost:${config.port}/api/health`);
  console.log(`  ⛓️  Blockchain Mode: ${config.blockchain.mode}`);
  console.log(`=======================================================`);
});
