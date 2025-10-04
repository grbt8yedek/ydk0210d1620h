import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session: session,
      hasSession: !!session,
      hasUserId: !!session?.user?.id,
      user: session?.user
    });
  } catch (error) {
    logger.error('Session test hatası', { error });
    return NextResponse.json(
      { error: 'Session test hatası', details: error },
      { status: 500 }
    );
  }
} 