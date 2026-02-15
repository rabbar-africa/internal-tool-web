import { type ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { queryClient } from "@/lib/react-query";
import { Toaster } from "@/components/ui";
import { system } from "@/theme";
const helmetContext = {};

type AppProviderProps = { children: ReactNode };
export function AppProvider({ children }: AppProviderProps) {
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <QueryClientProvider client={queryClient}>
            {/* <ReactQueryDevtools client={queryClient} /> */}
            {children}
          </QueryClientProvider>
          <Toaster />
        </ChakraProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
