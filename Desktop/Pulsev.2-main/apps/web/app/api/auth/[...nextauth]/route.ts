import { authOptions } from "@/lib/auth/options";
import NextAuth from "next-auth";

// Make sure we're properly exporting the handlers
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
