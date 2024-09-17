import { db } from "@/lib/db";
import { File as FileRecord } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer, FileTypeResult } from "file-type";
import { cache } from "react";
import { metadata } from "@/app/layout";

const getFileRecords: () => Promise<FileRecord[]> = cache(async (): Promise<FileRecord[]> => db.file.findMany());
const getFileRecordByFilename: ( filename: string ) => Promise<FileRecord | null> = cache(async ( filename: string ): Promise<FileRecord | null> => db.file.findUnique({ where: { filename } }));

async function havePermission( req: NextRequest ): Promise<boolean>
{
  const session = await auth();
  
  const apiKeyRecord = await db.apiKey.findFirst({
    where: {
      key: req.headers.get("Authorization")?.replace(/^Bearer /, ""),
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });
  
  return session?.user?.role === "ADMIN" || apiKeyRecord !== null;
}

async function fileExists( filePath: string ): Promise<boolean>
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

const getFileObject = ( { mimeType, filename }: { mimeType: string, filename: string } ) => ({
  name: filename,
  type: mimeType,
  rawUrl: `${new URL(`/raw/${encodeURI(filename)}`, metadata.metadataBase!).toString()}`,
  url: `${new URL(`/${encodeURI(filename)}`, metadata.metadataBase!).toString()}`,
});

export async function GET()
{
  try
  {
    const fileRecords: FileRecord[] = await getFileRecords();
    return Response.json({
      success: true,
      data: fileRecords.map(getFileObject),
    });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST( req: NextRequest )
{
  try
  {
    const permission = await havePermission(req);
    
    if ( !permission )
      return Response.json({ success: false, error: "You don't have permission to upload files" }, { status: 401 });
    
    const formData: FormData = await req.formData();
    const files: File[] = formData.getAll("file") as File[];
    
    if ( files.length === 0 )
      return Response.json({ success: false, error: "No files provided" }, { status: 400 });
    
    if ( !files.every(file => file instanceof File) )
      return Response.json({ success: false, error: "Invalid file" }, { status: 400 });
    
    const data = await Promise.all(files.map(async ( file ) =>
    {
      const buffer = Buffer.from(await file.arrayBuffer());
      const type: FileTypeResult | undefined = await fileTypeFromBuffer(buffer);
      return {
        filename: file.name,
        hash: createHash("sha256").update(buffer).digest("hex"),
        mimeType: file.type === "application/octet-stream" && type ? type.mime : file.type,
        buffer,
      };
    }));
    
    await fs.mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
    
    const existingFilesData: FileRecord[] = await getFileRecords();
    const uniqueData = data.filter(( { hash } ) => !existingFilesData.some(( { hash: existingHash } ) => hash === existingHash));
    
    for ( let datum of uniqueData )
    {
      const existingFile = existingFilesData.find(( { filename } ) => filename === datum.filename);
      if ( existingFile )
        datum.filename = datum.filename.replace(/(\.[^.]+)$/, `-${Math.random().toString(36).substring(2, 6)}$1`);
    }
    
    await db.file.createMany({ data: uniqueData.map(( { buffer, ...data } ) => data) });
    
    const existingFiles: string[] = await fs.readdir(path.join(process.cwd(), "uploads"));
    const missingFiles: string[] = uniqueData.map(( { hash } ) => hash).filter(( filename ) => !existingFiles.includes(filename));
    
    await Promise.all(missingFiles.map(async ( filename ) =>
    {
      const file = uniqueData.find(( { hash } ) => hash === filename)!;
      await fs.writeFile(path.join(process.cwd(), "uploads", filename), file.buffer);
    }));
    
    return Response.json({
      success: true,
      data: uniqueData.map(getFileObject),
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
    const permission = await havePermission(req);
    
    if ( !permission )
      return Response.json({ success: false, error: "You don't have permission to upload files" }, { status: 401 });
    
    const json = await req.json();
    
    if ( !json || !json.filename )
      return Response.json({ success: false, error: "No filename provided" }, { status: 400 });
    
    const fileRecord: FileRecord | null = await getFileRecordByFilename(json.filename);
    
    if ( !fileRecord )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    await db.file.delete({ where: { filename: json.filename } });
    if ( await fileExists(path.join(process.cwd(), "uploads", fileRecord.hash)) )
      await fs.rm(path.join(process.cwd(), "uploads", fileRecord.hash));
    
    return Response.json({ success: true });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT( req: NextRequest )
{
  try
  {
    const permission = await havePermission(req);
    
    if ( !permission )
      return Response.json({ success: false, error: "You don't have permission to upload files" }, { status: 401 });
    
    const json = await req.json();
    
    if ( !json || !json.filename || !json.newFilename )
      return Response.json({ success: false, error: "No filename provided" }, { status: 400 });
    
    const fileRecord: FileRecord | null = await getFileRecordByFilename(json.filename);
    
    if ( !fileRecord )
      return Response.json({ success: false, error: "File not found" }, { status: 404 });
    
    await db.file.update({ where: { filename: json.filename }, data: { filename: json.newFilename } });
    
    return Response.json({ success: true });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}