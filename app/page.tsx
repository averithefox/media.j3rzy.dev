"use client";

import DragNDropOverlay from "@/components/DragNDropOverlay";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface File
{
  name: string;
  type: string;
}

function isValidRegex (pattern: string): boolean
{
  try
  {
    new RegExp(pattern);
    return true;
  } catch ( e )
  {
    return false;
  }
}

export default function Page ()
{
  const [ files, setFiles ] = React.useState<File[]>([]);
  const [ loading, setLoading ] = React.useState<boolean>(false);
  const [ searchQuery, setSearchQuery ] = React.useState<string>("");
  const [ validQuery, setValidQuery ] = React.useState<string>("");
  
  React.useEffect(() =>
  {
    setLoading(true);
    fetch("/files").then((res) => res.json()).then((json) =>
    {
      if (
        json.success &&
        json.data &&
        Array.isArray(json.data) &&
        json.data.every((file: any) => typeof file.name === "string" && typeof file.type === "string")
      ) setFiles(json.data);
      setLoading(false);
    });
  }, []);
  
  return (
    <>
      <DragNDropOverlay setFiles={setFiles}/>
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-md rounded-b-none shadow-lg bg-[#2c2c2c] p-1 font-mono">
        <input className="bg-transparent outline-none" onChange={(e) =>
        {
          setSearchQuery(e.target.value);
          setValidQuery((query) => isValidRegex(e.target.value) ? e.target.value : query);
        }}/>
      </div>
      <main
        className={cn("w-full grid gap-5 p-5 justify-items-start items-center justify-center", loading && "h-screen")}
        style={!loading ? {
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, max-content))",
        } : {}}
      >
        {loading && <p>Loading...</p>}
        {files.filter(file => validQuery ? new RegExp(validQuery, "img").test(file.name) : true).map((file, i) =>
          (
            <div>
              {(() =>
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
              })()}
            </div>
          ))}
      </main>
    </>
  );
}