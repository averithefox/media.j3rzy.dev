// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { DefaultSession } from "@auth/sveltekit";
import type { UserRole } from "@prisma/client";

declare global
{
  namespace App
  {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

// AuthJS stuff
export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
}

declare module "@auth/sveltekit"
{
  interface Session
  {
    user: ExtendedUser;
  }
}

declare module "@auth/core/jwt"
{
  interface JWT
  {
    role?: UserRole;
  }
}