import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => ({
  files: await event.fetch("/files").then((res) => res.json()),
});