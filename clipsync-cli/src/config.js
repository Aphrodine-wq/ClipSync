/**
 * Configuration management
 */

const ConfigStore = require('configstore');
const config = new ConfigStore('clipsync-cli');

const API_URL = process.env.CLIPSYNC_API_URL || 'http://localhost:3001/api';

function getToken() {
  return config.get('token');
}

function setToken(token) {
  config.set('token', token);
}

function clearToken() {
  config.delete('token');
}

function getApiUrl() {
  return API_URL;
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  getApiUrl,
};

