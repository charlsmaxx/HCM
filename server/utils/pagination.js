/**
 * Pagination utility functions
 */

/**
 * Parse and validate pagination parameters from request query
 * @param {Object} query - Request query object
 * @param {Object} options - Options for pagination
 * @param {number} options.defaultLimit - Default items per page (default: 20)
 * @param {number} options.maxLimit - Maximum items per page (default: 100)
 * @param {number} options.defaultPage - Default page number (default: 1)
 * @returns {Object} - { page, limit, skip }
 */
function parsePagination(query, options = {}) {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultPage = 1
  } = options;

  // Parse page
  let page = parseInt(query.page || defaultPage, 10);
  if (isNaN(page) || page < 1) {
    page = defaultPage;
  }

  // Parse limit
  let limit = parseInt(query.limit || defaultLimit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} - Pagination metadata
 */
function createPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
}

/**
 * Create paginated response
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @returns {Object} - Paginated response
 */
function createPaginatedResponse(data, pagination) {
  return {
    data,
    pagination
  };
}

module.exports = {
  parsePagination,
  createPaginationMeta,
  createPaginatedResponse
};


