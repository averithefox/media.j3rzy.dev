import type { PageLoad } from "./$types";

export const load: PageLoad = async ( event ) =>
{
  const req = await event.fetch("/api");
  const keys = await req.json();
  return { keys };
};