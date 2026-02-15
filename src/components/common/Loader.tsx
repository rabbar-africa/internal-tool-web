import * as React from "react";
import { Center, Heading, Spinner, type SpinnerProps } from "@chakra-ui/react";

export const Loader: React.FC<{
  full?: boolean;
  spinnerProps?: SpinnerProps | undefined;
}> = ({ full = false, spinnerProps }) => {
  return (
    <Center h={full ? "full" : "100%"} w={full ? "full" : "100%"}>
      <Heading>
        <Spinner size="xl" {...spinnerProps} />
      </Heading>
    </Center>
  );
};
