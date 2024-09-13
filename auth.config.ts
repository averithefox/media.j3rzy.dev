import { NextAuthConfig } from "next-auth";
import Discord from "@auth/core/providers/discord";

export default {
  providers: [ Discord ],
} satisfies NextAuthConfig;