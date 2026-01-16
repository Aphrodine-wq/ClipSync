/**
 * Pub/Sub Service
 * Real-time messaging using Redis pub/sub
 */

import { getPubClient, getSubClient, isRedisConnected } from '../config/redis.js';

/**
 * Publish message to channel
 */
export const publish = async (channel, message) => {
  try {
    if (!isRedisConnected()) {
      console.warn('Redis not connected, message not published');
      return false;
    }

    const pub = getPubClient();
    if (!pub) {
      return false;
    }

    await pub.publish(channel, JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Publish error:', error);
    return false;
  }
};

/**
 * Subscribe to channel
 */
export const subscribe = async (channel, callback) => {
  try {
    if (!isRedisConnected()) {
      console.warn('Redis not connected, cannot subscribe');
      return false;
    }

    const sub = getSubClient();
    if (!sub) {
      return false;
    }

    await sub.subscribe(channel, (message) => {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        console.error('Subscribe callback error:', error);
      }
    });

    return true;
  } catch (error) {
    console.error('Subscribe error:', error);
    return false;
  }
};

/**
 * Unsubscribe from channel
 */
export const unsubscribe = async (channel) => {
  try {
    if (!isRedisConnected()) {
      return false;
    }

    const sub = getSubClient();
    if (!sub) {
      return false;
    }

    await sub.unsubscribe(channel);
    return true;
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return false;
  }
};

/**
 * Publish clip update
 */
export const publishClipUpdate = async (userId, clip) => {
  const channel = `user:${userId}:clips`;
  return await publish(channel, {
    type: 'clip:updated',
    clip,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish clip creation
 */
export const publishClipCreated = async (userId, clip) => {
  const channel = `user:${userId}:clips`;
  return await publish(channel, {
    type: 'clip:created',
    clip,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish clip deletion
 */
export const publishClipDeleted = async (userId, clipId) => {
  const channel = `user:${userId}:clips`;
  return await publish(channel, {
    type: 'clip:deleted',
    clipId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish team update
 */
export const publishTeamUpdate = async (teamId, update) => {
  const channel = `team:${teamId}`;
  return await publish(channel, {
    type: 'team:updated',
    update,
    timestamp: new Date().toISOString(),
  });
};


