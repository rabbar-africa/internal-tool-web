"use client";
import { Link, type LinkProps, type ImageProps, Image } from "@chakra-ui/react";
import { Link as ReactLink } from "react-router-dom";
import blackLogo from "@/assets/images/logo/dark-logo.png";
import whiteLogo from "@/assets/images/logo/white-logo.png";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { ReactNode } from "react";

type LogoProps = ImageProps & {
  to?: string;
  text?: ReactNode;
  linkProps?: LinkProps;
  color?: "white" | "black";
};

export const Logo = (props: LogoProps) => {
  const { linkProps, to } = props;
  // const { userOrganization } = useCurrentUser();

  const fallbackLogo = props.color === "white" ? whiteLogo : blackLogo;

  function PlainLogo() {
    return (
      <Image
        src={fallbackLogo}
        aria-label={`logo`}
        alt="logo"
        w={"8rem"}
        {...props}
      />
    );
  }

  function LinkLogo() {
    return (
      <Link as={ReactLink} href={to} {...linkProps}>
        <PlainLogo />
      </Link>
    );
  }

  if (to) {
    return <LinkLogo />;
  } else {
    return <PlainLogo />;
  }
};
