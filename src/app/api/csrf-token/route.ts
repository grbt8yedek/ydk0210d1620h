import { NextResponse } from 'next/server';
import { generateCSRFToken, storeCSRFToken, createCSRFResponse } from '@/lib/csrfProtection';

export async function GET() {
  try {
    // CSRF token oluştur
    const token = generateCSRFToken();
    
    // Token'ı kaydet (session ID yerine random ID kullanıyoruz)
    const sessionId = Math.random().toString(36).substring(2);
    storeCSRFToken(sessionId, token);
    
    // Response oluştur
    const response = createCSRFResponse(token);
    
    return response;
    
  } catch (error) {
    console.error('CSRF token oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'CSRF token oluşturulamadı' },
      { status: 500 }
    );
  }
}
