import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { randomUUID } from "crypto";

export const GET: RequestHandler = async ( event ) =>
{
  try
  {
    const session = await event.locals.auth();
    
    if ( !session )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const keys = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    
    return Response.json({
      success: true,
      data: keys.map(( { key, expiresAt, createdAt } ) => ({
        key, expiresAt, createdAt,
      })),
    });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ( event ) =>
{
  try
  {
    const session = await event.locals.auth();
    
    if ( !session )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const { key, expiresAt, createdAt } = await db.apiKey.create({
      data: {
        userId: session.user.id!,
        key: randomUUID(),
      },
    });
    
    return Response.json({
      success: true, data: { key, expiresAt, createdAt },
    });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ( event ) =>
{
  try
  {
    const session = await event.locals.auth();
    
    if ( !session )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const { key } = await event.request.json();
    
    if ( !key )
      return Response.json({ success: false, error: "Missing key" }, { status: 400 });
    
    const keyRecord = await db.apiKey.findFirst({ where: { AND: [ { key }, { userId: session.user.id } ] } });
    
    if ( !keyRecord )
      return Response.json({ success: false, error: "Invalid key" }, { status: 400 });
    
    await db.apiKey.delete({ where: { key } });
    
    return Response.json({ success: true });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};