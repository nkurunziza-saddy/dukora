import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import SignUp from "@/components/auth/sign-up";

export const metadata: Metadata = constructMetadata({
  title: "Sign Up",
});

const page = () => {
  return <SignUp />;
};

export default page;