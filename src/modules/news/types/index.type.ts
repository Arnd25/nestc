export enum NewsSortField {
  title = 'title',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  isActive = 'isActive',
}

export enum NewsSortDirection {
  asc = 'asc',
  desc = 'desc',
}

export interface NewsQueryParams {
  categoryId: string;
  published?: boolean;
  page?: number;
  limit?: number;
  sortBy?: NewsSortField;
  orderBy?: NewsSortDirection;
}

export interface NewsItemResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;

  category: {
    id: string;
    title: string;
    slug: string;
  } | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface NewsListResponse {
  items?: NewsItemResponse[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}
