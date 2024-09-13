"use client";

import { signIn } from "next-auth/react";
import { FaDiscord } from "react-icons/fa6";

export default function Page()
{
  return (
    <main className="flex flex-row gap-2 items-center justify-center w-full h-full">
      <button className="p-2 border-[1px] border-black dark:border-gray-500 rounded-md"
              onClick={async () => await signIn("discord", { callbackUrl: "/" })}>
        <FaDiscord className="w-6 h-6"/>
      </button>
    </main>
  );
}