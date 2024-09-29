<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { page } from "$app/stores";

  import Link from "$components/icons/link.svelte";
  import Copy from "$components/icons/copy.svelte";
  import TrashBin from "$components/icons/trash-bin.svelte";
  import type { FileObject } from "$lib/types";

  const dispatch = createEventDispatcher();

  export let file: FileObject;
</script>

<div
  class="opacity-0 group-hover:opacity-75 transition-all duration-300 transform left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2 bg-black/50 rounded-md p-1 gap-1 absolute grid grid-cols-2 flex-row justify-center">
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
  {#if $page.data.session?.user.role === "ADMIN"}
    <button
      class="p1 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-md flex items-center justify-center"
      on:click={() => dispatch("delete", file.name)}
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