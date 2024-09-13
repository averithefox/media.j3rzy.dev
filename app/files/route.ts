import { db } from "@/lib/db";
import { File as FileRecord } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";

export async function GET()
{
  try
  {
    const fileRecords: FileRecord[] = await db.file.findMany();
    return Response.json({
      success: true,
      data: fileRecords.map(( fileRecord ) => ({
        name: fileRecord.filename,
        type: fileRecord.mimeType,
      })),
    });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message });
  }
}

export async function POST( req: NextRequest )
{
  try
  {
    const session = await auth();
    
    if ( session?.user?.role !== "ADMIN" )
      return Response.json({ success: false, error: "You don't have permission to upload files" });
    
    const formData: FormData = await req.formData();
    const files: File[] = formData.getAll("file") as File[];
    
    if ( files.length === 0 )
      return Response.json({ success: false, error: "No files provided" });
    
    if ( !files.every(file => file instanceof File) )
      return Response.json({ success: false, error: "Invalid file" });
    
    const data = await Promise.all(files.map(async ( file ) =>
    {
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        filename: file.name,
        hash: createHash("sha256").update(buffer).digest("hex"),
        mimeType: file.type,
        buffer,
      };
    }));
    
    const existingFilesData: FileRecord[] = await db.file.findMany();
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
      data: uniqueData.map(( { filename, mimeType } ) => ({
        name: filename,
        type: mimeType,
      })),
    });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message });
  }
}