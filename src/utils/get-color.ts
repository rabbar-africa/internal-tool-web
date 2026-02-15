export const getColor = (name: string): string => {
  switch (name?.toLowerCase()) {
    case "pending":
    case "created":
    case "suspended":
      return "#F5A623";
    case "verified":
    case "completed":
    case "successful":
    case "active":
      return "#00AF94";
    case "failed":
    case "flagged":
      return "#D0021B";
    case "initiated":
      return "#F5A623";
    case "inprogress":
      return "#FFA07A";
    default:
      return "transparent";
  }
};
export const getVerificationAccordionColor = (name: string): string => {
  switch (name?.toLowerCase()) {
    case "pending":
    case "created":
      return "rgba(245, 166, 35, 0.2)";
    case "verified":
    case "completed":
      return "rgba(0, 175, 148, 0.2)";
    case "failed":
      return "#D0021B";
    case "initiated":
      return "#F5A623";
    case "inprogress":
      return "#FFA07A";
    default:
      return "transparent";
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "paid":
    case "approved":
    case "verified":
      return {
        bg: "success.50",
        text: "success.300",
      };

    case "completed":
    case "low":
    case "custom":
      return {
        bg: "success.50",
        text: "gray.300",
      };

    case "draft":
    case "system":
    case "received":
    case "data collection":
      return {
        bg: "primary.50",
        text: "primary.300",
      };
    case "pending":
    case "medium":
    case "in review":
    case "pending approval":
    case "pendingApproval":
    case "reviewdue":
    case "invited":
    case "under review":
    case "rectification":
      return {
        bg: "warning.50",
        text: "secondary.500",
      };
    case "on leave":
    case "inactive":
    case "disabled":
    case "declined":
    case "rejected":
    case "high":
    case "very high":
    case "review due":
    case "failed":
    case "objection":
    case "overdue":
    case "closed":
    case "blocked":
    case "deletion":
    case "erasure":
    case "restriction of processing":
      return {
        bg: "error.50",
        text: "error.300",
      };
    case "onboarding":
      return {
        bg: "yellow.50",
        text: "yellow.400",
      };
    case "access":
    case "data portability":
      return {
        bg: "primary.50",
        text: "gray.300",
      };
    case "identity verification":
      return {
        bg: "secondary.50",
        text: "secondary.500",
      };
    case "decision made":
      return {
        bg: "gray.50",
        text: "gray.300",
      };
  }
};
