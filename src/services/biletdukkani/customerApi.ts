// BiletDukkani Müşteri Yönetimi API'leri

// POST /customers gerçek API fonksiyonu
export async function addCustomerBiletDukkaniReal(customerData: any, token: string) {
  const response = await fetch('https://test-api.biletdukkani.com/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(customerData)
  });
  if (!response.ok) {
    throw new Error('Müşteri eklenemedi: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// GET /customers gerçek API fonksiyonu
export async function getCustomerListBiletDukkaniReal(params: any, token: string) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `https://test-api.biletdukkani.com/customers?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Müşteri listesi alınamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// PUT /customers/:id gerçek API fonksiyonu
export async function updateCustomerBiletDukkaniReal(id: string, customerData: any, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(customerData)
  });
  if (!response.ok) {
    throw new Error('Müşteri güncellenemedi: ' + response.statusText);
  }
  const data = await response.json();
  return data;
}

// DELETE /customers/:id gerçek API fonksiyonu
export async function deleteCustomerBiletDukkaniReal(id: string, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/customers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Müşteri silinemedi: ' + response.statusText);
  }
  return { success: true };
}

// GET /customers/:id gerçek API fonksiyonu
export async function getCustomerDetailBiletDukkaniReal(id: string, token: string) {
  const response = await fetch(`https://test-api.biletdukkani.com/customers/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Müşteri detayı alınamadı: ' + response.statusText);
  }
  const data = await response.json();
  return data;
} 