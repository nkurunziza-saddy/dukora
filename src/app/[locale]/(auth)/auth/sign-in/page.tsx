import type { Metadata } from "next";
import SignIn from "@/components/auth/sign-in";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "signIn",
  });
}

const page = () => {
  return <SignIn />;
};

export default page;
