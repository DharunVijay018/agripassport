import { Request, Response, NextFunction } from 'express';
import { BatchService } from '../services/batch-service';
import { getBlockchainAdapter } from '../blockchain';

export class BatchController {
  static getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { farmerId, status, search } = req.query;
      const batches = BatchService.getAllBatches({
        farmerId: typeof farmerId === 'string' ? farmerId : undefined,
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
      });
      res.json({ success: true, count: batches.length, data: batches });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const batch = await BatchService.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ success: false, error: `Batch '${req.params.id}' not found` });
      }
      res.json({ success: true, data: batch });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newBatch = await BatchService.createBatch(req.body);
      res.status(201).json({ success: true, data: newBatch });
    } catch (err) {
      next(err);
    }
  }

  static async verifyHash(req: Request, res: Response, next: NextFunction) {
    try {
      const { recordHash } = req.body;
      const adapter = getBlockchainAdapter();
      const result = await adapter.verifyRecord(recordHash);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
