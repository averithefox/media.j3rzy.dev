<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  import FileIcon from "$components/icons/file.svelte";

  const upload = async (fileList: FileList | null) =>
  {
    draggingOver = false;

    if ( !canUpload || !fileList?.length ) return;

    const files = Array.from<File>(fileList);
    const formData = new FormData();

    files.forEach(file => formData.append("file", file));

    const res = await fetch("/files", { method: "POST", body: formData });
    const json = await res.json();

    if ( json.success )
    {
      dispatch("upload", json.data);
      alert(`Successfully uploaded ${json.data.length || "no"} files :3`);
    } else
      alert(json.error);
  };

  let draggingOver: boolean = false;
  let controller: AbortController;
  const dispatch = createEventDispatcher();

  onMount(() =>
  {
    controller = new AbortController();

    document.addEventListener("dragover", (event) =>
    {
      event.preventDefault();
      draggingOver = true;
    }, { signal: controller.signal });
    document.addEventListener("dragleave", () => draggingOver = false, { signal: controller.signal });
    document.addEventListener("drop", (event) =>
    {
      event.preventDefault();
      upload(event.dataTransfer?.files ?? null);
    }, { signal: controller.signal });

    return () => controller.abort();
  });

  export let canUpload: boolean = false;
</script>

<div
  data-over={draggingOver}
  class="w-full h-full fixed flex items-center justify-center overflow-hidden transition-all duration-500 data-[over=true]:bg-black data-[over=true]:bg-opacity-75 data-[over=true]:backdrop-blur-sm data-[over=false]:pointer-events-none"
  style="z-index: 99"
>
  {#if draggingOver}
    <h1
      data-can={canUpload}
      class="text-2xl m-0 text-center data-[can=true]:text-white data-[can=false]:text-red-600"
    >
      {canUpload ? "Drop files anywhere to upload" : "Sorry, but you doesn't seem to have permissions to upload files"}
    </h1>
  {/if}
  {#if canUpload}
    <input
      type="file"
      multiple
      accept="*/*"
      class="hidden"
      id="file"
      on:change|preventDefault={(event) => upload(event.currentTarget?.files ?? null)}
    >
    <label
      for="file"
      class="fixed bottom-5 right-5 bg-[#1c1e26] shadow-md rounded-full cursor-pointer w-10 h-10 flex items-center justify-center pointer-events-auto group"
    >
      <FileIcon class="transition-all duration-200 text-white group-hover:rotate-12" />
    </label>
  {/if}
</div>