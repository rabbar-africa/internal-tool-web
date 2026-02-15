import {
  Button,
  ButtonGroup,
  EmptyState,
  Image,
  VStack,
  type EmptyStateDescriptionProps,
  type EmptyStateIndicatorProps,
  type EmptyStateRootProps,
  type EmptyStateTitleProps,
} from "@chakra-ui/react";
import EmptyStateImage from "@/assets/images/empty-state.png";

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  height?: string;
  indicatorProps?: EmptyStateIndicatorProps;
  titleProps?: EmptyStateTitleProps;
  descriptionProps?: EmptyStateDescriptionProps;
}

export default function EmptyStateComponent({
  title = "No Data",
  description = "There's nothing to show here yet.",
  buttonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
  height = "60vh",
  indicatorProps,
  titleProps,
  descriptionProps,
  ...props
}: EmptyStateProps & EmptyStateRootProps) {
  return (
    <EmptyState.Root
      {...props}
      h={height}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <EmptyState.Content>
        <EmptyState.Indicator {...indicatorProps}>
          <Image src={EmptyStateImage} alt="empty-state" />
        </EmptyState.Indicator>

        <VStack textAlign="center" gap={".5rem"}>
          <EmptyState.Title {...titleProps}>{title}</EmptyState.Title>
          <EmptyState.Description {...descriptionProps}>
            {description}
          </EmptyState.Description>
        </VStack>

        {(buttonText || secondaryButtonText) && (
          <ButtonGroup mt={4}>
            {buttonText && (
              <Button onClick={onPrimaryClick}>{buttonText}</Button>
            )}
            {secondaryButtonText && (
              <Button variant="outline" onClick={onSecondaryClick}>
                {secondaryButtonText}
              </Button>
            )}
          </ButtonGroup>
        )}
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
