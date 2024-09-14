import { NextRequest } from "next/server";
import { File as FileRecord } from "@prisma/client";
import { getFileByFileRecord, getFileRecordByFilename } from "@/data";

export async function GET ({ nextUrl }: NextRequest)
{
  const pathname: string[] = nextUrl.pathname.split("/").slice(1);
  
  if ( pathname.length > 2 )
    return Response.json({ success: false, error: "Invalid path" }, { status: 404 });
  
  if ( pathname.length < 2 )
    return Response.json({ success: false, error: "I'm a teapot" }, { status: 418 });
  
  try
  {
    const filename = decodeURIComponent(pathname[1]);
    const record: FileRecord | null = await getFileRecordByFilename(filename);
    
    if ( !record )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    const buffer: Buffer | null = await getFileByFileRecord(record);
    
    if ( !buffer )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    return new Response(buffer, { headers: { "Content-Type": record.mimeType } });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}