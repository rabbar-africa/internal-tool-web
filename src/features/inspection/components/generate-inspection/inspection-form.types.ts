export interface Finding {
  component: string;
  observation: string;
  status: string;
}

export interface InspectionFormValues {
  // IDs sent to backend
  clientId: string;
  vehicleId: string;
  // Display-only (auto-filled from selection, not sent to backend)
  customerName: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleColor: string;
  findings: Finding[];
  additionalNotes: string;
  inspectionDate: string;
}

export interface InspectionPayload {
  clientId: string;
  vehicleId: string;
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
  { label: "OK - No Issues", value: "good" },
];
