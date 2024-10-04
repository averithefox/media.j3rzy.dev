<script lang="ts">
  let imageFailed = false;

  export let src: string | null | undefined;
  export let name: string | null | undefined;
</script>

<!-- For constant size -->
<div class="w-12 h-12 rounded-full">
  {#if imageFailed || !src}
    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center" {...$$restProps}>
      <span class="text-gray-500">{name ? name[0].toUpperCase() : "?"}</span>
    </div>
  {:else}
    <img
      {src}
      alt="{name}'s avatar"
      on:error={() => imageFailed = true}
      class="w-12 h-12 rounded-full"
      loading="lazy"
      {...$$restProps}
    />
  {/if}
</div>