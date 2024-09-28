import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: LayoutServerLoad = async (event) =>
{
  return {
    file: await db.file.findUnique({ where: { filename: event.params.filename } })
  };
};