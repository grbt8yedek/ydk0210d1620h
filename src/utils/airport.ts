export function parseAirport(val: string) {
  if (!val) return { code: '', name: '' };
  const [code, ...rest] = val.split(' - ');
  return { code: code.trim(), name: rest.join(' - ').trim() };
}

export function airportFromCode(code: string): { code: string; name: string; city: string } {
  if (!code) return { code: '', name: '', city: '' };
  // Demo için sadece kodu doldur
  return { code, name: code, city: '' };
} 