<script lang="ts">
  import { page } from "$app/stores";
  import type { ApiKey } from "$lib/types";

  const deleteAnApiKey = async ( keyValue: string ) =>
  {
    const res = await fetch("/api", { method: "DELETE", body: JSON.stringify({ key: keyValue }) });
    const { success, error } = await res.json();
    if ( success )
    {
      keys = keys.filter(( key ) => key.key !== keyValue);
    } else alert(error);
  };

  const requestAnApiKey = async () =>
  {
    const res = await fetch("/api", { method: "POST" });
    const { success, error, data } = await res.json();
    if ( success ) keys = [ ...keys, data ];
    else alert(error);
  };

  let { success, data: keys, error }: { success: boolean, data: ApiKey[], error: string } = $page.data.keys;
</script>

<h3 class="font-bold text-2xl">API Keys</h3>
{#if success}
  <table>
    <thead>
    <tr>
      <th class="px-4 py-2 text-start">Key</th>
      <th class="px-4 py-2 text-start">Expires</th>
      <th class="px-4 py-2 text-start">Actions</th>
    </tr>
    </thead>
    <tbody>
    {#each keys as {key, expiresAt}}
      <tr>
        <td
          class="px-4 py-2 cursor-pointer"
          on:click={() => navigator.clipboard.writeText(key)}
          title="Click to copy"
        >{key}</td>
        <td class="px-4 py-2">{expiresAt?.toDateString() ?? "never"}</td>
        <td class="px-4 py-2">
          <button
            class="p-1 bg-red-600 w-6 h-6 flex items-center justify-center rounded-md"
            title="revoke"
            on:click={() => deleteAnApiKey(key)}
          >
            -
          </button>
        </td>
      </tr>
    {/each}
    </tbody>
  </table>
  <button
    class="p-1 bg-green-600 flex items-center justify-center rounded-md"
    title="Create new API key"
    on:click={requestAnApiKey}
  >
    Create new
  </button>
{:else}
  <p class="text-red-500">Unable to fetch API keys. Try again later</p>
  <p class="text-red-500">{error}</p>
{/if}