export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
