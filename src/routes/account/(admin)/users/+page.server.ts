import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ( event ) =>
{
  return {
    users: await db.user.findMany(),
  };
};