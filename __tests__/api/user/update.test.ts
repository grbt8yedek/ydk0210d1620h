import { PUT } from '@/app/api/user/update/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    user: {
      update: jest.fn(),
    },
    passenger: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('User Update API - PUT /api/user/update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body: any) =>
    ({
      json: async () => body,
    } as any);

  it('should update user profile successfully', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '5559876543',
      countryCode: '+90',
    };
    const mockUpdatedUser = {
      id: 'user-123',
      ...updateData,
      email: 'test@example.com',
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: {
          update: jest.fn().mockResolvedValue(mockUpdatedUser),
        },
        passenger: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      });
    });

    const request = mockRequest(updateData);
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUpdatedUser);
  });

  it('should update with optional fields', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'John',
      birthDay: '15',
      birthMonth: '05',
      birthYear: '1990',
      gender: 'male',
      address: 'Test Address',
      city: 'Istanbul',
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        passenger: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      });
    });

    const request = mockRequest(updateData);
    const response = await PUT(request);

    expect(response.status).toBe(200);
  });

  it('should handle number birthDay/Month/Year as string', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'John',
      birthDay: 15, // number
      birthMonth: 5, // number
      birthYear: 1990, // number
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    let capturedData: any;
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: {
          update: jest.fn().mockImplementation((params) => {
            capturedData = params.data;
            return Promise.resolve({});
          }),
        },
        passenger: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      });
    });

    const request = mockRequest(updateData);
    await PUT(request);

    expect(capturedData.birthDay).toBe('15');
    expect(capturedData.birthMonth).toBe('5');
    expect(capturedData.birthYear).toBe('1990');
  });

  it('should update both user and passenger in transaction', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '5559876543',
    };

    const userUpdateMock = jest.fn().mockResolvedValue({});
    const passengerUpdateMock = jest.fn().mockResolvedValue({ count: 1 });

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: { update: userUpdateMock },
        passenger: { updateMany: passengerUpdateMock },
      });
    });

    const request = mockRequest(updateData);
    await PUT(request);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '5559876543',
      }),
    });

    expect(passengerUpdateMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        isAccountOwner: true,
      },
      data: expect.objectContaining({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '5559876543',
      }),
    });
  });

  it('should return 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = mockRequest({ firstName: 'Test' });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim.');
  });

  it('should return 401 when user ID is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: {} });

    const request = mockRequest({ firstName: 'Test' });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Yetkisiz erişim.');
  });

  it('should return 400 for invalid firstName (too short)', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = mockRequest({ firstName: 'A' }); // Only 1 character
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.firstName).toBeDefined();
  });

  it('should return 400 for invalid lastName (too short)', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = mockRequest({ lastName: 'B' }); // Only 1 character
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.lastName).toBeDefined();
  });

  it('should handle database errors', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = mockRequest({ firstName: 'Test' });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Sunucu hatası oluştu.');
  });

  it('should update only provided fields', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'John',
      // lastName not provided
      phone: '5559876543',
      // other fields not provided
    };

    const userUpdateMock = jest.fn().mockResolvedValue({});
    const passengerUpdateMock = jest.fn().mockResolvedValue({ count: 0 });

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: { update: userUpdateMock },
        passenger: { updateMany: passengerUpdateMock },
      });
    });

    const request = mockRequest(updateData);
    await PUT(request);

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: {
        firstName: 'John',
        phone: '5559876543',
      },
    });
  });

  it('should handle isForeigner boolean correctly', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    const passengerUpdateMock = jest.fn().mockResolvedValue({ count: 1 });

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: { update: jest.fn().mockResolvedValue({}) },
        passenger: { updateMany: passengerUpdateMock },
      });
    });

    const request = mockRequest({ isForeigner: true });
    await PUT(request);

    expect(passengerUpdateMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        isAccountOwner: true,
      },
      data: expect.objectContaining({
        isForeigner: true,
      }),
    });
  });

  it('should not include undefined fields in passenger update', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'John',
      // lastName not provided
    };

    const passengerUpdateMock = jest.fn().mockResolvedValue({ count: 0 });

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: { update: jest.fn().mockResolvedValue({}) },
        passenger: { updateMany: passengerUpdateMock },
      });
    });

    const request = mockRequest(updateData);
    await PUT(request);

    const passengerUpdateCall = passengerUpdateMock.mock.calls[0][0];
    expect(passengerUpdateCall.data).toEqual({
      firstName: 'John',
    });
    expect(passengerUpdateCall.data).not.toHaveProperty('lastName');
  });

  it('should handle all fields update', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    const updateData = {
      firstName: 'John',
      lastName: 'Doe',
      countryCode: '+90',
      phone: '5551234567',
      birthDay: '15',
      birthMonth: '05',
      birthYear: '1990',
      gender: 'male',
      identityNumber: '12345678901',
      isForeigner: false,
      address: 'Test Address',
      city: 'Istanbul',
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        passenger: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      });
    });

    const request = mockRequest(updateData);
    const response = await PUT(request);

    expect(response.status).toBe(200);
  });

  it('should validate zod schema', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = mockRequest({
      firstName: 'Valid',
      lastName: 'X', // Too short
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

