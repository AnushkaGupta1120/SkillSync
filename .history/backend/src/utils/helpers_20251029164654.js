const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// General utility functions
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateUUID = () => {
  return crypto.randomUUID();
};

const hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
};

// JWT utilities
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Date utilities
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  switch (format) {
    case 'YYYY-MM-DD':
      return d.toISOString().split('T');
    case 'MM/DD/YYYY':
      return d.toLocaleDateString('en-US');
    case 'DD/MM/YYYY':
      return d.toLocaleDateString('en-GB');
    case 'relative':
      return getRelativeTime(d);
    default:
      return d.toISOString();
  }
};

const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
  
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// String utilities
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const truncateText = (text, length = 100, suffix = '...') => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

const sanitizeHtml = (html) => {
  // Basic HTML sanitization - use a proper library like DOMPurify in production
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Array utilities
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

const unique = (array, key = null) => {
  if (key) {
    return array.filter((item, index, self) => 
      index === self.findIndex(t => t[key] === item[key])
    );
  }
  return [...new Set(array)];
};

// Number utilities
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const percentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Object utilities
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

const isEmpty = (value) => {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validation utilities
const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// File utilities
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Pagination utilities
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

// Rate limiting utilities
const createRateLimiter = (windowMs, maxRequests) => {
  const requests = new Map();

  return (identifier) => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }

    // Check current identifier
    const userRequests = requests.get(identifier) || [];
    const validRequests = userRequests.filter(t => t > windowStart);

    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        resetTime: validRequests + windowMs,
        remaining: 0
      };
    }

    validRequests.push(now);
    requests.set(identifier, validRequests);

    return {
      allowed: true,
      resetTime: now + windowMs,
      remaining: maxRequests - validRequests.length
    };
  };
};

// Error utilities
const createError = (message, statusCode = 500, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const isOperationalError = (error) => {
  return error.isOperational === true;
};

module.exports = {
  // Crypto utilities
  generateRandomString,
  generateUUID,
  hashPassword,
  comparePassword,

  // JWT utilities
  generateAccessToken,
  generateRefreshToken,
  verifyToken,

  // Date utilities
  formatDate,
  getRelativeTime,
  addDays,
  subtractDays,

  // String utilities
  slugify,
  capitalizeFirst,
  truncateText,
  sanitizeHtml,

  // Array utilities
  shuffle,
  groupBy,
  unique,

  // Number utilities
  randomInt,
  randomFloat,
  clamp,
  percentage,

  // Object utilities
  deepClone,
  omit,
  pick,
  isEmpty,

  // Validation utilities
  isEmail,
  isURL,
  isStrongPassword,
  isValidPhoneNumber,

  // File utilities
  getFileExtension,
  isImageFile,
  formatFileSize,

  // Pagination utilities
  getPaginationInfo,

  // Rate limiting utilities
  createRateLimiter,

  // Error utilities
  createError,
  isOperationalError
};
