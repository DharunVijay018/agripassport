import { Request, Response, NextFunction } from 'express';
import { FarmerService } from '../services/farmer-service';

export class FarmerController {
  static getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const farmers = FarmerService.getAllFarmers();
      res.json({ success: true, count: farmers.length, data: farmers });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction) {
    try {
      const farmer = FarmerService.getFarmerById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found' });
      }
      res.json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  static create(req: Request, res: Response, next: NextFunction) {
    try {
      const farmer = FarmerService.createFarmer(req.body);
      res.status(201).json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }
}
