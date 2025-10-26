import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import SignIn from "@/components/auth/sign-in";

export const metadata: Metadata = constructMetadata({
  title: "Sign In",
});

const page = () => {
  return <SignIn />;
};

export default page;
