export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}