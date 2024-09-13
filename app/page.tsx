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
        {files.map(( file, i ) =>
        {
          switch ( file.type.split("/")[0] )
          {
            case "image":
              return <Link
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
                  className="rounded-md w-auto h-auto"
                  unoptimized={file.type === "image/gif"}
                />
              </Link>;
            case "video":
              return <Link
                href={`/media/${file.name}`}
                target="_blank"
                className="cursor-pointer"
                key={i}
              >
                <video
                  src={`/media/${file.name}`}
                  controls
                  className="rounded-md"
                  width={200}
                  height={200}
                />
              </Link>;
            case "audio":
              return <audio controls key={i} className="w-[200px]">
                <source src={`/media/${file.name}`} type={file.type}/>
                Your browser does not support the audio element.
              </audio>;
            case "text":
              return <Link
                href={`/media/${file.name}`}
                target="_blank"
                className="cursor-pointer"
                key={i}
              >
                <iframe
                  src={`/media/${file.name}`}
                  className="rounded-md"
                  width={200}
                  height={200}
                />
              </Link>;
            default:
              return <Link
                href={`/media/${file.name}`}
                target="_blank"
                className="cursor-pointer"
                key={i}
              >
                <p className="text-center">{file.name} ({file.type})</p>
              </Link>;
          }
        })}
      </main>
    </>
  );
}