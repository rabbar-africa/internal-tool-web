import { Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { PlusIcon } from "@/assets/custom";
import { usePermissions } from "@/hooks/usePermissions";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { RouteConstants } from "@/shared/constants/routes";
import type { IGetQuotationFilter } from "@/shared/interface/quotation";
import { useGetQuotationsQuery } from "../api/query";
import { useQuotationListColumns } from "./quotation-list/columns";

const scrollAreaProps = { maxW: { base: "xl", lg: "7xl" } };

interface QuotationsTableProps {
  /** Whose quotes: a customer's, a vehicle's or a job card's. */
  filter: Pick<IGetQuotationFilter, "customerId" | "vehicleId" | "jobCardId">;
  /** Shows "New Quote", opening the form with these query params. */
  newQuoteParams?: Record<string, string>;
}

/** Quotes on another record's page: a job card's, or a customer's. */
export function QuotationsTable({
  filter,
  newQuoteParams,
}: QuotationsTableProps) {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const { isAtLimit } = usePlanAccess();
  const columns = useQuotationListColumns();
  const { data, isLoading } = useGetQuotationsQuery({
    ...filter,
    page: 1,
    limit: 50,
  });

  return (
    <>
      {newQuoteParams && has("create:quotations") && (
        <Flex justify="flex-end" mb="3">
          <Button
            size="sm"
            disabled={isAtLimit("quotations")}
            onClick={() =>
              navigate(
                `${RouteConstants.quotations.create.path}?${new URLSearchParams(
                  newQuoteParams,
                )}`,
              )
            }
          >
            <PlusIcon />
            New Quote
          </Button>
        </Flex>
      )}
      <CustomTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) =>
          navigate(
            RouteConstants.quotations.detail.generate({ id: row.original.id }),
          )
        }
        tableScrollAreaProps={scrollAreaProps}
      />
    </>
  );
}
