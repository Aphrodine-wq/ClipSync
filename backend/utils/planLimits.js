/**
 * Plan Limits Configuration
 * Defines limits for each user plan
 */

export const PLAN_LIMITS = {
  free: {
    maxDevices: 1,
    maxClips: 100,
    maxTeams: 0,
    maxTeamMembers: 0,
    features: {
      encryption: false,
      advancedSearch: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  pro: {
    maxDevices: Infinity, // Unlimited
    maxClips: 10000,
    maxTeams: 0,
    maxTeamMembers: 0,
    features: {
      encryption: true,
      advancedSearch: true,
      apiAccess: true,
      prioritySupport: false,
    },
  },
  team: {
    maxDevices: Infinity,
    maxClips: Infinity,
    maxTeams: 10,
    maxTeamMembers: 50,
    features: {
      encryption: true,
      advancedSearch: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    maxDevices: Infinity,
    maxClips: Infinity,
    maxTeams: Infinity,
    maxTeamMembers: Infinity,
    features: {
      encryption: true,
      advancedSearch: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get device limit for a plan
 */
export const getDeviceLimit = (plan) => {
  return PLAN_LIMITS[plan]?.maxDevices ?? PLAN_LIMITS.free.maxDevices;
};

/**
 * Check if plan allows unlimited devices
 */
export const allowsUnlimitedDevices = (plan) => {
  return getDeviceLimit(plan) === Infinity;
};

/**
 * Get required plan for multiple devices
 */
export const getRequiredPlanForMultipleDevices = () => {
  return 'pro';
};

