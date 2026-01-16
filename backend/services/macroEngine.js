/**
 * Macro Engine
 * Executes clipboard macros
 */

import { query } from '../config/database.js';

/**
 * Execute macro
 */
export async function executeMacro(macroId, userId, context = {}) {
  try {
    // Get macro
    const result = await query(
      `SELECT * FROM macros WHERE id = $1 AND (user_id = $2 OR is_public = TRUE)`,
      [macroId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Macro not found');
    }

    const macro = result.rows[0];
    const actions = macro.actions;

    // Execute each action
    const results = [];
    for (const action of actions) {
      const result = await executeAction(action, userId, context);
      results.push(result);
      context = { ...context, ...result }; // Merge result into context
    }

    return {
      macro: macro.name,
      actions: results,
    };
  } catch (error) {
    console.error('Macro execution error:', error);
    throw error;
  }
}

/**
 * Execute single action
 */
async function executeAction(action, userId, context) {
  switch (action.type) {
    case 'copy':
      return await copyAction(action, userId, context);
    case 'paste':
      return await pasteAction(action, userId, context);
    case 'transform':
      return await transformAction(action, userId, context);
    case 'search':
      return await searchAction(action, userId, context);
    case 'filter':
      return await filterAction(action, userId, context);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Copy action
 */
async function copyAction(action, userId, context) {
  const content = resolveVariable(action.content, context);

  // Create clip
  const result = await query(
    `INSERT INTO clips (user_id, content, type)
     VALUES ($1, $2, $3)
     RETURNING id, content`,
    [userId, content, action.type || 'text']
  );

  return {
    type: 'copy',
    clip: result.rows[0],
  };
}

/**
 * Paste action (get from history)
 */
async function pasteAction(action, userId, context) {
  const { index = 0, search } = action;

  let queryText = `
    SELECT id, content, type
    FROM clips
    WHERE user_id = $1 AND deleted_at IS NULL
  `;
  const params = [userId];

  if (search) {
    queryText += ` AND content ILIKE $2`;
    params.push(`%${resolveVariable(search, context)}%`);
  }

  queryText += ` ORDER BY created_at DESC LIMIT 1 OFFSET $${params.length + 1}`;
  params.push(index);

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return { type: 'paste', content: null };
  }

  return {
    type: 'paste',
    clip: result.rows[0],
  };
}

/**
 * Transform action
 */
async function transformAction(action, userId, context) {
  const content = resolveVariable(action.content, context);
  const transform = action.transform;

  let transformed = content;

  switch (transform) {
    case 'uppercase':
      transformed = content.toUpperCase();
      break;
    case 'lowercase':
      transformed = content.toLowerCase();
      break;
    case 'trim':
      transformed = content.trim();
      break;
    case 'reverse':
      transformed = content.split('').reverse().join('');
      break;
    case 'remove-whitespace':
      transformed = content.replace(/\s+/g, '');
      break;
    case 'slugify':
      transformed = content
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      break;
    default:
      throw new Error(`Unknown transform: ${transform}`);
  }

  return {
    type: 'transform',
    original: content,
    transformed,
  };
}

/**
 * Search action
 */
async function searchAction(action, userId, context) {
  const query = resolveVariable(action.query, context);

  const result = await query(
    `SELECT id, content, type
     FROM clips
     WHERE user_id = $1 
       AND deleted_at IS NULL
       AND content ILIKE $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [userId, `%${query}%`, action.limit || 10]
  );

  return {
    type: 'search',
    results: result.rows,
  };
}

/**
 * Filter action
 */
async function filterAction(action, userId, context) {
  let queryText = `
    SELECT id, content, type
    FROM clips
    WHERE user_id = $1 AND deleted_at IS NULL
  `;
  const params = [userId];

  if (action.type) {
    queryText += ` AND type = $${params.length + 1}`;
    params.push(action.type);
  }

  if (action.pinned !== undefined) {
    queryText += ` AND pinned = $${params.length + 1}`;
    params.push(action.pinned);
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(action.limit || 10);

  const result = await query(queryText, params);

  return {
    type: 'filter',
    results: result.rows,
  };
}

/**
 * Resolve variable in context
 */
function resolveVariable(value, context) {
  if (typeof value !== 'string') {
    return value;
  }

  // Replace {{variable}} with context value
  return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

