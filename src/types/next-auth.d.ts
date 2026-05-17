import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    banReason?: string;
    roleId?: number;
    xp?: number;
  }
  interface Session {
    user: {
      email: string;
      name: string;
      role?: string;
      banReason?: string;
      roleId?: number;
      xp?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    banReason?: string;
    roleId?: number;
    xp?: number;
  }
}
