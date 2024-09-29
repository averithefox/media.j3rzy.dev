<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";

  import Discord from "$components/icons/discord.svelte";
</script>

<main class="w-full h-full flex items-center justify-center">
  <button
    class="p-2 border-[1px] border-black dark:border-gray-500 rounded-md inline-block"
    on:click={async () => await signIn("discord", { callbackUrl: decodeURIComponent(new URL(location.href).searchParams.get("redirect") ?? "/account") })}
  >
    <Discord class="w-6 h-6"/>
  </button>
</main>