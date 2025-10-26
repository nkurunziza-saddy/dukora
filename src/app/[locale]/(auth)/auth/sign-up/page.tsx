import type { Metadata } from "next";
import SignUp from "@/components/auth/sign-up";
import { constructMetadata } from "@/lib/config/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Sign Up",
});

const page = () => {
  return <SignUp />;
};

export default page;
