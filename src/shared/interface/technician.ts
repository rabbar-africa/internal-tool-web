export interface Technician {
  id: string;
  organizationId: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  specialty?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianPayload {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  isActive?: boolean;
}

export type UpdateTechnicianPayload = Partial<CreateTechnicianPayload>;

export interface IGetTechnicianFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const technicianFullName = (
  technician: Pick<Technician, "firstName" | "lastName">,
): string =>
  [technician.firstName, technician.lastName].filter(Boolean).join(" ");
