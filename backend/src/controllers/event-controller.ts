import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event-service';

export class EventController {
  static getByBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const events = EventService.getEventsByBatchId(req.params.batchId);
      res.json({ success: true, count: events.length, data: events });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.addEvent(req.body);
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }
}
