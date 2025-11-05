export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:your-port';
```

Or if you have a `.env` file, create/add:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:your-port
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
