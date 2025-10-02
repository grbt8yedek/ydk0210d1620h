import { GET } from '@/app/api/monitoring/payments/route';
import { NextRequest } from 'next/server';

describe('GET /api/monitoring/payments', () => {
  it('should return successful response', async () => {
    const request = new NextRequest('http://localhost/api/monitoring/payments');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });

  it('should return JSON data', async () => {
    const request = new NextRequest('http://localhost/api/monitoring/payments');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toBeDefined();
  });
});
