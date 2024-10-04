<script lang="ts">
  import { page } from "$app/stores";

  import Avatar from "$components/avatar.svelte";
  import { signOut } from "@auth/sveltekit/client";

  const session = $page.data.session!;
  const routes = [ "", ...(session.user.role === "ADMIN" ? [ "users" ] : []) ];
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<main class="w-full h-full flex sm:flex-row flex-col p-2 sm:space-x-2 max-sm:space-y-2">
  <div class="sm:h-full flex flex-col p-1 space-y-4">
    <div class="p-1 flex flex-row items-center space-x-2">
      <Avatar src={session.user.image} name={session.user.name}/>
      <div class="flex flex-col justify-center h-full">
        <p
          data-admin="{session.user.role === 'ADMIN'}"
          class="text-2xl font-bold data-[admin=true]:text-red-600"
        >{session.user.name}</p>
        <p class="text-sm">{session.user.email}</p>
      </div>
    </div>
    <div class="sm:flex sm:flex-col sm:space-y-2 sm:h-full max-sm:w-full grid grid-cols-2 max-sm:gap-2">
      {#each routes as route}
        <a
          data-current="{new RegExp(`^\/account\/?${route}$`, 'im').test($page.url.pathname)}"
          class="w-full p-1 px-2 flex items-center h-10 rounded-md hover:bg-[#101010] link data-[current=true]:bg-[#101010]"
          href="/account/{route}"
        >
          {route ? route[0].toUpperCase() + route.slice(1) : "Home"}
        </a>
      {/each}
      <div class="flex-grow"/>
      <button class="w-full p-2 bg-red-600 text-white rounded-md" on:click={() => signOut({ callbackUrl: "/login" })}>
        Logout
      </button>
    </div>
  </div>
  <div class="w-full h-full rounded-lg overflow-scroll">
    <slot/>
  </div>
</main>

<style>
  .link:hover
  {
    box-shadow: #151515 2px 3px 5px 0;
  }
</style>