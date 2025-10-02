import { GET } from '@/app/api/system/status/route';
import { NextRequest } from 'next/server';

describe('GET /api/system/status', () => {
  it('should return successful response', async () => {
    const request = new NextRequest('http://localhost/api/system/status');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });

  it('should return JSON data', async () => {
    const request = new NextRequest('http://localhost/api/system/status');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toBeDefined();
  });
});
