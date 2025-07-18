// BiletDukkani Sipariş API'leri

// POST /orders demo fonksiyonu
export async function createOrderBiletDukkaniDemo(params: {
  fareIds: string[];
  passengers: {
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
    identityNumber: string;
    isForeigner: boolean;
    passengerType: string;
  }[];
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingType: 'book' | 'reserve';
  orderType: 'individual' | 'corporate';
  marketingConsent?: boolean;
}) {
  // Demo amaçlı, başarılı bir sipariş oluşturma simüle eder
  return {
    success: true,
    orderId: 'demo-order-id-' + Date.now(),
    pnr: 'DEMO' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    orderDetails: {
      totalPrice: 150,
      currency: 'EUR',
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 saat geçerli
      status: 'confirmed'
    },
    message: 'Sipariş başarıyla oluşturuldu (DEMO)',
    request: params
  };
}

// POST /orders gerçek API fonksiyonu (hazırlık, canlıda aktif edilecek)
export async function createOrderBiletDukkaniReal(params: {
  fareIds: string[];
  passengers: {
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: string;
    identityNumber: string;
    isForeigner: boolean;
    passengerType: string;
  }[];
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingType: 'book' | 'reserve';
  orderType: 'individual' | 'corporate';
  marketingConsent?: boolean;
}, token: string) {
  const response = await fetch('https://test-api.biletdukkani.com/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error('Sipariş oluşturulamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// PUT /orders/:orderId/note demo fonksiyonu
export async function updateOrderNoteBiletDukkaniDemo(orderId: string, note: string) {
  // Demo amaçlı, başarılı bir not güncelleme simüle eder
  return {
    success: true,
    message: 'Sipariş notu başarıyla güncellendi (DEMO)',
    orderId,
    note
  };
}

// GET /orders/:orderId/routes/:routeId/tickets demo fonksiyonu
export async function getOrderRouteTicketsBiletDukkaniDemo(orderId: string, routeId: string) {
  // Demo amaçlı, örnek bilet detayları döndürür
  return {
    orderId,
    routeId,
    tickets: [
      {
        pnr: 'DEMO' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        flightNumber: 'TK123',
        origin: 'IST',
        destination: 'AMS',
        departureTime: '2024-08-15T09:00:00',
        arrivalTime: '2024-08-15T11:20:00',
        passengerName: 'Ali İncesu',
        seat: '12A',
        price: 150,
        currency: 'EUR',
        status: 'confirmed'
      }
    ]
  };
}

// GET /orders/:orderId/routes/:routeId/air-rules gerçek API fonksiyonu
export async function getOrderRouteAirRulesBiletDukkaniReal(orderId: string, routeId: string, token: string) {
  const url = `https://test-api.biletdukkani.com/orders/${orderId}/routes/${routeId}/air-rules`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Sipariş kural bilgisi alınamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data.data || [];
}

// DELETE /orders/:orderId gerçek API fonksiyonu
export async function cancelOrderBiletDukkaniReal(orderId: string, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Sipariş iptal edilemedi: ' + response.statusText);
  }
  return { success: true };
}

// POST /orders/:orderId/refund/validate gerçek API fonksiyonu
export async function refundValidateBiletDukkaniReal(orderId: string, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/orders/${orderId}/refund/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('İade doğrulaması yapılamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// POST /orders/:orderId/refund/confirm gerçek API fonksiyonu
export async function refundConfirmBiletDukkaniReal(orderId: string, totalRefundPrice: number, agencyCommission: number, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/orders/${orderId}/refund/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      totalRefundPrice,
      agencyCommission
    })
  });
  if (!response.ok) {
    throw new Error('İade onaylanamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// GET /reservations/:pnr demo fonksiyonu
export async function getReservationByPNR(pnr: string, lastName: string) {
  // Demo amaçlı, örnek rezervasyon detayları döndürür
  return {
    pnr: pnr,
    passenger: {
      firstName: 'Ali',
      lastName: lastName
    },
    flight: {
      flightNumber: 'TK123',
      airlineName: 'Turkish Airlines',
      origin: 'IST',
      destination: 'AMS',
      departureTime: '2024-08-15T09:00:00',
      arrivalTime: '2024-08-15T11:20:00',
      seat: '12A'
    },
    status: 'confirmed'
  };
} 