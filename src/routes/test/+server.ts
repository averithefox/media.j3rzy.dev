import type { RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => Response.json({ message: "Hello, world!" });