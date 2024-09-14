import NextAuth, { Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { JWT } from "@auth/core/jwt";
import { AdapterSession, AdapterUser } from "@auth/core/adapters";
import { User } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    strategy: "jwt",
  },
  ...authConfig,
});