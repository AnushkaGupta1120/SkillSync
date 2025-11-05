const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateUUID = () => {
  return crypto.randomUUID();
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  switch (format) {
    case 'YYYY-MM-DD':
      return d.toISOString().split('T');
    case 'MM/DD/YYYY':
      return d.toLocaleDateString('en-US');
    case 'DD/MM/YYYY':
      return d.toLocaleDateString('en-GB');
    default:
      return d.toISOString();
  }
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const truncateText = (text, length = 100, suffix = '...') => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

const percentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const getPaginationInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const offset = (page - 1) * limit;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset,
    startIndex: offset + 1,
    endIndex: Math.min(offset + limit, total)
  };
};

module.exports = {
  generateRandomString,
  generateUUID,
  formatDate,
  slugify,
  truncateText,
  percentage,
  getPaginationInfo
};
