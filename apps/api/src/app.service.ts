import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Portal API online';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'portal-api',
      timestamp: new Date().toISOString(),
    };
  }
}
