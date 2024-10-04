<script lang="ts">
  import { page } from "$app/stores";
</script>

<main class="w-full h-full flex flex-row items-center justify-center space-x-4">
  <h1 class="text-6xl font-bold">{$page.status}</h1>
  <div class="h-16 w-[1px] bg-white" />
  <h2 class="text-4xl">{$page.error?.message}</h2>
</main>