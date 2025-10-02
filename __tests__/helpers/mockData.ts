// Mock data for tests

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: '$2a$10$hashedpassword', // bcrypt hash of 'password123'
  role: 'user',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockAdminUser = {
  ...mockUser,
  email: 'admin@grbt8.store',
  role: 'admin',
}

export const mockCard = {
  number: '4242424242424242',
  expiry: '12/2025',
  cvv: '123',
  holderName: 'TEST USER',
}

export const mockExpiredCard = {
  ...mockCard,
  expiry: '01/2020',
}

export const mockInvalidCard = {
  ...mockCard,
  number: '1234567890123456',
}

export const mockFlight = {
  id: 'flight-123',
  departure: 'IST',
  arrival: 'AMS',
  departureTime: '2024-06-01T10:00:00Z',
  arrivalTime: '2024-06-01T14:00:00Z',
  price: 1000,
  currency: 'TRY',
  airline: 'Turkish Airlines',
  flightNumber: 'TK1234',
}

export const mockPassenger = {
  firstName: 'John',
  lastName: 'Doe',
  birthDate: '1990-01-01',
  nationality: 'TR',
  identityNumber: '12345678901',
  passportNumber: '',
  gender: 'M',
}

export const mockReservation = {
  id: 'reservation-123',
  userId: mockUser.id,
  flightId: mockFlight.id,
  pnr: 'ABC123',
  status: 'confirmed',
  totalPrice: 1180,
  createdAt: new Date(),
}

export const mockPayment = {
  id: 'payment-123',
  reservationId: mockReservation.id,
  amount: 1180,
  currency: 'TRY',
  status: 'completed',
  transactionId: 'txn-123456',
  createdAt: new Date(),
}

export const createMockCard = (overrides = {}) => ({
  ...mockCard,
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
})

export const createMockFlight = (overrides = {}) => ({
  ...mockFlight,
  ...overrides,
})

export const createMockPassenger = (overrides = {}) => ({
  ...mockPassenger,
  ...overrides,
})

