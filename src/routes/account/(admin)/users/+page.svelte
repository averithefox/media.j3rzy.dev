<script lang="ts">
  import { page } from "$app/stores";
  import type { User } from "@prisma/client";

  const roles: User["role"][] = [ "ADMIN", "USER" ];

  const changeUserRole = async ( { id, role }: { id: string, role: User["role"] } ) =>
  {
    if ( id === $page.data.session?.user.id ) return alert("You can't change your own role");
    const res = await fetch(`/account/users`, { method: "PATCH", body: JSON.stringify({ id, role }) });
    const { success, error } = await res.json();
    if ( success )
      users = users.map(( user ) => user.id === id ? { ...user, role } : user);
    else alert(error);
  };

  let users: User[] = $page.data.users.filter(( { id }: User ) => id !== $page.data.session?.user.id)
  .sort(( { id: one }: User, { id: two }: User ) => one.localeCompare(two));
</script>

<h3 class="font-bold text-2xl">Users</h3>

<div class="flex flex-col">
  {#each users as user}
    <div class="flex flex-row p-1 justify-between">
      <div class="flex flex-row">
        <p class="font-bold">{user.id}</p>
        <p class="ml-2">{user.email}</p>
      </div>

      <div class="flex flex-row">
        <select
          data-admin="{user.role === 'ADMIN'}"
          class="p-1 rounded-md data-[admin=true]:bg-red-500 data-[admin=false]:bg-blue-500 transition-colors duration-300"
          on:change={() => changeUserRole({ id: user.id, role: user.role })}
          bind:value={user.role}
        >
          {#each roles as role}
            <option value={role}>{role}</option>
          {/each}
        </select>
      </div>
    </div>
  {/each}
</div>