import { Flex, Text, IconButton, Button } from "@chakra-ui/react";
import { CaretLeft, CaretRight } from "@/assets/custom";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage = false,
  hasPrevPage = false,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : currentPage * itemsPerPage;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Flex
      justify="space-between"
      align="center"
      mt={4}
      px={4}
      py={3}
      bg="white"
      borderTop="1px solid #EBEBEB"
    >
      <Text fontSize="sm" color="gray.600">
        Showing {startItem} to {endItem} {totalItems ? `of ${totalItems}` : ""}{" "}
        items
      </Text>

      <Flex align="center" gap={2}>
        {hasPrevPage !== false && (
          <IconButton
            size="sm"
            variant="outline"
            bg="transparent"
            color="gray.3"
            _hover={{ bg: "transparent", color: "gray.50" }}
            _active={{ bg: "transparent", color: "gray.50" }}
            borderColor="gray.50"
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CaretLeft />
          </IconButton>
        )}

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <Text key={`ellipsis-${index}`} px={2} color="gray.500">
                ...
              </Text>
            );
          }

          return (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "solid" : "outline"}
              bg={currentPage === page ? "primary.300" : "white"}
              color={currentPage === page ? "white" : "gray.300"}
              borderColor={currentPage === page ? "primary.300" : "gray.50"}
              onClick={() => onPageChange(page as number)}
              minW="40px"
            >
              {page}
            </Button>
          );
        })}
        {hasNextPage !== false && (
          <IconButton
            size="sm"
            variant="outline"
            bg="transparent"
            color="gray.3"
            _hover={{ bg: "transparent", color: "gray.50" }}
            _active={{ bg: "transparent", color: "gray.50" }}
            borderColor="gray.50"
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CaretRight />
          </IconButton>
        )}
      </Flex>
    </Flex>
  );
}
