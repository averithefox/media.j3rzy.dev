import type { RequestHandler } from "./$types";
import type { Session } from "@auth/sveltekit";
import { db } from "$lib/server/db";
import JSZip from "jszip";
import * as path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import * as fs from "node:fs/promises";

const isAuthorized = async ( req: Request, session: Session | null ) =>
  session?.user?.role === "ADMIN" || (await db.apiKey.findFirst({
    where: {
      key: req.headers.get("Authorization")?.replace(/^Bearer /, ""),
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: { user: true },
  }))?.user.role === "ADMIN";

const toFileObject = (
  { mimeType, filename }: { mimeType: string, filename: string },
  { origin }: URL,
) => ({
  name: filename,
  type: mimeType,
  rawUrl: new URL(`/raw/${encodeURI(filename)}`, origin).href,
  url: new URL(`/${encodeURI(filename)}`, origin).href,
});

export const GET: RequestHandler = async ( event ) =>
{
  const url = new URL(event.request.url);
  
  try
  {
    const fileRecords = await db.file.findMany();
    
    if (
      url.searchParams.has("archive") &&
      await isAuthorized(event.request, await event.locals.auth())
    )
    {
      const zip = new JSZip();
      
      for ( const fileRecord of fileRecords )
      {
        const file = Bun.file(path.join(process.cwd(), "uploads", fileRecord.hash));
        if ( !await file.exists() ) continue;
        zip.file(fileRecord.filename, await file.bytes());
      }
      
      zip.file("metadata.json", JSON.stringify({
        "date": new Date().toISOString(),
        "files": fileRecords,
      }, null, 2));
      
      return new Response(await zip.generateAsync({ type: "nodebuffer" }), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="files.zip"`,
        },
      });
    }
    
    return Response.json({ success: true, data: fileRecords.map(obj => toFileObject(obj, url)) });
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
    
    if ( !await isAuthorized(event.request, session) )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const formData = await event.request.formData();
    const files = formData.getAll("file") as File[];
    
    if ( files.length === 0 )
      return Response.json({ success: false, error: "No files provided" }, { status: 400 });
    
    if ( !files.every(file => file instanceof File) )
      return Response.json({ success: false, error: "Invalid file(s)" }, { status: 400 });
    
    const data = await Promise.all(files.map(async ( file ) =>
    {
      const buffer = await file.arrayBuffer();
      const type = await fileTypeFromBuffer(buffer);
      return {
        filename: file.name,
        hash: new Bun.CryptoHasher("sha256").update(buffer).digest("hex"),
        mimeType: file.type === "application/octet-stream" && type ? type.mime : file.type,
        buffer,
      };
    }));
    
    await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
    
    const existingFilesData = await db.file.findMany();
    const uniqueData = data.filter(( { hash } ) => !existingFilesData.some(( { hash: existingHash } ) => hash === existingHash));
    
    for ( let datum of uniqueData )
    {
      const existingFile = existingFilesData.find(( { filename } ) => filename === datum.filename);
      if ( existingFile )
        datum.filename = datum.filename.replace(/(\.[^.]+)$/, `-${Math.random().toString(36).substring(2, 6)}$1`);
    }
    
    await db.file.createMany({ data: uniqueData.map(( { buffer, ...data } ) => data) });
    
    const existingFiles = await fs.readdir(path.join(process.cwd(), "uploads"));
    const missingFiles = uniqueData.map(( { hash } ) => hash).filter(( filename ) => !existingFiles.includes(filename));
    
    await Promise.all(missingFiles.map(async ( filename ) =>
    {
      const file = uniqueData.find(( { hash } ) => hash === filename)!;
      await Bun.write(path.join(process.cwd(), "uploads", filename), file.buffer);
    }));
    
    return Response.json({
      success: true,
      data: uniqueData.map(obj => toFileObject(obj, new URL(event.request.url))),
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
    if ( !await isAuthorized(event.request, await event.locals.auth()) )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const json = await event.request.json();
    
    if ( !json || !json.filename )
      return Response.json({ success: false, error: "No filename provided" }, { status: 400 });
    
    const fileRecord = await db.file.findUnique({ where: { filename: json.filename } });
    
    if ( !fileRecord )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    await db.file.delete({ where: { filename: json.filename } });
    const filePath = path.join(process.cwd(), "uploads", fileRecord.hash);
    if ( await Bun.file(filePath).exists() )
      await fs.rm(filePath);
    
    return Response.json({ success: true });
  } catch ( e: any )
  {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};