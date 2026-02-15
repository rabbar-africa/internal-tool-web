import { Center, type CenterProps, type SpinnerProps } from "@chakra-ui/react";
import { Loader } from "./Loader";

export default function SectionLoader(
  props: { spinnerProps?: SpinnerProps } & CenterProps,
) {
  return (
    <Center h={"25rem"} p="1.125rem" bg="inherit" rounded={".75rem"} {...props}>
      <Loader spinnerProps={props.spinnerProps} />
    </Center>
  );
}
