-- ClipSync Neovim Plugin
-- Clipboard manager integration for Neovim

local M = {}

M.api_url = vim.g.clipsync_api_url or 'http://localhost:3001/api'
M.api_key = vim.g.clipsync_api_key or ''

function M.search()
  vim.ui.input({ prompt = 'Search clips: ' }, function(query)
    if not query or query == '' then
      return
    end

    local url = M.api_url .. '/v1/clips?search=' .. query
    local cmd = string.format(
      'curl -s -H "Authorization: Bearer %s" "%s"',
      M.api_key,
      url
    )

    local handle = io.popen(cmd)
    local result = handle:read('*a')
    handle:close()

    -- Parse and display results
    vim.notify('Search results:\n' .. result, vim.log.levels.INFO)
  end)
end

function M.paste(index)
  index = index or 0
  local url = M.api_url .. '/v1/clips?limit=1&offset=' .. index
  local cmd = string.format(
    'curl -s -H "Authorization: Bearer %s" "%s"',
    M.api_key,
    url
  )

  local handle = io.popen(cmd)
  local result = handle:read('*a')
  handle:close()

  -- Parse JSON and paste content
  -- Simplified - in production use proper JSON parser
end

function M.copy()
  local content = vim.fn.getreg('+')
  if content == '' then
    vim.notify('No content in clipboard', vim.log.levels.WARN)
    return
  end

  local escaped = string.gsub(content, '"', '\\"')
  local url = M.api_url .. '/v1/clips'
  local cmd = string.format(
    'curl -s -X POST -H "Authorization: Bearer %s" -H "Content-Type: application/json" -d \'{"content":"%s"}\' "%s"',
    M.api_key,
    escaped,
    url
  )

  os.execute(cmd)
  vim.notify('Copied to ClipSync', vim.log.levels.INFO)
end

-- Setup function
function M.setup(opts)
  opts = opts or {}
  M.api_url = opts.api_url or M.api_url
  M.api_key = opts.api_key or M.api_key

  -- Create commands
  vim.api.nvim_create_user_command('ClipSyncSearch', M.search, {})
  vim.api.nvim_create_user_command('ClipSyncPaste', M.paste, { nargs = '?' })
  vim.api.nvim_create_user_command('ClipSyncCopy', M.copy, {})

  -- Key mappings
  if not opts.no_mappings then
    vim.keymap.set('n', '<leader>cs', M.search, { desc = 'ClipSync Search' })
    vim.keymap.set('n', '<leader>cp', M.paste, { desc = 'ClipSync Paste' })
    vim.keymap.set('n', '<leader>cc', M.copy, { desc = 'ClipSync Copy' })
  end
end

return M

