// BiletDukkani API Modüler Yapısı
// Tüm API fonksiyonları kategorilere göre ayrı dosyalarda tanımlanmıştır

// Uçuş Arama API'leri
export { 
  searchFlightsBiletDukkaniDemoPost,
  fareFlightsBiletDukkaniDemo,
  getFareDetailsBiletDukkaniDemo,
  getAirRulesBiletDukkaniDemo,
  getAirRulesBiletDukkaniReal
} from './biletdukkani/searchApi';

// Bagaj API'leri
export { 
  addExtraBaggageBiletDukkaniDemo,
  addExtraBaggageBiletDukkaniReal
} from './biletdukkani/baggageApi';

// Sipariş API'leri
export {
  createOrderBiletDukkaniDemo,
  createOrderBiletDukkaniReal,
  updateOrderNoteBiletDukkaniDemo,
  getOrderRouteTicketsBiletDukkaniDemo,
  getOrderRouteAirRulesBiletDukkaniReal,
  cancelOrderBiletDukkaniReal,
  refundValidateBiletDukkaniReal,
  refundConfirmBiletDukkaniReal,
  getReservationByPNR
} from './biletdukkani/orderApi';

// Müşteri Yönetimi API'leri
export {
  addCustomerBiletDukkaniReal,
  getCustomerListBiletDukkaniReal,
  updateCustomerBiletDukkaniReal,
  deleteCustomerBiletDukkaniReal,
  getCustomerDetailBiletDukkaniReal
} from './biletdukkani/customerApi';

// Havalimanı Arama API'leri
export { searchAirports } from './biletdukkani/airportApi'; 