import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface InvitationEmailProps {
  inviteLink: string;
  invitedByName: string;
  businessName: string;
}

export default function InvitationEmail({
  inviteLink,
  invitedByName,
  businessName,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Join {businessName} on Dukora</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-auto mx-auto p-5 w-[465px]">
            <Text className="text-black text-[24px] font-normal p-0 my-[30px] mx-0">
              Join <strong>{businessName}</strong> on <strong>Dukora</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You&apos;ve been invited by <strong>{invitedByName}</strong> to
              join their business, <strong>{businessName}</strong>, on Dukora.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              To accept the invitation, click the link below:
            </Text>
            <Link
              href={inviteLink}
              className="text-blue-600 text-[14px] leading-[24px]"
            >
              {inviteLink}
            </Link>
            <Text className="text-black text-[14px] leading-[24px]">
              If you did not expect this invitation, you can safely ignore this
              email.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards,
              <br />
              The Dukora Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
