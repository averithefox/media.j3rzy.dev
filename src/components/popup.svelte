<script lang="ts">
  import type { PopUpData } from "$lib/types";
  import { popupStore } from "../store";
  import Timer from "$lib/Timer";
  import { onDestroy, onMount } from "svelte";

  let active = false;
  let data: PopUpData | null = null;
  let closeTimeout: ReturnType<typeof Timer> | null = null; // As TimerClass isn't exported

  $: percentCompleted = 0;
  const updateInterval = setInterval(() => percentCompleted = closeTimeout?.getCompletedPercentage() ?? 0, 50);

  const close = () =>
  {
    popupStore.set(null);
    closeTimeout = null;
    percentCompleted = 0;
  };

  popupStore.subscribe(( value ) =>
  {
    active = !!value;
    setTimeout(() => data = value, value ? 0 : 300);
    if ( value ) closeTimeout = Timer(() => popupStore.set(null), 5000);
  });

  const controller = new AbortController();

  onMount(() => window.addEventListener("keydown", ( event ) =>
  {
    if ( active && event.key === "Escape" ) close();
  }, { signal: controller.signal }));
  onDestroy(() =>
  {
    controller.abort();
    clearInterval(updateInterval);
  });
</script>

<div
  data-active="{active}"
  class="data-[active=false]:opacity-0 data-[active=false]:pointer-events-none fixed inset-0 flex items-center justify-center transition-all duration-300 data-[active=true]:z-[9999] data-[active=false]:-z-[9999]"
  id="popup"
>
  <div
    class="rounded-md flex flex-col w-[350px] h-[200px] bg-red-600"
    on:mouseenter={() => closeTimeout?.pause()}
    on:mouseleave={() => closeTimeout?.resume()}
    role="dialog"
  >
    <div class="p-1 flex items-center justify-between">
      <h1 class="font-bold capitalize">{data?.title}</h1>
      <button on:click={close}>
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    <span class="h-1 bg-white" id="progress" style="width: {percentCompleted}%;" />
  </div>
</div>