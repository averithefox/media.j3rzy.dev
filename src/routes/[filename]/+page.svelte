<script lang="ts">
  import type { File } from "@prisma/client";

  export let data: { file: File | null };
  let { file } = data;
  let mimeGroup = file?.mimeType.split("/")[0];
</script>

<main class="w-full h-full flex items-center justify-center">
  {#if file}
    {#if mimeGroup === "image"}
      <img
        src="/raw/{file.filename}"
        alt="{file.filename}"
        class="max-h-screen h-auto w-auto object-contain"
      >
    {:else if mimeGroup === "video"}
      <video
        controls
        class="max-h-screen h-auth w-auto object-contain"
      >
        <source src="/raw/{file.filename}" type="{file.mimeType}">
        <track src="/raw/{file.filename}" kind="captions">
        Your browser does not support the video tag.
      </video>
    {:else if mimeGroup === "audio"}
      <audio controls>
        <source src="/raw/{file.filename}" type="{file.mimeType}">
        Your browser does not support the audio tag.
      </audio>
    {:else if mimeGroup === "text"}
      <iframe
        src="/raw/{file.filename}"
        class="w-full h-full"
        title="{file.filename}"
      />
    {:else}
      <a
        href="/raw/{file.filename}"
        target="_blank"
        class="cursor-pointer"
      >Download ({file.mimeType})</a>
    {/if}
  {:else}
    <p class="text-center">File not found</p>
  {/if}
</main>