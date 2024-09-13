import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApiKey } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

export async function GET()
{
  try
  {
    const session = await auth();
    
    if ( !session || session.user.role !== "ADMIN" )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const keys: ApiKey[] = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return Response.json({
      success: true, data: keys.map(( { key, expiresAt, createdAt } ) => ({
        key, expiresAt, createdAt,
      })),
    });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST()
{
  try
  {
    const session = await auth();
    
    if ( !session || session.user.role !== "ADMIN" )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const key: ApiKey = await db.apiKey.create({ data: { userId: session.user.id!, key: randomUUID() } });
    return Response.json({
      success: true, data: { key: key.key, expiresAt: key.expiresAt, createdAt: key.createdAt },
    });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest )
{
  try
  {
    const session = await auth();
    
    if ( !session || session.user.role !== "ADMIN" )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const json = await req.json();
    
    if ( !json.key )
      return Response.json({ success: false, error: "Missing key" }, { status: 400 });
    
    const key: ApiKey | null = await db.apiKey.findUnique({ where: { key: json.key, userId: session.user.id } });
    if ( !key )
      return Response.json({ success: false, error: "Key not found" }, { status: 404 });
    
    await db.apiKey.delete({ where: { key: key.key } });
    return Response.json({ success: true });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}