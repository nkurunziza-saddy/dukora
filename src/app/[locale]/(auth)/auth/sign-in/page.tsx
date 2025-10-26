import type { Metadata } from "next";
import SignIn from "@/components/auth/sign-in";
import { constructMetadata } from "@/lib/config/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Sign In",
});

const page = () => {
  return <SignIn />;
};

export default page;
