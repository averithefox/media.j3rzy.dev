"use client";

import DragNDropOverlay from "@/components/DragNDropOverlay";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { IoTrashBin } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { BiCopy } from "react-icons/bi";

interface File
{
  name: string;
  type: string;
  rawUrl: string;
  url: string;
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
  const session = useSession();
  
  const [ files, setFiles ] = React.useState<File[]>([]);
  const [ loading, setLoading ] = React.useState<boolean>(false);
  const [ searchQuery, setSearchQuery ] = React.useState<string>("");
  
  React.useEffect(() =>
  {
    setLoading(true);
    fetch("/files").then((res) => res.json()).then(json =>
    {
      if (
        json.success &&
        json.data &&
        Array.isArray(json.data) &&
        json.data.every((file: any) => typeof file.name === "string" && typeof file.type === "string")
      ) setFiles(json.data);
      else
        alert(json.error);
      setLoading(false);
    });
  }, []);
  
  return (
    <>
      <DragNDropOverlay setFiles={setFiles}/>
      <div
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-md rounded-b-none shadow-lg bg-[#2c2c2c] p-1 font-mono z-50">
        <input className="bg-transparent outline-none" onChange={(e) =>
        {
          setSearchQuery((query) => isValidRegex(e.target.value) ? e.target.value : query);
        }}/>
      </div>
      <main
        className={cn("w-full grid gap-3 p-3 justify-items-start items-center justify-center", loading && "h-screen")}
        style={!loading ? {
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, max-content))",
        } : {}}
      >
        {loading && <p>Loading...</p>}
        {files.filter(file => searchQuery ? new RegExp(searchQuery, "img").test(file.name) : true).map((file, i) =>
          (
            <div className="relative overflow-hidden group rounded-md max-w-[200px] max-h-[200px] hover:overflow-visible hover:z-30">
              <div className={cn(
                "opacity-0 group-hover:opacity-75 transition-all duration-300",
                "transform left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2",
                "absolute grid grid-cols-2 flex-row justify-center",
                "bg-black/50 rounded-md p-1 gap-1",
              )}>
                <Link
                  href={file.rawUrl}
                  target="_blank"
                  className="cursor-pointer p-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md"
                  aria-label="Open in new tab"
                >
                  <FaLink className="text-white"/>
                </Link>
                <div className="flex-grow" />
                {session.data?.user.role !== "ADMIN" && <div className="flex-grow"/>}
                {session.data?.user.role === "ADMIN" && (
                  <button
                    className="p-1 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-md"
                    onClick={async () =>
                    {
                      if (confirm(`Are you sure you want to delete ${file.name}?`))
                      {
                        const res = await fetch("/files", {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ filename: file.name }),
                        });
                        const json = await res.json();
                        if ( json.success )
                          setFiles(files => files.filter((f) => f.name !== file.name));
                        else alert(json.error);
                      }
                    }}
                    aria-label="Delete"
                  >
                    <IoTrashBin className="text-white"/>
                  </button>
                )}
                <button
                  className="p-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-md"
                  onClick={async () => await navigator.clipboard.writeText(file.url)}
                  aria-label="Copy"
                >
                  <BiCopy className="text-white"/>
                </button>
              </div>
              {(() =>
              {
                switch ( file.type.split("/")[0] )
                {
                  case "image":
                    return <Image
                      src={`/raw/${file.name}`}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="w-auto h-auto rounded-sm"
                      unoptimized={file.type === "image/gif"}
                    />;
                  case "video":
                    return <video
                      controls
                      width={200}
                      height={200}
                      key={i}
                      className="rounded-sm"
                    >
                      <source src={`/raw/${file.name}`} type={file.type}/>
                      Your browser does not support the video element.
                    </video>;
                  case "audio":
                    return <div className="flex items-center justify-center w-[200px] h-[100px]">
                      <audio controls key={i} className="w-[200px]">
                        <source src={file.url} type={file.type}/>
                        Your browser does not support the audio element.
                      </audio>
                    </div>;
                  default:
                    return <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <Link
                        href={`/raw/${file.name}`}
                        target="_blank"
                        className="cursor-pointer"
                        key={i}
                      >
                        <p className="text-center text-blue-600 underline">{file.name} ({file.type})</p>
                      </Link>
                    </div>;
                }
              })()}
            </div>
          ))}
      </main>
    </>
  );
}