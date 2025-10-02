import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/passengers/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    passenger: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Passengers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/passengers', () => {
    it('should return passengers for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const mockPassengers = [
        {
          id: 'pass-1',
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          identityNumber: '12345678901',
          isForeigner: false,
          birthDay: '15',
          birthMonth: '05',
          birthYear: '1990',
          gender: 'male',
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'pass-2',
          userId: 'user-123',
          firstName: 'Jane',
          lastName: 'Doe',
          identityNumber: '98765432109',
          isForeigner: false,
          birthDay: '20',
          birthMonth: '08',
          birthYear: '1992',
          gender: 'female',
          status: 'active',
          createdAt: new Date(),
        },
      ];

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.findMany as jest.Mock).mockResolvedValue(mockPassengers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPassengers);
      expect(prisma.passenger.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: 'active',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return only active passengers', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.findMany as jest.Mock).mockResolvedValue([]);

      await GET();

      expect(prisma.passenger.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        })
      );
    });

    it('should order passengers by createdAt desc', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.findMany as jest.Mock).mockResolvedValue([]);

      await GET();

      expect(prisma.passenger.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc',
          },
        })
      );
    });

    it('should return empty array when no passengers', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.findMany as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Oturum açmanız gerekiyor');
    });

    it('should return 401 when user ID is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: {} });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Oturum açmanız gerekiyor');
    });

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Yolcu listesi alınırken bir hata oluştu');
    });
  });

  describe('POST /api/passengers', () => {
    const mockRequest = (body: any) =>
      new NextRequest('http://localhost/api/passengers', {
        method: 'POST',
        body: JSON.stringify(body),
      });

    const validPassengerData = {
      firstName: 'John',
      lastName: 'Doe',
      identityNumber: '12345678901',
      isForeigner: false,
      birthDay: '15',
      birthMonth: '05',
      birthYear: '1990',
      gender: 'male',
      countryCode: '+90',
      phone: '5551234567',
    };

    it('should create passenger successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const mockCreatedPassenger = {
        id: 'pass-1',
        userId: 'user-123',
        ...validPassengerData,
        hasMilCard: false,
        hasPassport: false,
        status: 'active',
        createdAt: new Date(),
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.create as jest.Mock).mockResolvedValue(mockCreatedPassenger);

      const request = mockRequest(validPassengerData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCreatedPassenger);
      expect(prisma.passenger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          identityNumber: '12345678901',
          isForeigner: false,
        }),
      });
    });

    it('should set default values', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.create as jest.Mock).mockResolvedValue({});

      const request = mockRequest(validPassengerData);
      await POST(request);

      expect(prisma.passenger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hasMilCard: false,
          hasPassport: false,
        }),
      });
    });

    it('should set isForeigner to false if not provided', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const dataWithoutIsForeigner = { ...validPassengerData };
      delete (dataWithoutIsForeigner as any).isForeigner;

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.create as jest.Mock).mockResolvedValue({});

      const request = mockRequest(dataWithoutIsForeigner);
      await POST(request);

      expect(prisma.passenger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isForeigner: false,
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = mockRequest(validPassengerData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Oturum açmanız gerekiyor');
    });

    it('should return 400 when firstName is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const invalidData = { ...validPassengerData };
      delete (invalidData as any).firstName;

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Gerekli alanları doldurunuz');
    });

    it('should return 400 when lastName is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const invalidData = { ...validPassengerData };
      delete (invalidData as any).lastName;

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Gerekli alanları doldurunuz');
    });

    it('should return 400 when birthDay is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const invalidData = { ...validPassengerData };
      delete (invalidData as any).birthDay;

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Gerekli alanları doldurunuz');
    });

    it('should return 400 when gender is missing', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const invalidData = { ...validPassengerData };
      delete (invalidData as any).gender;

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Gerekli alanları doldurunuz');
    });

    it('should validate TC identity number length', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const invalidData = {
        ...validPassengerData,
        identityNumber: '123456789', // 9 digits instead of 11
        isForeigner: false,
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('TC Kimlik numarası 11 haneli olmalıdır');
    });

    it('should skip TC validation for foreigners', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const foreignerData = {
        ...validPassengerData,
        identityNumber: 'AB123456', // Not 11 digits
        isForeigner: true,
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.create as jest.Mock).mockResolvedValue({});

      const request = mockRequest(foreignerData);
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.passenger.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = mockRequest(validPassengerData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Yolcu eklenirken bir hata oluştu');
    });
  });
});

