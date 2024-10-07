import type { RequestHandler } from "./$types";
import type { Session } from "@auth/sveltekit";
import { db } from "$lib/server/db";
import JSZip from "jszip";
import * as path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import * as fs from "node:fs/promises";
import type { FileObject, IFileObject } from "$lib/types";

const isAuthorized = async ( req: Request, session: Session | null ) =>
{
  const key = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  const keyRecord = key ? await db.apiKey.findUnique({
    where: {
      key,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: { user: true },
  }) : null;
  
  return session?.user?.role === "ADMIN" || !!(keyRecord?.user && keyRecord.user.role === "ADMIN");
};

const toFileObject = <T extends boolean = false>(
  { mimeType, filename, private: isPrivate, createdAt }: {
    mimeType: string;
    filename: string;
    "private": boolean;
    createdAt: Date
  },
  authorized: T = false as T,
): FileObject<T> =>
{
  const baseObject: IFileObject = {
    name: filename,
    type: mimeType,
    uploadedAt: createdAt.getTime(),
  };
  
  if ( authorized )
  {
    return {
      ...baseObject,
      private: isPrivate,
    } as unknown as FileObject<T>;
  }
  
  return baseObject as FileObject<T>;
};

export const GET: RequestHandler = async ( event ) =>
{
  const url = new URL(event.request.url);
  const authorized = await isAuthorized(event.request, await event.locals.auth());
  
  try
  {
    const fileRecords = await db.file.findMany({
      where: {
        OR: [
          { "private": false },
          { "private": authorized },
        ],
      },
    });
    
    if (
      url.searchParams.has("archive") &&
      authorized
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
    
    return Response.json({
      success: true,
      data: fileRecords.map(obj => toFileObject<typeof authorized>(obj, authorized)),
    });
  } catch ( e: unknown )
  {
    if ( e instanceof Error )
      return Response.json({ success: false, error: e.message }, { status: 500 });
    return Response.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ( event ) =>
{
  try
  {
    const authorized = await isAuthorized(event.request, await event.locals.auth());
    
    if ( !authorized )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const formData = await event.request.formData();
    const files = formData.getAll("file") as File[];
    const arePrivate = formData.has("private");
    
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
        "private": arePrivate,
        createdAt: new Date(),
        buffer,
      };
    }));
    
    await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
    
    const existingFilesData = await db.file.findMany();
    const uniqueData = data.filter(( { hash } ) => !existingFilesData.some(( { hash: existingHash } ) => hash === existingHash));
    
    for ( const datum of uniqueData )
    {
      const existingFile = existingFilesData.find(( { filename } ) => filename === datum.filename);
      if ( existingFile )
        datum.filename = datum.filename.replace(/(\.[^.]+)$/, `-${Math.random().toString(36).substring(2, 6)}$1`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      data: uniqueData.map(obj => toFileObject<typeof authorized>(obj, authorized)),
    });
  } catch ( e: unknown )
  {
    if ( e instanceof Error )
      return Response.json({ success: false, error: e.message }, { status: 500 });
    return Response.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
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
  } catch ( e: unknown )
  {
    if ( e instanceof Error )
      return Response.json({ success: false, error: e.message }, { status: 500 });
    return Response.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ( event ) =>
{
  try
  {
    const authorized = await isAuthorized(event.request, await event.locals.auth());
    
    if ( !authorized )
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const data = await event.request.json();
    const { filename } = data;
    
    if ( !data || !filename )
      return Response.json({ success: false, error: "No filename provided" }, { status: 400 });
    
    const fileRecord = await db.file.findUnique({ where: { filename } });
    
    if ( !fileRecord )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    /** Valid types and their values -> [name, type, mapTo?][] */
    const valid: [ string, string, string? ][] = [ [ "private", "boolean" ], [ "name", "string", "filename" ] ];
    
    for ( const key in data )
    {
      const i = valid.findIndex(( [ name ] ) => name === key);
      if ( i === -1 ) delete data[key];
      else if ( typeof data[key] !== valid[i][1] ) delete data[key];
      else if ( valid[i][2] )
      {
        data[valid[i][2]] = data[key];
        delete data[key];
      }
    }
    
    const updatedFileRecord = await db.file.update({
      where: { filename },
      data,
    });
    
    return Response.json({ success: true, data: toFileObject<typeof authorized>(updatedFileRecord, authorized) });
  } catch ( e: unknown )
  {
    if ( e instanceof Error )
      return Response.json({ success: false, error: e.message }, { status: 500 });
    return Response.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
  }
};