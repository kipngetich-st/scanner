import { createAuthClient } from "better-auth/react"

export const authClient =  createAuthClient({});

export const socialSignIn = async (provider: string) => {
  const data = await authClient.signIn.social({
    provider: provider,
    callbackURL: "/dashboard"
  });

  return data
};