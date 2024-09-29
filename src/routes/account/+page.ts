import type { PageLoad } from "./$types";
import type { ApiKey } from "$lib/types";

export const load: PageLoad = async (event) =>
{
  const { session } = await event.parent();
  
  let keys: ApiKey[] = [];
  
  if ( session?.user.role === "ADMIN" )
  {
    const req = await event.fetch("/api");
    const { success, data } = await req.json();
    if ( success ) keys = data;
  }
  
  return { keys };
};