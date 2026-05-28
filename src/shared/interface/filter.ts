export interface IBaseFilter {
  organizationId?: string | null;
  name?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  role?: string;
  size?: number;
}
