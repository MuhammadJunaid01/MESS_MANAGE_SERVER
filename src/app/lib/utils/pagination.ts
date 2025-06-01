import { IMeta } from ".";
import { AppError } from "../../middlewares/errors";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  results: T;
  meta: IMeta;
}

export const getPaginationParams = (query: {
  page?: string;
  limit?: string;
}): PaginationParams => {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 10;

  if (isNaN(page) || page < 1) {
    throw new AppError("Page must be a positive integer", 400, "INVALID_PAGE");
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new AppError(
      "Limit must be a positive integer between 1 and 100",
      400,
      "INVALID_LIMIT"
    );
  }

  return { page, limit };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
): IMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
