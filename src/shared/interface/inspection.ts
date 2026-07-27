import type { IVehicle } from "./common";

export interface IInspectionVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: string;
}

export interface IInspectionClient {
  id: string;
  displayName: string;
}
export interface IInspectionFinding {
  component: string;
  status: string;
  observation?: string;
}
export interface IInspection {
  id: string;
  organizationId: string;
  vehicleId: string;
  customerId?: string | null;
  jobCode: string;
  technicianName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  generalNotes: string;
  photos: Array<any>;
  pdfUrl: string | null;
  inspectionDate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleRegistrationNumber: string;
  vehicleVin: string;
  vehicleColor: string;
  findings: IInspectionFinding[];

  createdAt: string;
  updatedAt: string;
  vehicle: IVehicle | null;
}

export interface InspectionFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vehicleId?: string;
  technicianName?: string;
  dateFrom?: string;
  dateTo?: string;
}
