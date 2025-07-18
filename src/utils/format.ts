import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd MMM yyyy EEE', { locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd MMM EEE', { locale: tr });
  } catch {
    return dateStr;
  }
} 