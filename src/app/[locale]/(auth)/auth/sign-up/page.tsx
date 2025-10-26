import type { Metadata } from "next";
import SignUp from "@/components/auth/sign-up";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "signUp",
  });
}

const page = () => {
  return <SignUp />;
};

export default page;
