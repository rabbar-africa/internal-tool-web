export interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  meta: IMeta;
}

export interface IMeta {
  limit: number;
  page: number;
  count: number;
  total: number;
  exceedCount: boolean;
  exceedTotalPages: boolean;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;

  current_page: number;
  has_next: boolean;
  has_previous: boolean;
  items_per_page: number;
  previous: any;
  total_pages: number;
}

export interface ApiResponseTrustCenter<T = any> {
  documents?: T;
  pagination: IMeta;
}
