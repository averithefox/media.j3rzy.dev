"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface DragNDropOverlayProps
{
  setFiles?: React.Dispatch<React.SetStateAction<{
    name: string;
    type: string;
  }[]>>;
}

export default function DragNDropOverlay( { setFiles }: DragNDropOverlayProps )
{
  const session = useSession();
  const canUpload: boolean = session.data?.user?.role === "ADMIN";
  
  const [ draggingOver, setDraggingOver ] = React.useState<boolean>(false);
  
  React.useEffect(() =>
  {
    const handleDragOver = ( event: DragEvent ) =>
    {
      event.preventDefault();
      if ( event.dataTransfer?.items.length )
        setDraggingOver(true);
    };
    const handleDragLeave = ( event: DragEvent ) => setDraggingOver(false);
    const handleDrop = async ( event: DragEvent ) =>
    {
      event.preventDefault();
      setDraggingOver(false);
      
      if ( !canUpload ) return;
      if ( !event.dataTransfer?.files.length ) return;
      
      const files: File[] = Array.from<File>(event.dataTransfer.files);
      const formData = new FormData();
      for ( let file of files ) formData.append("file", file);
      const res = await fetch("/files", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if ( json.error )
        alert(json.error);
      else if ( json.success )
      {
        alert(`Successfully uploaded ${json.data.length || "no"} files`);
        if ( setFiles )
          setFiles(( files ) => [ ...files, ...json.data ]);
      }
    };
    
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
    
    return () =>
    {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);
  
  React.useEffect(() =>
  {
    if ( draggingOver )
      document.body.classList.add("overflow-hidden");
    else
      document.body.classList.remove("overflow-hidden");
    
    return () => document.body.classList.remove("overflow-hidden");
  }, [ draggingOver ]);
  
  return (
    <div
      className={cn(
        "w-full h-full fixed flex items-center justify-center overflow-hidden transition-all duration-500",
        draggingOver ? "bg-black bg-opacity-75 backdrop-blur-sm" : "pointer-events-none",
      )}
      style={{ zIndex: 9999 }}
    >
      {draggingOver && (
        <h1 className={cn("text-2xl m-0 text-center", canUpload ? "text-white" : "text-red-600")}>
          {canUpload ? "Drop files anywhere to upload" : "Sorry, but you doesn't seem to have permissions to upload files"}
        </h1>
      )}
    </div>
  );
}