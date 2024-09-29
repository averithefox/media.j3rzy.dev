<script lang="ts">
  import MediaTile from "$components/media-tile.svelte";
  import FileControls from "$components/file-controls.svelte";
  import type { FileObject } from "$lib/types";

  export let file: FileObject;
</script>

<div
  class="relative overflow-hidden group rounded-md max-w-[200px] max-h-[200px] hover:overflow-visible hover:z-30"
>
  <FileControls {file} on:delete/>
  <MediaTile {file}/>
</div>