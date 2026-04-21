export const formatCurrency = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
export const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
export const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : '—');
