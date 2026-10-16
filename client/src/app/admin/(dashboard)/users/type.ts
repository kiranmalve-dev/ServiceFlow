
export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
