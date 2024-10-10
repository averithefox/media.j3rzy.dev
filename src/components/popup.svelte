<script lang="ts">
  import type { PopUpData } from "$lib/types";
  import { popupStore } from "../store";
  import Timer from "$lib/Timer";

  let active = false;
  let data: PopUpData | null = null;
  let closeTimeout: ReturnType<typeof Timer> | null = null; // As TimerClass isn't exported

  popupStore.subscribe(( value ) =>
  {
    active = !!value;
    setTimeout(() => data = value, value ? 0 : 300);
    if ( value ) closeTimeout = Timer(() => popupStore.set(null), 5000);
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
    <div class="">
      <h1>fdsf</h1>
    </div>
    <span class="h-1 bg-white" id="progress" style="width: {100}%;" />
  </div>
</div>