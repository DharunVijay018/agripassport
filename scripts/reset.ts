import { resetDatabase } from '../backend/src/database';
import { runSeed } from './seed';

async function main() {
  console.log('🔄 Resetting database...');
  resetDatabase();
  console.log('🌱 Seeding fresh demonstration data...');
  await runSeed();
  console.log('✨ Database reset and seeded successfully!');
}

main().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
