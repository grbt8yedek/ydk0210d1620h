# Error Handling Standardı

## Kullanım Kılavuzu

### 1. Temel Kullanım

```typescript
import { ApiError, successResponse } from '@/utils/errorResponse';

export async function POST(request: Request) {
  try {
    // İş mantığı...
    
    return successResponse(data, 'İşlem başarılı');
  } catch (error) {
    return ApiError.internalError(error as Error);
  }
}
```

### 2. Validation Errors

```typescript
// Eksik alan
if (!email) {
  return ApiError.missingField('Email');
}

// Geçersiz format
if (!emailRegex.test(email)) {
  return ApiError.invalidInput('Geçersiz email formatı');
}

// Detaylı validation
if (errors.length > 0) {
  return ApiError.validationError('Form hataları var', errors);
}
```

### 3. Authentication Errors

```typescript
// Giriş gerekli
return ApiError.unauthorized();

// Yetki yok
return ApiError.forbidden('Admin yetkisi gerekli');

// Yanlış şifre
return ApiError.invalidCredentials();
```

### 4. Resource Errors

```typescript
// Bulunamadı
return ApiError.notFound('Kullanıcı');

// Zaten var
return ApiError.alreadyExists('Email adresi');
```

### 5. Server Errors

```typescript
// Genel hata
return ApiError.internalError(error);

// Database hatası
return ApiError.databaseError(error);

// Dış servis hatası
return ApiError.externalApiError('Bilet Dükkanı', error);
```

### 6. Success Response

```typescript
// Sadece data
return successResponse(userData);

// Data + mesaj
return successResponse(userData, 'Kullanıcı oluşturuldu');

// Farklı status code
return successResponse(userData, 'Oluşturuldu', 201);
```

## Standart Response Formatı

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Girdiğiniz bilgileri kontrol edin",
    "statusCode": 400,
    "details": { } // Sadece development'ta
  }
}
```

### Success Response:
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { }
}
```

## Error Kodları

- `UNAUTHORIZED` - Giriş gerekli (401)
- `FORBIDDEN` - Yetki yok (403)
- `VALIDATION_ERROR` - Form hatası (400)
- `NOT_FOUND` - Kayıt bulunamadı (404)
- `ALREADY_EXISTS` - Kayıt mevcut (409)
- `TOO_MANY_REQUESTS` - Rate limit (429)
- `INTERNAL_ERROR` - Sunucu hatası (500)
- `DATABASE_ERROR` - Veritabanı hatası (500)
- `EXTERNAL_API_ERROR` - Dış servis hatası (502)

## Loglama

Tüm hatalar otomatik olarak Winston logger ile loglanır:

```typescript
return ApiError.internalError(error, {
  userId: '123',
  action: 'delete_user'
});
```

Log çıktısı:
```json
{
  "level": "error",
  "message": "API Error",
  "code": "INTERNAL_ERROR",
  "userId": "123",
  "action": "delete_user",
  "timestamp": "2025-09-30T22:00:00.000Z"
}
```
