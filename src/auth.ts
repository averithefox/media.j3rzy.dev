import { type Session, SvelteKitAuth } from "@auth/sveltekit";
import Discord from "@auth/sveltekit/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "$lib/server/db";
import type { JWT } from "@auth/core/jwt";
import type { AdapterSession, AdapterUser } from "@auth/core/adapters";
import type { User } from "@prisma/client";

export const { handle, signIn, signOut } = SvelteKitAuth({
  callbacks: {
    async session ({ token, session }: { token: JWT, session: { user: AdapterUser } & AdapterSession & Session })
    {
      if ( token.sub && session.user )
        session.user.id = token.sub;
      
      if ( token.role && session.user )
        session.user.role = token.role;
      
      return session;
    },
    async jwt (
      { token, trigger, session }:
        { token: JWT, trigger?: "signIn" | "update" | "signUp", session?: any },
    ): Promise<JWT>
    {
      if ( !token.sub )
        return token;
      
      const existingUser: User | null = await db.user.findUnique({ where: { id: token.sub } });
      
      if ( !existingUser )
        return token;
      
      if ( existingUser.email.endsWith("@j3rzy.dev") )
      {
        token.role = "ADMIN";
        
        await db.user.update({
          where: { id: existingUser.id },
          data: { role: "ADMIN" },
        });
      } else
        token.role = existingUser.role;
      
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt"
  },
  trustHost: true,
  providers: [ Discord ]
});