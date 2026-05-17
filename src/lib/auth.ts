import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        console.log(
          "✅ User found:",
          user.email,
          "role:",
          user.role?.name,
          "xp:",
          user.xp,
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name,
          banReason: user.banReason ?? undefined,
          roleId: user.roleId,
          xp: user.xp,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.banReason = user.banReason;
        token.roleId = user.roleId;
        token.xp = user.xp;
        console.log("✅ JWT token after user:", {
          role: token.role,
          xp: token.xp,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.banReason = token.banReason as string;
        session.user.roleId = token.roleId as number;
        session.user.xp = token.xp as number;

        console.log("✅ Session after update:", {
          role: session.user.role,
          xp: session.user.xp,
        });
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
