```bash
chmod +x deploy.sh
./deploy.sh
```
- `+page.svelte` - The HTML content of the page
- `+layout.svelte` - HTML content of the route
- `+page.ts` - Client-side page data fetching
- `+page.server.ts` - Server-side page data fetching, page authorization
- `+layout.ts` - Client-side route data fetching
- `+layout.server.ts` - Server-side route data fetching, route authorization
- `+server.ts` - Server-side route handler