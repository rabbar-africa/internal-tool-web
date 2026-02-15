import {
  Button,
  Flex,
  Text,
  type ButtonProps,
  type IconProps,
  type TextProps,
} from "@chakra-ui/react";
import type { ComponentType } from "react";

export interface ActionButtonProps extends ButtonProps {
  icon: ComponentType<any>;
  text: string;
  variant?: ButtonProps["variant"];
  onClick?: () => void;
  reverseIcon?: boolean;
  iconProps?: IconProps;
  textProps?: TextProps;
}
export const ActionButton = ({
  icon: Icon,
  text,
  variant = "primary",
  onClick,
  reverseIcon,
  iconProps,
  textProps,
  ...rest
}: ActionButtonProps) => (
  <Button px="1.5rem" variant={variant} onClick={onClick} {...rest}>
    <Flex alignItems="center" gap=".625rem">
      {!reverseIcon && <Icon color="inherit" {...iconProps} />}
      <Text textStyle="small-regular" {...textProps} color="inherit">
        {text}
      </Text>
      {reverseIcon && <Icon color="inherit" {...iconProps} />}
    </Flex>
  </Button>
);
