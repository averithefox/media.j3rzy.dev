import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ( event ) =>
{
  return {
    file: await db.file.findUnique({ where: { filename: event.params.filename } }),
  };
};