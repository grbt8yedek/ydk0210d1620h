import { GET } from '@/app/api/user/profile/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('User Profile API - GET /api/user/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile for authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '5551234567',
      countryCode: '+90',
      birthDay: '15',
      birthMonth: '05',
      birthYear: '1990',
      gender: 'male',
      identityNumber: '12345678901',
      isForeigner: false,
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        countryCode: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        gender: true,
        identityNumber: true,
        isForeigner: true,
      },
    });
  });

  it('should not include sensitive data like password', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({});

    await GET();

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          password: true,
        }),
      })
    );
  });

  it('should return 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim.');
  });

  it('should return 401 when user ID is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: {} });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim.');
  });

  it('should return 404 when user not found', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Kullanıcı bulunamadı.');
  });

  it('should handle database errors', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Sunucu hatası oluştu.');
  });

  it('should return all expected profile fields', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '5551234567',
      countryCode: '+90',
      birthDay: '15',
      birthMonth: '05',
      birthYear: '1990',
      gender: 'male',
      identityNumber: '12345678901',
      isForeigner: false,
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('firstName');
    expect(data).toHaveProperty('lastName');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('phone');
    expect(data).toHaveProperty('countryCode');
    expect(data).toHaveProperty('birthDay');
    expect(data).toHaveProperty('birthMonth');
    expect(data).toHaveProperty('birthYear');
    expect(data).toHaveProperty('gender');
    expect(data).toHaveProperty('identityNumber');
    expect(data).toHaveProperty('isForeigner');
  });

  it('should handle user with minimal data', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: null,
      countryCode: null,
      birthDay: null,
      birthMonth: null,
      birthYear: null,
      gender: null,
      identityNumber: null,
      isForeigner: false,
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
  });
});
