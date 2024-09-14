import { NextRequest } from "next/server";
import { File as FileRecord } from "@prisma/client";
import { getFileRecordByFilename } from "@/data";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";

async function fileExists (filePath: string): Promise<boolean>
{
  try
  {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch
  {
    return false;
  }
}

export async function GET (req: NextRequest)
{
  const pathname: string[] = req.nextUrl.pathname.split("/").slice(1);
  
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
    
    const filePath = path.join(process.cwd(), "uploads", record.hash);
    
    if ( !await fileExists(filePath) )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    const stat = await fs.stat(filePath);
    const range = req.headers.get("Range");
    
    const streamToReadableStream = (readable: NodeJS.ReadableStream): ReadableStream<Uint8Array> =>
    {
      return new ReadableStream<Uint8Array>({
        start (controller)
        {
          readable.on("data", chunk => controller.enqueue(new Uint8Array(chunk)));
          readable.on("end", () => controller.close());
          readable.on("error", err => controller.error(err));
        }
      });
    };
    
    if ( range )
    {
      const [ start, end ] = range.replace(/bytes=/, "").split("-").map(Number);
      const fileStream = createReadStream(filePath, { start, end: end || stat.size - 1 });
      const readableStream = streamToReadableStream(fileStream);
      
      return new Response(readableStream, {
        headers: {
          "Content-Type": record.mimeType,
          "Content-Range": `bytes ${start}-${end || stat.size - 1}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": ((end || stat.size - 1) - start + 1).toString(),
        }
      });
    } else
    {
      const fileStream = createReadStream(filePath);
      const readableStream = streamToReadableStream(fileStream);
      
      return new Response(readableStream, {
        headers: { "Content-Type": record.mimeType }
      });
    }
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}