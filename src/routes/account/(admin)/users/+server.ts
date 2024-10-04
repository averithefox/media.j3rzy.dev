import type { RequestHandler } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export const PATCH: RequestHandler = async ( event ) =>
{
  try
  {
    const session = await event.locals.auth();
    
    if ( session?.user.role !== "ADMIN" )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const { id, role } = await event.request.json();
    
    if ( !id || !role || ![ "ADMIN", "USER" ].includes(role) )
      return Response.json({ success: false, error: "Invalid data" }, { status: 400 });
    
    await db.user.update({ where: { id }, data: { role } });
    
    return Response.json({ success: true });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};