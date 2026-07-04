import { SimpleGrid } from "@chakra-ui/react";
import { StatCard } from "@/components/common/StatCard";
import { Money } from "@/assets/custom/Money";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { ClipboardTextIcon } from "@/assets/custom/ClipboardTextIcon";
import { ChartBar } from "@/assets/custom/ChartBar";
import { CheckCircle } from "@/assets/custom/CheckCircle";
import { formatCurrency } from "@/utils/calculations";
import type { JobCardFinancials } from "@/shared/interface/job-card";

interface JobCardFinancialsCardsProps {
  financials: JobCardFinancials;
}

export function JobCardFinancialsCards({
  financials,
}: JobCardFinancialsCardsProps) {
  const isProfitable = financials.profit >= 0;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
      <StatCard
        label="Invoiced"
        value={formatCurrency(financials.invoicedTotal)}
        icon={<FileTextIcon color="primary.300" />}
      />
      <StatCard
        label="Collected"
        value={formatCurrency(financials.collected)}
        icon={<CheckCircle color="green.500" />}
        iconBg="green.50"
      />
      <StatCard
        label="Outstanding"
        value={formatCurrency(financials.outstanding)}
        icon={<Money color="orange.500" />}
        iconBg="orange.50"
      />
      <StatCard
        label="Expenses"
        value={formatCurrency(financials.expensesTotal)}
        icon={<ClipboardTextIcon color="red.500" />}
        iconBg="red.50"
      />
      <StatCard
        label="Profit"
        value={formatCurrency(financials.profit)}
        icon={<ChartBar color={isProfitable ? "green.500" : "red.500"} />}
        iconBg={isProfitable ? "green.50" : "red.50"}
        trend={isProfitable ? "up" : "down"}
        trendValue={isProfitable ? "Cash-basis profit" : "Running at a loss"}
      />
    </SimpleGrid>
  );
}
