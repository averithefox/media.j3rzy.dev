import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) =>
{
  const session = await event.locals.auth();
  if ( session?.user ) redirect(303, decodeURIComponent(event.url.searchParams.get("redirect") ?? "/account"));
  return {};
};