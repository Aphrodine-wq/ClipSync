/**
 * IP Whitelist/Blacklist Management
 * Manages IP address whitelisting and blacklisting
 */

import { query } from '../config/database.js';

// In-memory cache (should use Redis in production)
const ipCache = {
  whitelist: new Set(),
  blacklist: new Set(),
  lastUpdate: 0,
  cacheTTL: 60000, // 1 minute
};

/**
 * Load IP lists from database
 */
export const loadIPLists = async () => {
  try {
    // In a real implementation, you'd have an ip_lists table
    // For now, we'll use environment variables and in-memory storage
    
    // Load from environment
    const envWhitelist = (process.env.IP_WHITELIST || '').split(',').filter(Boolean);
    const envBlacklist = (process.env.IP_BLACKLIST || '').split(',').filter(Boolean);
    
    // Update cache
    ipCache.whitelist = new Set(envWhitelist);
    ipCache.blacklist = new Set(envBlacklist);
    ipCache.lastUpdate = Date.now();
    
    return {
      whitelist: Array.from(ipCache.whitelist),
      blacklist: Array.from(ipCache.blacklist),
    };
  } catch (error) {
    console.error('Failed to load IP lists:', error);
    return { whitelist: [], blacklist: [] };
  }
};

/**
 * Check if IP is whitelisted
 */
export const isWhitelisted = (ip) => {
  // Refresh cache if needed
  if (Date.now() - ipCache.lastUpdate > ipCache.cacheTTL) {
    loadIPLists();
  }
  
  return ipCache.whitelist.has(ip);
};

/**
 * Check if IP is blacklisted
 */
export const isBlacklisted = (ip) => {
  // Refresh cache if needed
  if (Date.now() - ipCache.lastUpdate > ipCache.cacheTTL) {
    loadIPLists();
  }
  
  return ipCache.blacklist.has(ip);
};

/**
 * Add IP to whitelist
 */
export const addToWhitelist = async (ip, reason = '') => {
  try {
    ipCache.whitelist.add(ip);
    
    // In production, save to database
    // await query(
    //   'INSERT INTO ip_lists (ip, type, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    //   [ip, 'whitelist', reason]
    // );
    
    return true;
  } catch (error) {
    console.error('Failed to add IP to whitelist:', error);
    return false;
  }
};

/**
 * Add IP to blacklist
 */
export const addToBlacklist = async (ip, reason = '') => {
  try {
    ipCache.blacklist.add(ip);
    
    // In production, save to database
    // await query(
    //   'INSERT INTO ip_lists (ip, type, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    //   [ip, 'blacklist', reason]
    // );
    
    return true;
  } catch (error) {
    console.error('Failed to add IP to blacklist:', error);
    return false;
  }
};

/**
 * Remove IP from whitelist
 */
export const removeFromWhitelist = async (ip) => {
  try {
    ipCache.whitelist.delete(ip);
    return true;
  } catch (error) {
    console.error('Failed to remove IP from whitelist:', error);
    return false;
  }
};

/**
 * Remove IP from blacklist
 */
export const removeFromBlacklist = async (ip) => {
  try {
    ipCache.blacklist.delete(ip);
    return true;
  } catch (error) {
    console.error('Failed to remove IP from blacklist:', error);
    return false;
  }
};

/**
 * Get all whitelisted IPs
 */
export const getWhitelistedIPs = () => {
  return Array.from(ipCache.whitelist);
};

/**
 * Get all blacklisted IPs
 */
export const getBlacklistedIPs = () => {
  return Array.from(ipCache.blacklist);
};

// Initialize on module load
loadIPLists();


