// Add this export at the TOP of the file
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Keep your existing cn function
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000