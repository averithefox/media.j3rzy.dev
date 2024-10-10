<script lang="ts">
  import { MetaTags } from "svelte-meta-tags";
  import { page } from "$app/stores";

  import Popup from "$components/popup.svelte";

  import "../app.css";
</script>

<Popup />

{#if $page.url.pathname.split("/").filter(Boolean).length !== 1}
  <MetaTags
    title="Files"
    titleTemplate="%s :3"
    description="CDN or something, idk"
    canonical={$page.url.origin}
    openGraph={{
      type: 'website',
      url: $page.url.origin,
      title: 'Meow :3',
      description: 'CDN or something, idk',
      siteName: 'Hai :3',
      images: [
        {
          url: new URL('og-image.jpg', $page.url.origin).href,
          width: 1600,
          height: 1372,
          alt: 'Og Image Alt'
        }
      ]
    }}
    twitter={{
      handle: '@averithefox',
      site: '@averithefox',
      cardType: 'summary_large_image',
      title: 'Meow :3',
      description: 'CDN or something, idk',
      image: new URL('og-image.jpg', $page.url.origin).href
    }}
  />
{/if}

<slot />