<script lang="ts">
  import type { EndpointResponse, FileObject } from "$lib/types";
  import { page } from "$app/stores";

  import DropOverlay from "$components/drop-overlay.svelte";
  import FileTile from "$components/file-tile.svelte";

  const deleteFile = async ( filename: string ) =>
  {
    if ( !confirm(`Are you sure you want to delete ${filename}?`) ) return;
    const res = await fetch("/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    const json = await res.json();
    if ( json.success ) files = files.filter(f => f.name !== filename);
    else alert(json.error);
  };

  const togglePrivate = async ( filename: string ) =>
  {
    const i = files.findIndex(f => f.name === filename);
    const file = files[i];
    if ( i === -1 ) return alert("File not found!");
    const res = await fetch("/files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, private: !file.private }),
    });
    const json: EndpointResponse<FileObject<true>> = await res.json();
    if ( json.success ) files[i] = json.data;
    else alert(json.error);
  };

  let { success, error, data } = $page.data.files as EndpointResponse<FileObject<true>[]>;
  $: files = (data ?? []).sort((a, b) => a.uploadedAt - b.uploadedAt);
</script>

<DropOverlay on:upload={e => files = [...files, ...e.detail]}/>

{#if success}
  {#if files}
    <main
      class="w-full flex flex-wrap justify-evenly gap-2 p-2"
    >
      {#each files as file (file.name)}
        <FileTile
          {file}
          on:delete={(e) => deleteFile(e.detail)}
          on:private={(e) => togglePrivate(e.detail)}
        />
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