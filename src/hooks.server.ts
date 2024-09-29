import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { handle as authHandle } from "./auth";
import { sequence } from "@sveltejs/kit/hooks";

const handleProtocol: Handle = async ({ event, resolve }) =>
{
  if ( !building )
  {
    const protocol = event.request.headers.get("x-forwarded-proto") || "http";
    const host = event.request.headers.get("host") || "localhost";
    event.url.protocol = `${protocol}:`;
    event.url.host = host.split(":")[0];
  }
  
  return resolve(event);
};

export const handle: Handle = sequence(handleProtocol, authHandle);