import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const createFarmerSchema = z.object({
  farmerId: z.string().min(3).max(30),
  name: z.string().min(2).max(100),
  fpoName: z.string().min(2).max(150),
  village: z.string().min(2).max(100),
  district: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  gpsCoordinates: z.string().regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, 'Must be valid lat,long coordinates'),
  organicCertified: z.boolean().default(false),
  contactPlaceholder: z.string().optional(),
  isFictionalDemo: z.boolean().optional(),
});

export const createBatchSchema = z.object({
  batchId: z.string().min(5).max(40).optional(),
  farmerId: z.string().min(3).max(30),
  cropName: z.string().min(2).max(80),
  variety: z.string().min(2).max(80),
  harvestDate: z.string().datetime({ message: 'Must be a valid ISO-8601 date string' }),
  farmLocation: z.string().min(2).max(150).optional(),
  gpsCoordinates: z.string().optional(),
  quantity: z.number().positive({ message: 'Quantity must be greater than zero' }),
  unit: z.enum(['kg', 'ton', 'crate', 'box', 'quintal']),
  grade: z.string().optional(),
  cultivationMethod: z.string().optional(),
  storageConditions: z.string().optional(),
  initialFreshnessScore: z.number().min(0).max(100).optional(),
  estimatedShelfLifeDays: z.number().int().positive().max(365).optional(),
});

export const createEventSchema = z.object({
  batchId: z.string().min(5).max(40),
  eventType: z.enum([
    'HARVEST_REGISTRATION',
    'PACKHOUSE_GRADING',
    'COLD_CHAIN_PICKUP',
    'TRANSIT_CHECKPOINT',
    'COLD_STORAGE',
    'DISTRIBUTION_HUB_ARRIVAL',
    'RETAIL_STORE_RECEIPT',
  ]),
  timestamp: z.string().datetime().optional(),
  location: z.string().min(2).max(150),
  actorName: z.string().min(2).max(100),
  actorRole: z.enum([
    'FARMER',
    'FPO_QUALITY_INSPECTOR',
    'TRANSPORTER',
    'STORAGE_OPERATOR',
    'AGGREGATOR',
    'RETAILER',
    'INSPECTOR',
  ]),
  temperatureCelsius: z.number().min(-30).max(60).optional(),
  humidityPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().min(2).max(500),
});

export const verifyHashSchema = z.object({
  recordHash: z.string().min(32).max(128),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}
