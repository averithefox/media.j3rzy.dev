import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => await event.fetch("/files").then((res) => res.json());