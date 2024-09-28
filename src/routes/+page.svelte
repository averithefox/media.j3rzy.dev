<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import type { FileObject } from "$lib/types";

  import Link from "$components/icons/link.svelte";
  import TrashBin from "$components/icons/trash-bin.svelte";
  import Copy from "$components/icons/copy.svelte";
  import FileTile from "$components/file-tile.svelte";
  import DropOverlay from "$components/drop-overlay.svelte";

  const deleteFile = async (file: FileObject) =>
  {
    if ( !confirm(`Are you sure you want to delete ${file.name}?`) ) return;
    const res = await fetch("/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ filename: file.name }),
    });
    const json = await res.json();
    if ( json.success ) files = files.filter(f => f.name !== file.name);
    else alert(json.error);
  };

  export let data: { success: boolean, data?: Array<FileObject>, session: Session };
  let { data: files = [], session } = data;
</script>

<DropOverlay
  canUpload={session.user.role === "ADMIN"}
  on:upload={e => files = [...files, ...e.detail]}
/>

{#if files}
  <main
    class="w-full grid gap-3 p-3 justify-items-start items-center justify-center"
    style="grid-template-columns: repeat(auto-fit, minmax(200px, max-content));"
  >
    {#each files as file (file.name)}
      <div
        class="relative overflow-hidden group rounded-md max-w-[200px] max-h-[200px] hover:overflow-visible hover:z-30"
      >
        <!-- "Toolbox" -->
        <div class="opacity-0 group-hover:opacity-75 transition-all duration-300 transform left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2 bg-black/50 rounded-md p-1 gap-1 absolute grid grid-cols-2 flex-row justify-center">
          <a
            href={file.rawUrl}
            target="_blank"
            class="cursor-pointer p-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md"
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <Link class="text-white"/>
          </a>
          <div class="flex-grow"/>
          {#if session.user.role === "ADMIN"}
            <button
              class="p1 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-md flex items-center justify-center"
              on:click={async () => await deleteFile(file)}
              title="Delete"
              aria-label="Delete"
            >
              <TrashBin class="text-white"/>
            </button>
          {:else}
            <div class="flex-grow"/>
          {/if}
          <button
            class="p-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-md"
            on:click={async () => await navigator.clipboard.writeText(file.url)}
            title="Copy URL"
            aria-label="Copy URL"
          >
            <Copy class="text-white"/>
          </button>
        </div>
        <!-- "Toolbox" -->
        <FileTile {file}/>
      </div>
    {/each}
  </main>
{:else}
  <main class="w-full h-full flex items-center justify-center">
    <h1>No files found</h1>
  </main>
{/if}