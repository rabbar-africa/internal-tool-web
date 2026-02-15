import { Breadcrumb, Flex } from "@chakra-ui/react";
import { RouteConstants } from "@/shared/constants/routes";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <Flex
      alignItems="center"
      width="100%"
      justifyContent="space-between"
      mb="30px"
    >
      <Breadcrumb.Root size="lg">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link
              outline="none"
              cursor="pointer"
              onClick={() => navigate(RouteConstants.overview.base.path)}
            >
              Dashboard
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink>Maturity Report</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </Flex>
  );
}
