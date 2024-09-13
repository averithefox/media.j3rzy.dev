"use client";

import DragNDropOverlay from "@/components/DragNDropOverlay";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface File
{
  name: string;
  type: string;
}

export default function Page()
{
  const [ files, setFiles ] = React.useState<File[]>([]);
  
  React.useEffect(() =>
  {
    fetch("/files").then(( res ) => res.json()).then(( json ) =>
    {
      if (
        json.success &&
        json.data &&
        Array.isArray(json.data) &&
        json.data.every(( file: any ) => typeof file.name === "string" && typeof file.type === "string")
      ) setFiles(json.data);
    });
  }, []);
  
  return (
    <>
      <DragNDropOverlay setFiles={setFiles}/>
      <main
        className="w-full grid gap-2 p-2 justify-items-start items-center justify-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, max-content))",
        }}
      >
        {files.map(( file, i ) => (
          <Link
            href={`/${file.name}`}
            target="_blank"
            className="cursor-pointer"
            key={i}
          >
            <Image
              src={`/media/${file.name}`}
              alt={file.name}
              width={200}
              height={200}
              className="rounded-md"
              unoptimized={file.type === "image/gif"}
            />
          </Link>
        ))}
      </main>
    </>
  );
}