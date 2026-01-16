" ClipSync Vim Plugin
" Clipboard manager integration for Vim

if exists('g:loaded_clipsync')
    finish
endif
let g:loaded_clipsync = 1

" Configuration
if !exists('g:clipsync_api_url')
    let g:clipsync_api_url = 'http://localhost:3001/api'
endif

if !exists('g:clipsync_api_key')
    let g:clipsync_api_key = ''
endif

" Functions
function! s:ClipSyncSearch() range
    let query = input('Search clips: ')
    if query == ''
        return
    endif
    
    let url = g:clipsync_api_url . '/v1/clips?search=' . query
    let cmd = 'curl -s -H "Authorization: Bearer ' . g:clipsync_api_key . '" "' . url . '"'
    let result = system(cmd)
    
    " Parse JSON and show results (simplified)
    echo result
endfunction

function! s:ClipSyncPaste(index)
    let url = g:clipsync_api_url . '/v1/clips'
    let cmd = 'curl -s -H "Authorization: Bearer ' . g:clipsync_api_key . '" "' . url . '"'
    let result = system(cmd)
    
    " Extract clip and paste (simplified)
    " In production, properly parse JSON
endfunction

function! s:ClipSyncCopy()
    let content = @+
    if content == ''
        echo 'No content in clipboard'
        return
    endif
    
    let url = g:clipsync_api_url . '/v1/clips'
    let cmd = 'curl -s -X POST -H "Authorization: Bearer ' . g:clipsync_api_key . '" -H "Content-Type: application/json" -d "{\"content\":\"" . escape(content, '"') . "\"}" "' . url . '"'
    call system(cmd)
    echo 'Copied to ClipSync'
endfunction

" Commands
command! -nargs=0 ClipSyncSearch call s:ClipSyncSearch()
command! -nargs=? ClipSyncPaste call s:ClipSyncPaste(<args>)
command! -nargs=0 ClipSyncCopy call s:ClipSyncCopy()

" Key mappings
if !exists('g:clipsync_no_mappings')
    nnoremap <leader>cs :ClipSyncSearch<CR>
    nnoremap <leader>cp :ClipSyncPaste<CR>
    nnoremap <leader>cc :ClipSyncCopy<CR>
endif

