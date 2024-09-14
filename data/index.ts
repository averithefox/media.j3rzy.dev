import { db } from "@/lib/db";
import { File } from "@prisma/client";
import { cache } from "react";

export const getFileRecordByFilename: (filename: string) => Promise<File | null> = cache(async (filename: string): Promise<File | null> => db.file.findUnique({ where: { filename } }));
export const getFileRecords: () => Promise<File[]> = cache(async (): Promise<File[]> => db.file.findMany());