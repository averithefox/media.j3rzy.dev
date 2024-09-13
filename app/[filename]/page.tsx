"use server";

import { Metadata, ResolvingMetadata } from "next";
import { File } from "@prisma/client";
import React from "react";
import Link from "next/link";
import { getFileRecordByFilename } from "@/data";

interface PageProps
{
  params: { filename: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata( props: PageProps, parent: ResolvingMetadata ): Promise<Metadata>
{
  const file: File | null = await getFileRecordByFilename(props.params.filename);
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
      audio: /^audio\//m.test(file.mimeType) ? [ { url: new URL(`/media/${file.filename}`, metadataBase) } ] : undefined,
      videos: /^video\//m.test(file.mimeType) ? [ { url: new URL(`/media/${file.filename}`, metadataBase) } ] : undefined,
    },
  });
}

export default async function Page( { params }: PageProps )
{
  const file: File | null = await getFileRecordByFilename(params.filename);
  
  return (
    <main className="w-full h-full items-center justify-center flex font-mono whitespace-pre">
      {file ? (
        (() =>
        {
          switch ( file.mimeType.split("/")[0] )
          {
            case "image":
              return <img
                src={`/media/${params.filename}`}
                alt={params.filename}
                className="max-h-screen h-auth w-auto object-contain"
              />;
            case "audio":
              return <audio controls>
                <source src={`/media/${file.filename}`} type={file.mimeType}/>
                Your browser does not support the audio element.
              </audio>;
            case "video":
              return <video
                src={`/media/${file.filename}`}
                controls
                className="max-h-screen h-auth w-auto object-contain"
              />;
            case "text":
              return <iframe
                src={`/media/${file.filename}`}
                className="h-screen w-screen"/>;
            default:
              return <Link href={`/media/${file.filename}`} target="_blank" className="cursor-pointer">Download
                ({file.mimeType})</Link>;
          }
        })()
      ) : (
        <p className="text-center">File not found</p>
      )}
    </main>
  );
}