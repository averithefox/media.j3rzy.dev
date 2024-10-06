import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) =>
{
  return Response.json({ success: true });
}