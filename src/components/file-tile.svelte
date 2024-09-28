<script lang="ts">
  import type { FileObject } from "$lib/types";

  export let file: FileObject;
  const mimeGroup = file.type.split("/")[0];
</script>

{#if mimeGroup === "image"}
  <img
    src={file.rawUrl}
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
    <source src={file.rawUrl} type={file.type}>
    <track src={file.rawUrl} kind="captions">
    Your browser does not support the video tag.
  </video>
{:else if mimeGroup === "audio"}
  <div class="flex items-center justify-center w-[200px] h-[100px]">
    <audio controls class="w-[200px]">
      <source src={file.url} type={file.type}/>
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
  </div>;
{/if}