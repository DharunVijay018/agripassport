import { Router } from 'express';
import { FarmerController } from '../controllers/farmer-controller';
import { BatchController } from '../controllers/batch-controller';
import { EventController } from '../controllers/event-controller';
import {
  validateBody,
  createFarmerSchema,
  createBatchSchema,
  createEventSchema,
  verifyHashSchema,
} from '../middleware/validation';
import { getBlockchainAdapter } from '../blockchain';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  const adapter = getBlockchainAdapter();
  res.json({
    status: 'ok',
    project: 'AgriPassport',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    blockchain: {
      mode: adapter.getMode(),
      network: adapter.getNetwork(),
    },
  });
});

// Farmers Routes
router.get('/farmers', FarmerController.getAll);
router.get('/farmers/:id', FarmerController.getById);
router.post('/farmers', validateBody(createFarmerSchema), FarmerController.create);

// Batches Routes
router.get('/batches', BatchController.getAll);
router.get('/batches/:id', BatchController.getById);
router.post('/batches', validateBody(createBatchSchema), BatchController.create);

// Events Routes
router.get('/batches/:batchId/events', EventController.getByBatch);
router.post('/events', validateBody(createEventSchema), EventController.create);

// Blockchain Hash Verification Route
router.post('/verify-hash', validateBody(verifyHashSchema), BatchController.verifyHash);

export default router;
