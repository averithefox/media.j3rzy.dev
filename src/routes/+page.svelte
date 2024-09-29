<script lang="ts">
  import type { Session } from "@auth/sveltekit";
  import type { FileObject } from "$lib/types";

  import DropOverlay from "$components/drop-overlay.svelte";
  import FileTile from "$components/file-tile.svelte";

  const deleteFile = async (filename: string) =>
  {
    if ( !confirm(`Are you sure you want to delete ${filename}?`) ) return;
    const res = await fetch("/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ filename }),
    });
    const json = await res.json();
    if ( json.success ) files = files.filter(f => f.name !== filename);
    else alert(json.error);
  };

  export let data: { files: { success: boolean, data?: Array<FileObject>, error?: string } };
  let { files: { success, error, data: files = [] } } = data;
</script>

<DropOverlay on:upload={e => files = [...files, ...e.detail]}/>

{#if success}
  {#if files}
    <main
      class="w-full grid gap-3 p-3 justify-items-start items-center justify-center"
      style="grid-template-columns: repeat(auto-fit, minmax(200px, max-content));"
    >
      {#each files as file (file.name)}
        <FileTile {file} on:delete={(e) => deleteFile(e.detail)} />
      {/each}
    </main>
  {:else}
    <main class="w-full h-full flex items-center justify-center">
      <h1>No files found</h1>
    </main>
  {/if}
{:else}
  <main class="w-full h-full flex flex-col items-center justify-center text-red-600">
    <h1>An error occurred!</h1>
    <h2>{error}</h2>
  </main>
{/if}