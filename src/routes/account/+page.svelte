<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import { signOut } from "@auth/sveltekit/client";
  import type { ApiKey } from "$lib/types";

  import FileArchive from "$components/icons/file-archive.svelte";

  const requestAnApiKey = async () =>
  {
    const res = await fetch("/api", { method: "POST" });
    const { success, error, data } = await res.json();
    if ( success ) keys = [ ...keys, data ];
    else alert(error);
  };

  const deleteAnApiKey = async (keyValue: string) =>
  {
    const res = await fetch("/api", { method: "DELETE", body: JSON.stringify({ key: keyValue }) });
    const { success, error } = await res.json();
    if ( success )
    {
      keys = keys.filter((key) => key.key !== keyValue);
    } else alert(error);
  };

  export let data: { session: Session, keys: ApiKey[] };
  let { keys = [], session } = data;
</script>

<main class="flex p-2 w-full h-full items-center justify-center">
  <div class="rounded-lg bg-[#2c2c2c] p-2 shadow-md flex flex-col">
    <p>Logged in as
      <span
        data-admin={session.user.role === "ADMIN"}
        class="font-mono text-md bg-[#313131] rounded-md data-[admin=true]:text-red-400"
      >
        {session.user.email}
      </span>
    </p>
    <button
      class="text-red-600 underline inline-block"
      on:click={async () => await signOut({ callbackUrl: "/login" })}
    >
      Log Out
    </button>
    {#if session.user.role === "ADMIN"}
      <div class="flex flex-col space-y-2">
        <div class="bg-[#313131] p-2 mt-2 flex flex-col font-mono text-xs whitespace-pre min-w-[350px]">
          <div class="w-full flex flex-row items-center">
            <p>API Keys</p>
            <div class="flex-grow"/>
            <button on:click={requestAnApiKey} title="Create new API key">+</button>
          </div>
          {"-".repeat(44)}
          {#each keys as { key, expiresAt } (key)}
            <div class="flex flex-row items-center space-x-1">
              <button
                title="Click to copy"
                on:click={async () => navigator.clipboard.writeText(key)}
              >{key}</button>
              <div class="flex-grow"/>
              <p>{expiresAt?.toDateString() ?? "never"}</p>
              <button on:click={async () => await deleteAnApiKey(key)} title="Revoke">-</button>
            </div>
          {/each}
        </div>
        <div class="bg-[#313131] p-2 mt-2 flex flex-row font-mono text-xs whitespace-pre min-w-[350px]">
          <a href="/files?archive" title="Download archive">
            <FileArchive class="w-5 h-5"/>
          </a>
        </div>
      </div>
    {/if}
  </div>
</main>