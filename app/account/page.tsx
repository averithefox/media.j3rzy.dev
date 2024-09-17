"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { FaDiscord } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import React from "react";
import { IoTrashBin } from "react-icons/io5";

interface ApiKey
{
  key: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export default function Page ()
{
  const session = useSession();
  
  const deleteInput = React.useRef<HTMLInputElement>(null!);
  
  const [ keys, setKeys ] = React.useState<ApiKey[]>([]);
  
  React.useEffect(() =>
  {
    if ( session.data?.user?.role === "ADMIN" )
      fetch("/api", { method: "GET" })
      .then(async res =>
      {
        const json = await res.json();
        if ( json.success )
          setKeys(json.data);
        else alert(json.error);
      });
  }, []);
  
  return (
    <main className="flex p-2 w-full h-full items-center justify-center">
      {session.data?.user ? (
        <div className="rounded-lg bg-[#2c2c2c] p-2 shadow-md flex flex-col">
          <p>Logged in as <span
            className={cn("font-mono text-md bg-[#313131] rounded-md", session.data.user.role === "ADMIN" && "text-red-400")}>
            {session.data.user.email}
          </span></p>
          <button
            className="text-red-600 underline inline-block"
            onClick={async () => await signOut({ redirectTo: "/account" })}
          >Log Out
          </button>
          {session.data.user.role === "ADMIN" && (
            <div className="flex flex-col space-y-2">
              <div className="bg-[#313131] p-2 mt-2 flex flex-col font-mono text-xs whitespace-pre min-w-[350px]">
                <div className="w-full flex flex-row items-center">
                  <p>API Keys</p>
                  <div className="flex-grow"/>
                  <button onClick={async () =>
                  {
                    const res = await fetch("/api", { method: "POST" });
                    const json = await res.json();
                    if ( json.success )
                      setKeys([ ...keys, json.data ]);
                    else alert(json.error);
                  }}>
                    +
                  </button>
                </div>
                {"\n"}
                {JSON.stringify(keys, null, 2)}
              </div>
              <div
                className="bg-[#313131] p-2 mt-2 flex space-x-2 flex-row items-center font-mono text-xs whitespace-pre min-w-[350px]">
                <input
                  className="bg-transparent outline-none w-full"
                  ref={deleteInput}
                />
                <button
                  onClick={async () =>
                  {
                    const key = deleteInput.current.value;
                    const res = await fetch("/api", { method: "DELETE", body: JSON.stringify({ key }) });
                    const json = await res.json();
                    if ( json.success )
                    {
                      setKeys(keys.filter(k => k.key !== key));
                      deleteInput.current.value = "";
                    } else alert(json.error);
                  }}
                ><IoTrashBin/></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button className="p-2 border-[1px] border-black dark:border-gray-500 rounded-md inline-block"
                onClick={async () => await signIn("discord", { redirectTo: "/" })}>
          <FaDiscord className="w-6 h-6"/>
        </button>
      )}
    </main>
  );
}