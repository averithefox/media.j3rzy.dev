import type { LayoutServerLoad } from './$types';
import { basePath } from "$lib/server";

export const load: LayoutServerLoad = async (event) =>
{
  return {
    session: await event.locals.auth(),
    basePath: basePath.href
  };
};