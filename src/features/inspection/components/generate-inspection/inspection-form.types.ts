export interface Finding {
  component: string;
  observation: string;
  status: string;
}

export interface InspectionFormValues {
  customerTitle: string;
  customerName: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleColor: string;
  jobCode: string;
  findings: Finding[];
  additionalNotes: string;
  inspectionDate: string;
}

export const TITLE_OPTIONS = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Miss", value: "Miss" },
  { label: "Dr", value: "Dr" },
  { label: "Chief", value: "Chief" },
];

export const STATUS_OPTIONS = [
  { label: "Faulty - Requires Replacement", value: "faulty_replace" },
  { label: "Faulty - Replaced", value: "faulty_replaced" },
  { label: "Worn Out - Needs Attention", value: "worn_out" },
  { label: "Not Genuine - Replace with OEM", value: "not_genuine" },
  { label: "Damaged", value: "damaged" },
  { label: "OK - No Issues", value: "ok" },
];
