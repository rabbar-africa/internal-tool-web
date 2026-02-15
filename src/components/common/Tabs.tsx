import type { TabContentProps } from "@/shared/interface/tab";
import { Tabs } from "@chakra-ui/react";
import { Suspense } from "react";
import SectionLoader from "./SectionLoader";

export const TabContent = ({
  value,
  component: Component,
  activeTab,
  setActiveTab,
}: TabContentProps) => (
  <Tabs.Content value={value}>
    {activeTab === value && (
      <Suspense fallback={<SectionLoader />}>
        <Component setActiveTab={setActiveTab} />
      </Suspense>
    )}
  </Tabs.Content>
);

export const TabsTrigger = ({
  label,
  value,
}: {
  label: any;
  value: string;
}) => {
  return (
    <Tabs.Trigger
      _selected={{ color: "primary", fontWeight: 600, shadow: "sm" }}
      _before={{ display: "none" }}
      px={"1.25rem"}
      value={value}
      border={"none"}
      rounded={".25rem"}
    >
      {label}
    </Tabs.Trigger>
  );
};
