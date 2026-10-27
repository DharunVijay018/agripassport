import QRCode from 'qrcode';
import { config } from '../config/env';

export class QRService {
  static getVerificationUrl(batchId: string): string {
    return `${config.frontendUrl}/verify/${batchId}`;
  }

  static async generateQrDataUrl(batchId: string): Promise<string> {
    const url = this.getVerificationUrl(batchId);
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e3a24',
        light: '#ffffff',
      },
    });
  }

  static async generateQrSvg(batchId: string): Promise<string> {
    const url = this.getVerificationUrl(batchId);
    return QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e3a24',
        light: '#ffffff',
      },
    });
  }
}
