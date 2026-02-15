import { chakra } from "@chakra-ui/react";
import { type ReactNode } from "react";

export default function SizeWrapper({ children }: { children: ReactNode }) {
  return (
    <chakra.section mx={"auto"} maxW={{ base: "90%", lg: "87%" }}>
      {children}
    </chakra.section>
  );
}
