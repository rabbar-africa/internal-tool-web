"use client";
import React from "react";
import { Breadcrumb, Box, type BreadcrumbRootProps } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

type CrumbItem = {
  label: React.ReactNode;
  to?: string;
  isCurrent?: boolean;
  textStyle?: string;
  color?: string;
};

type CustomBreadCrumbProps = {
  items: CrumbItem[];
  separator?: React.ReactNode;
  breadcrumbProps?: BreadcrumbRootProps;
};

export function CustomBreadCrumb({
  items,
  breadcrumbProps,
}: CustomBreadCrumbProps) {
  return (
    <Breadcrumb.Root {...breadcrumbProps}>
      <Breadcrumb.List>
        {items.map((it, idx) => (
          <React.Fragment key={idx}>
            <Breadcrumb.Item>
              {it.isCurrent ? (
                <Breadcrumb.CurrentLink
                  textStyle={it.textStyle || "tiny-semibold"}
                  color={it.color || "gray.500"}
                >
                  {it.label}
                </Breadcrumb.CurrentLink>
              ) : it.to ? (
                <Breadcrumb.Link textStyle={"tiny-regular"} asChild>
                  <Box>
                    <RouterLink to={it.to}>{it.label}</RouterLink>
                  </Box>
                </Breadcrumb.Link>
              ) : (
                <Breadcrumb.Link textStyle={it.textStyle}>
                  {it.label}
                </Breadcrumb.Link>
              )}
            </Breadcrumb.Item>

            {idx < items.length - 1 && <Breadcrumb.Separator />}
          </React.Fragment>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
/**
 * Usage Example:
 * 
 * <CustomBreadCrumb
      items={[
        { label: "Home", to: "/" },
        { label: "Settings", to: "/settings" },
        { label: "Profile", isCurrent: true },
      ]}
    />
    <CustomBreadCrumb
      items={[
        { label: "Home", to: "/" },
        { label: "Settings", to: "/settings" },
        { label: "Profile", isCurrent: true, textStyle: "tiny-semibold", color: "blue.500" },
      ]}
      breadcrumbProps={{ mb: "1rem" }}
    />
 */
