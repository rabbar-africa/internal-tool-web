import { useState } from "react";
import {
  Badge,
  Box,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CaretCircle } from "@/assets/custom/CaretCircle";
import { formatTransactionSeries } from "@/utils/string-formatter";
import {
  TXN_SERIES_MODULES,
  type IOrgTransactionSeries,
  type TxnSeriesModule,
} from "@/shared/interface/settings";
import { SettingsSubPage } from "../SettingsSubPage";
import { SeriesForm } from "./SeriesForm";
import { useGetOrganizationTransactionSeries } from "../../api";

export function TransactionSeries() {
  const { data, isLoading } = useGetOrganizationTransactionSeries();
  const series = data?.data ?? [];

  const [openModule, setOpenModule] = useState<TxnSeriesModule | null>(null);

  const byModule = series.reduce<Record<string, IOrgTransactionSeries>>(
    (acc, s) => {
      acc[s.module] = s;
      return acc;
    },
    {},
  );

  const toggle = (module: TxnSeriesModule) =>
    setOpenModule((current) => (current === module ? null : module));

  return (
    <SettingsSubPage
      title="Transaction Series"
      subtitle="Control the numbering format for each module's transactions."
    >
      {isLoading ? (
        <Center py="12">
          <Spinner color="primary.300" />
        </Center>
      ) : (
        <Stack gap="3">
          {TXN_SERIES_MODULES.map(({ value, label }) => {
            const config = byModule[value];
            const isOpen = openModule === value;
            const preview = config
              ? formatTransactionSeries({
                  prefix: config.prefix,
                  suffix: config.suffix,
                  separator: config.separator,
                  padding: config.padding,
                  number: config.nextNumber,
                })
              : null;

            return (
              <Box
                key={value}
                borderWidth="1px"
                borderColor={isOpen ? "primary.100" : "gray.75"}
                rounded="lg"
                overflow="hidden"
                bg="white"
              >
                <Flex
                  as="button"
                  w="100%"
                  align="center"
                  justify="space-between"
                  gap="3"
                  p="4"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => toggle(value)}
                >
                  <Flex align="center" gap="3" minW="0">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      {label}
                    </Text>
                    {!config && (
                      <Badge size="sm" variant="subtle" colorPalette="gray">
                        Not configured
                      </Badge>
                    )}
                    {config && !config.isActive && (
                      <Badge size="sm" variant="subtle" colorPalette="orange">
                        Inactive
                      </Badge>
                    )}
                  </Flex>
                  <Flex align="center" gap="3" flexShrink={0}>
                    {preview && (
                      <Text
                        fontSize="13px"
                        color="gray.400"
                        fontWeight="500"
                        display={{ base: "none", sm: "block" }}
                      >
                        {preview}
                      </Text>
                    )}
                    <Box
                      color="gray.300"
                      transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                      transition="transform 0.15s"
                    >
                      <CaretCircle boxSize="1.25rem" />
                    </Box>
                  </Flex>
                </Flex>

                {isOpen && (
                  <Box px="4" pb="4" borderTopWidth="1px" borderColor="gray.75">
                    <SeriesForm module={value} series={config} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </SettingsSubPage>
  );
}
