import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { File as FileRecord } from "@prisma/client";
import * as fs from "node:fs/promises";
import path from "node:path";

export async function GET( { nextUrl }: NextRequest )
{
  const pathname: string[] = new URL(nextUrl).pathname.split("/").slice(1);
  
  if ( pathname.length > 2 )
    return new Response(JSON.stringify({ success: false, error: "Invalid path" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  
  if ( pathname.length < 2 )
    return new Response(JSON.stringify({ success: false, error: "I'm a teapot" }), {
      status: 418,
      headers: { "Content-Type": "application/json" },
    });
  
  try {
    const filename = pathname[1];
    const record: FileRecord | null = await db.file.findUnique({ where: { filename } });
    
    if ( !record )
      return new Response(JSON.stringify({ success: false, error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    
    const buffer: Buffer = await fs.readFile(path.join(process.cwd(), "uploads", record.hash));
    return new Response(buffer, { headers: { "Content-Type": record.mimeType } });
  } catch ( e: any )
  {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}