export interface ApiResponse<T = any> extends IMeta {
  status: boolean;
  result?: T;
  data?: { result: T };
}

export interface IMeta {
  limit: number;
  page: number;
  count: number;
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
