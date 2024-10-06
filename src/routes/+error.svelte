<script lang="ts">
  import { page } from "$app/stores";
</script>

<main class="w-full h-full flex items-center justify-center flex-col">
  <h1 style="font-size: 8rem; line-height: 7rem;" class="font-bold">{$page.status}</h1>
  <h2 class="text-2xl">{$page.error?.message}</h2>
</main>