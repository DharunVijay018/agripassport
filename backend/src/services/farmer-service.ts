import { getDb } from '../database';
import { Farmer } from '../types';

export class FarmerService {
  static getAllFarmers(): Farmer[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM farmers ORDER BY name ASC').all() as any[];
    return rows.map(r => ({
      farmerId: r.farmer_id,
      name: r.name,
      fpoName: r.fpo_name,
      village: r.village,
      district: r.district,
      state: r.state,
      gpsCoordinates: r.gps_coordinates,
      organicCertified: Boolean(r.organic_certified),
      contactPlaceholder: r.contact_placeholder,
      isFictionalDemo: Boolean(r.is_fictional_demo),
      createdAt: r.created_at,
    }));
  }

  static getFarmerById(farmerId: string): Farmer | null {
    const db = getDb();
    const r = db.prepare('SELECT * FROM farmers WHERE farmer_id = ?').get(farmerId) as any;
    if (!r) return null;
    return {
      farmerId: r.farmer_id,
      name: r.name,
      fpoName: r.fpo_name,
      village: r.village,
      district: r.district,
      state: r.state,
      gpsCoordinates: r.gps_coordinates,
      organicCertified: Boolean(r.organic_certified),
      contactPlaceholder: r.contact_placeholder,
      isFictionalDemo: Boolean(r.is_fictional_demo),
      createdAt: r.created_at,
    };
  }

  static createFarmer(data: {
    farmerId: string;
    name: string;
    fpoName: string;
    village: string;
    district: string;
    state: string;
    gpsCoordinates: string;
    organicCertified: boolean;
    contactPlaceholder?: string;
    isFictionalDemo?: boolean;
  }): Farmer {
    const db = getDb();
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO farmers (
        farmer_id, name, fpo_name, village, district, state,
        gps_coordinates, organic_certified, contact_placeholder, is_fictional_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.farmerId,
      data.name,
      data.fpoName,
      data.village,
      data.district,
      data.state,
      data.gpsCoordinates,
      data.organicCertified ? 1 : 0,
      data.contactPlaceholder || null,
      data.isFictionalDemo ?? 1 ? 1 : 0,
      createdAt
    );

    return {
      ...data,
      createdAt,
    };
  }
}
