import { db } from "@/lib/db";
import { File } from "@prisma/client";
import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";

export const getFileRecordByFilename: (filename: string) => Promise<File | null> = cache(async (filename: string): Promise<File | null> => db.file.findUnique({ where: { filename } }));
export const getFileRecords: () => Promise<File[]> = cache(async (): Promise<File[]> => db.file.findMany());

export const getFileByFileRecord: (file: File) => Promise<Buffer | null> = cache(async (file: File): Promise<Buffer | null> =>
{
  try
  {
    return fs.readFile(path.join(process.cwd(), "uploads", file.hash));
  } catch ( e: any )
  {
    return null;
  }
});