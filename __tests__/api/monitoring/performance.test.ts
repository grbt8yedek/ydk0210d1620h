import { GET } from '@/app/api/monitoring/performance/route';
import { NextRequest } from 'next/server';

describe('GET /api/monitoring/performance', () => {
  it('should return successful response', async () => {
    const request = new NextRequest('http://localhost/api/monitoring/performance');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });

  it('should return JSON data', async () => {
    const request = new NextRequest('http://localhost/api/monitoring/performance');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toBeDefined();
  });
});
