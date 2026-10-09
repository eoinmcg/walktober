export function formatDate(
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...options
  }).format(new Date(date))
}

export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en',
  fallbackText: string = 'Just now'
): string {
  const now = new Date();
  const target = new Date(date);

  const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

  const units: { unit: Intl.RelativeTimeFormatUnit; amount: number }[] = [
    { unit: 'minute', amount: 60 },
    { unit: 'hour', amount: 3600 },
    { unit: 'day', amount: 86400 },
  ];

  // Dynamically feed the current application locale here
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffInSeconds) < 60) {
    return fallbackText;
  }

  for (const { unit, amount } of units) {
    if (Math.abs(diffInSeconds) < amount * 24 || unit === 'day') {
      const value = Math.round(diffInSeconds / amount);

      if (unit === 'day' && Math.abs(value) > 7) {
        // Ensure your existing formatDate also accepts the dynamic locale if needed
        return formatDate(date, { locale });
      }

      return rtf.format(value, unit);
    }
  }

  return formatDate(date, { locale });
}

