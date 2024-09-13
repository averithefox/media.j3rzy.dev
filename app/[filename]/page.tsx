"use server";

import { Metadata, ResolvingMetadata } from "next";
import { File } from "@prisma/client";
import { db } from "@/lib/db";
import { cache } from "react";

interface PageProps
{
  params: { filename: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const getFileByFilename = cache(async ( filename: string ): Promise<File | null> => db.file.findUnique({ where: { filename } }));

export async function generateMetadata( props: PageProps, parent: ResolvingMetadata ): Promise<Metadata>
{
  const file: File | null = await getFileByFilename(props.params.filename);
  const metadataBase: URL = (await parent).metadataBase!;
  
  if ( !file )
    return ({
      title: "File not found",
      openGraph: {
        type: "website",
        title: "File not found",
        description: "The requested file was not found on the server.",
      },
    });
  
  return ({
    metadataBase: metadataBase,
    title: file.filename,
    openGraph: {
      type: "website",
      title: file.filename,
      siteName: file.hash,
      description: "Meow :3",
      url: `/media/${file.filename}`,
      images: /^image\//m.test(file.mimeType) ? [ { url: new URL(`/media/${file.filename}`, metadataBase) } ] : undefined,
    },
  });
}

export default async function Page( { params }: PageProps )
{
  const file: File | null = await getFileByFilename(params.filename);
  
  return (
    <main className="w-full h-full items-center justify-center flex">
      {file ? (
        <img
          src={`/media/${params.filename}`}
          alt={params.filename}
          className="max-h-screen h-auth w-auto object-contain"
        />
      ) : (
        <p className="text-center">File not found</p>
      )}
    </main>
  );
}