<script lang="ts">
  import type { PopUpData } from "$lib/types";
  import { popupStore } from "../store";
  import Timer from "$lib/Timer";
  import { onDestroy, onMount } from "svelte";

  let active = false;
  let data: PopUpData | null = null;
  let closeTimeout: ReturnType<typeof Timer> | null = null; // As TimerClass isn't exported

  $: percentCompleted = 0;
  const updateInterval = setInterval(() => percentCompleted = Math.floor(closeTimeout?.getCompletedPercentage() ?? 0), 50);

  const close = function()
  {
    popupStore.set(null);
    closeTimeout = null;
  };

  popupStore.subscribe(function( value )
  {
    active = !!value;
    setTimeout(() => data = value, value ? 0 : 300);
    if ( value )
    {
      percentCompleted = 0;
      closeTimeout = Timer(close, 5000);
    }
  });

  const controller = new AbortController();

  onMount(() => window.addEventListener("keydown", ( event ) => active && event.key === "Escape" ? close() : null, controller));
  onDestroy(function()
  {
    controller.abort();
    clearInterval(updateInterval);
  });
</script>

<div
  data-active="{active}"
  class="data-[active=false]:scale-0 data-[active=false]:pointer-events-none fixed inset-0 flex items-center justify-center transition-all duration-300 data-[active=true]:z-[9999] data-[active=false]:-z-[9999]"
  id="popup"
>
  <div
    class="rounded-sm flex flex-col w-[350px] h-[200px] bg-[#333333] shadow-md"
    on:mouseenter={() => closeTimeout?.pause()}
    on:mouseleave={() => closeTimeout?.resume()}
    role="dialog"
  >
    <div
      class="p-1 flex items-center justify-between bg-gradient-to-b from-90% from-[#2f2f2f] to-[#333333] overflow-hidden">
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
    <span
      class="h-1 bg-[#84cb94]"
      id="progress"
      style="width: {percentCompleted}%;"
    />
  </div>
</div>