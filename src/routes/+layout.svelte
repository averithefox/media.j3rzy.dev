<script>
  import { MetaTags } from "svelte-meta-tags";
  import "../app.css";
</script>

<MetaTags
  title="Files :3"
  titleTemplate="%s | media.j3rzy.dev"
  description="CDN or something, idk"
  canonical="https://media.j3rzy.dev"
  openGraph={{
    type: 'website',
    url: 'https://media.j3rzy.dev',
    title: 'Meow :3',
    description: 'CDN or something, idk',
    siteName: 'Hai :3',
    images: [
      {
        url: 'https://media.j3rzy.dev/og-image.jpg',
        width: 1600,
        height: 1372,
        alt: 'Og Image Alt',
      },
    ],
  }}
  twitter={{
    handle: '@averithefox',
    site: '@averithefox',
    cardType: 'summary_large_image',
    title: 'Meow :3',
    description: 'CDN or something, idk',
    image: 'https://media.j3rzy.dev/og-image.jpg',
  }}
/>

<slot/>