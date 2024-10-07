<script lang="ts">
  import type { FileObject } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import { page } from "$app/stores";

  import Link from "$components/icons/link.svelte";
  import Copy from "$components/icons/copy.svelte";
  import TrashBin from "$components/icons/trash-bin.svelte";
  import EyeSlash from "$components/icons/eye-slash.svelte";
  import Eye from "$components/icons/eye.svelte";

  const dispatch = createEventDispatcher();

  export let file: FileObject<true>;
  $: mimeGroup = file?.type.split("/")[0];
</script>

<div
  class="relative overflow-hidden group rounded-md max-w-[200px] max-h-[200px] hover:overflow-visible hover:z-30"
>
  {#if "private" in file}
    <button
      data-private="{file.private}"
      class="absolute right-2 top-1 transition-all duration-200 data-[private=true]:text-red-600 data-[private=false]:text-green-600 data-[private=false]:opacity-0 data-[private=false]:group-hover:opacity-100"
      title="{file.private ? 'Private' : 'Public'}"
      on:click={() => dispatch("private", file.name)}
    >
      {#if file.private}
        <EyeSlash/>
      {:else}
        <Eye/>
      {/if}
    </button>
  {/if}
  <div
    class="opacity-0 group-hover:opacity-75 transition-all duration-300 transform left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2 bg-black/50 rounded-md p-1 gap-1 absolute grid grid-cols-2 flex-row justify-center"
    style="z-index: 69;"
  >
    <a
      href="/raw/{file.name}"
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
      on:click={async () => await navigator.clipboard.writeText(new URL(encodeURI(file.name), $page.url.origin).href)}
      title="Copy URL"
      aria-label="Copy URL"
    >
      <Copy class="text-white"/>
    </button>
  </div>
  {#if file && mimeGroup}
    {#if mimeGroup === "image"}
      <img
        src={file.type.split("/")[1] === "gif" ? `/raw/${file.name}` : new URL(`image/${encodeURI(file.name)}?w=200`, $page.url.origin).pathname}
        alt={file.name}
        width="200"
        height="200"
        class="w-auto h-auto rounded-sm"
        loading="lazy"
        decoding="async"
      >
    {:else if mimeGroup === "video"}
      <video
        controls
        width="200"
        height="200"
        class="w-auto h-auto rounded-sm"
      >
        <source src="/raw/{file.name}" type={file.type}>
        <track src="/raw/{file.name}" kind="captions">
        Your browser does not support the video tag.
      </video>
    {:else if mimeGroup === "audio"}
      <div class="flex items-center justify-center w-[200px] h-[100px]">
        <audio controls class="w-[200px]">
          <source src="/raw/{file.name}" type={file.type}/>
          Your browser does not support the audio element.
        </audio>
      </div>
    {:else}
      <div class="w-[200px] h-[200px] flex items-center justify-center">
        <a
          href={`/raw/${file.name}`}
          target="_blank"
          class="cursor-pointer text-center text-blue-600 underline"
        >
          {file.name} ({file.type})
        </a>
      </div>
    {/if}
  {:else}
    <div class="w-[200px] h-[200px] flex items-center justify-center">
      <p class="text-center">Loading...</p>
    </div>
  {/if}
</div>