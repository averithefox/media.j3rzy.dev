import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) =>
{
  return {
    session: await event.locals.auth(),
    origin: new URL(event.request.url).origin
  };
};