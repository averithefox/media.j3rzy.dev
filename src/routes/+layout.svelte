<script lang="ts">
  import { MetaTags } from "svelte-meta-tags";
  import { page } from "$app/stores";

  import "../app.css";

  let { origin } = $page.data;
</script>

{#if $page.url.pathname.split("/").filter(Boolean).length !== 1}
  <MetaTags
    title="Files"
    titleTemplate="%s :3"
    description="CDN or something, idk"
    canonical={origin}
    openGraph={{
      type: 'website',
      url: origin,
      title: 'Meow :3',
      description: 'CDN or something, idk',
      siteName: 'Hai :3',
      images: [
        {
          url: new URL('og-image.jpg', origin).href,
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
      image: new URL('og-image.jpg', origin).href
    }}
  />
{/if}

<slot/>