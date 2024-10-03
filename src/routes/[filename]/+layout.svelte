<script lang="ts">
  import { MetaTags } from "svelte-meta-tags";
  import { page } from "$app/stores";

  let { file } = $page.data;
  let rawUrl = new URL(`/raw/${file?.filename}`, $page.url.origin).href;
</script>

{#if file}
  <MetaTags
    title="{file.filename} :3"
    openGraph={{
      type: 'website',
      title: `${file.filename} :3`,
      siteName: '*Happy Fox noises*',
      description: `Here you have the hash of the file, if you want it :3 : ${file.hash}`,
      url: rawUrl,
      images: /^image\//.test(file.mimeType) ? [ { url: rawUrl } ] : undefined,
      audio: /^audio\//.test(file.mimeType) ? [ { url: rawUrl } ] : undefined,
      videos: /^video\//.test(file.mimeType) ? [ { url: rawUrl } ] : undefined,
    }}
  />
{:else}
  <MetaTags
    title="Hai, the file you're looking for doesn't seem to exist. :3"
    openGraph={{
      type: 'website',
      title: 'Hai, the file you\'re looking for doesn\'t seem to exist. :3',
      description: 'Yeah, it doesn\'t exist. :3',
    }}
  />
{/if}

<slot/>