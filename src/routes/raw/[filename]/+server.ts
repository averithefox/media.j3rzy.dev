import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import * as path from "node:path";

export const GET: RequestHandler = async (event) =>
{
  const { filename: pathname } = event.params;
  
  if ( !pathname )
    return Response.json({ success: false, error: "I'm a teapot" }, { status: 418 });
  
  try
  {
    const filename = decodeURIComponent(pathname);
    const record = await db.file.findUnique({ where: { filename } });
    
    if ( !record )
      return Response.json({ success: false, error: "File not found", at: "database" }, { status: 404 });
    
    const file = Bun.file(path.join(process.cwd(), "uploads", record.hash));
    
    if ( !await file.exists() )
      return Response.json({ success: false, error: "File not found", at: "filesystem" }, { status: 404 });
    
    return new Response(file.stream(), {
      headers: {
        "Content-Type": record.mimeType,
        "X-File-Hash": record.hash,
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

export const HEAD: RequestHandler = async (event) => new Response(null, {
  headers: {
    "Content-Type": JSON.stringify((await db.file.findUnique({ where: { filename: decodeURIComponent(event.params.filename) } }))?.mimeType ?? null),
  }
});