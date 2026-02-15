import type { ComponentType, ElementType } from "react";
import type {
  CheckboxControlProps,
  CheckboxLabelProps,
  CheckboxRootProps,
  FieldLabelProps,
  FieldsetContentProps,
  FieldsetLegendProps,
  InputProps,
  RadioGroupItemProps,
  RadioGroupItemTextProps,
  RadioGroupRootProps,
  SelectContentProps,
  SelectControlProps,
  SelectItemProps,
  SelectRootProps,
  SelectTriggerProps,
  SwitchControlProps,
  SwitchRootProps,
  TextareaProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  type UseFormRegisterReturn,
  type UseFormSetValue,
} from "react-hook-form";

export interface BaseFieldProps {
  label?: string | ReactNode;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: "outline" | "subtle" | "flushed";
  size?: "sm" | "md" | "lg";
  error?: string | undefined;
  register?: Partial<UseFormRegisterReturn>;
  value?: any;
  onChange?: any;
  name?: string;
}

// Custom Input Component
export interface CustomInputProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "tel" | "url" | "date";
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  labelProps?: FieldLabelProps;
  inputProps?: InputProps;
}

// Custom Textarea Component
export interface CustomTextareaProps extends BaseFieldProps {
  rows?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
  labelProps?: FieldLabelProps;
  textAreaProps?: TextareaProps;
}

// Custom Select Component
export interface CustomSelectProps extends Omit<BaseFieldProps, "variant"> {
  options: any;
  emptyText?: string;
  noOptionsText?: string;
  loading?: boolean;
  controlProps?: SelectControlProps;
  itemProps?: SelectItemProps;
  contentProps?: SelectContentProps;
  triggerProps?: SelectTriggerProps;
  value?: any;
  onChange?: any;
  width?: any;
  labelProps?: FieldLabelProps;
  rootProps?: Partial<SelectRootProps>;
  optionIsCollection?: boolean;
  multiple?: boolean;
}

// Custom Checkbox Component
export interface CustomCheckboxProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  register?: UseFormRegisterReturn;
  children?: React.ReactNode;
  width?: string;
  rootProps?: CheckboxRootProps;
  controlProps?: CheckboxControlProps;
  checked?: boolean;
  onCheckedChange?: any;
  value?: string;
  labelProps?: CheckboxLabelProps;
}

export interface CustomSwitchProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  register?: UseFormRegisterReturn;
  children?: React.ReactNode;
  width?: string;
  rootProps?: SwitchRootProps;
  controlProps?: SwitchControlProps;
  reversed?: boolean;
  checked?: boolean;
  onCheckedChange?: any;
}

export interface CustomNumberInputProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: "currency" | "percentage" | "number";
  currency?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
  onValueChange?: (value: string, floatValue: number | undefined) => void;
}

// Custom Radio Component
export interface RadioItem {
  label: any;
  value: string;
  icon?: ComponentType | ElementType;
  description?: string;
}

export interface CustomRadioGroupProps extends BaseFieldProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  register?: UseFormRegisterReturn;
  direction?: "row" | "column";
  items: RadioItem[];
  labelProps?: FieldLabelProps;
  itemTextProps?: RadioGroupItemTextProps;
  children?: ReactNode;
  itemProps?: Omit<RadioGroupItemProps, "value"> &
    Partial<Pick<RadioGroupItemProps, "value">>;
  rootProps?: RadioGroupRootProps;
}

// Custom Tag Input Component
export interface CustomTagInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  labelProps?: FieldLabelProps;
  inputProps?: InputProps;
  register?: UseFormRegisterReturn;
  setValue?: UseFormSetValue<any>;
  name?: string;
}

// Custom Checkbox Group Component
export interface CheckboxCardItem {
  label: string;
  value: any;
  description?: string;
  icon?: any;
}

export interface CustomCheckboxCardProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  direction?: "row" | "column";
  error?: string;
  value?: string[];
  onChange?: (values: string[]) => void;
  items: CheckboxCardItem[];
  fieldContentProps?: FieldsetContentProps;
  fieldLegendProps?: FieldsetLegendProps;
}
