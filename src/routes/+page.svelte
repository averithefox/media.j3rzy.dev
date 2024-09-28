<script>
  /** @typedef {{ name: string, type: string, rawUrl: string, url: string }} FileObject */
  import { cn } from "$lib";

  /** @type {{ success: boolean, data: Array<FileObject>, session: import("@auth/sveltekit").Session }} */
  export let data;
</script>

<img src="/icons/link.svg" alt="Open in new tab" width="1em" height="1em" class="text-white" />

{#if data.data}
  <main
    class="w-full grid gap-3 p-3 justify-items-start items-center justify-center"
    style="grid-template-columns: repeat(auto-fit, minmax(200px, max-content));"
  >
    {#each data.data as file}
      <div
        class="relative overflow-hidden group rounded-md max-w-[200px] max-h-[200px] hover:overflow-visible hover:z-30">
        <div class={cn(
          "opacity-0 group-hover:opacity-75 transition-all duration-300",
          "transform left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2",
          "absolute grid grid-cols-2 flex-row justify-center",
          "bg-black/50 rounded-md p-1 gap-1",
        )}>
          <a
            href={file.rawUrl}
            target="_blank"
            class="cursor-pointer p-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md"
            title="Open in new tab"
          >
            <img src="/icons/link.svg" alt="Open in new tab" width="1em" height="1em" class="text-white" />
          </a>
        </div>
      </div>
    {/each}
  </main>
{:else}
  <main class="w-full h-full flex items-center justify-center">
    <h1>No files found</h1>
  </main>
{/if}