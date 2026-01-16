import { useState, useEffect, useRef } from 'react';
import useClipStore from '../store/useClipStore';
import * as transforms from '../utils/transforms';
import * as advancedTransforms from '../utils/advancedTransforms';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { clips, selectedClip, addClip } = useClipStore();

  // All available commands
  const commands = [
    // Navigation
    { id: 'search', name: 'Search clips', icon: '🔍', category: 'Navigation', action: () => {} },
    { id: 'recent', name: 'Recent clips', icon: '🕐', category: 'Navigation', action: () => {} },
    { id: 'pinned', name: 'Pinned clips', icon: '📌', category: 'Navigation', action: () => {} },
    { id: 'teams', name: 'Team spaces', icon: '👥', category: 'Navigation', action: () => {} },
    { id: 'settings', name: 'Settings', icon: '⚙️', category: 'Navigation', action: () => {} },
    
    // Quick Actions
    { id: 'new-clip', name: 'Create new clip', icon: '➕', category: 'Actions', action: () => {} },
    { id: 'paste', name: 'Paste from clipboard', icon: '📋', category: 'Actions', action: () => {} },
    { id: 'clear-all', name: 'Clear all clips', icon: '🗑️', category: 'Actions', action: () => {} },
    
    // Text Transforms - Basic
    { id: 'lowercase', name: 'Convert to lowercase', icon: '🔤', category: 'Transform', action: () => applyTransform(transforms.toLowerCase) },
    { id: 'uppercase', name: 'Convert to UPPERCASE', icon: '🔤', category: 'Transform', action: () => applyTransform(transforms.toUpperCase) },
    { id: 'titlecase', name: 'Convert to Title Case', icon: '🔤', category: 'Transform', action: () => applyTransform(transforms.toTitleCase) },
    { id: 'camelcase', name: 'Convert to camelCase', icon: '🐫', category: 'Transform', action: () => applyTransform(transforms.toCamelCase) },
    { id: 'snakecase', name: 'Convert to snake_case', icon: '🐍', category: 'Transform', action: () => applyTransform(transforms.toSnakeCase) },
    { id: 'kebabcase', name: 'Convert to kebab-case', icon: '串', category: 'Transform', action: () => applyTransform(transforms.toKebabCase) },
    { id: 'pascalcase', name: 'Convert to PascalCase', icon: '🅿️', category: 'Transform', action: () => applyTransform(transforms.toPascalCase) },
    
    // Code Formatters
    { id: 'json-beautify', name: 'Beautify JSON', icon: '✨', category: 'Format', action: () => applyTransform(transforms.beautifyJSON) },
    { id: 'json-minify', name: 'Minify JSON', icon: '📦', category: 'Format', action: () => applyTransform(transforms.minifyJSON) },
    { id: 'sql-format', name: 'Format SQL', icon: '🗄️', category: 'Format', action: () => applyTransform(advancedTransforms.formatSQL) },
    { id: 'xml-format', name: 'Format XML', icon: '📄', category: 'Format', action: () => applyTransform(advancedTransforms.formatXML) },
    { id: 'html-format', name: 'Format HTML', icon: '🌐', category: 'Format', action: () => applyTransform(advancedTransforms.formatHTML) },
    { id: 'css-format', name: 'Format CSS', icon: '🎨', category: 'Format', action: () => applyTransform(advancedTransforms.formatCSS) },
    
    // Encoders
    { id: 'base64-encode', name: 'Base64 Encode', icon: '🔐', category: 'Encode', action: () => applyTransform(transforms.base64Encode) },
    { id: 'base64-decode', name: 'Base64 Decode', icon: '🔓', category: 'Encode', action: () => applyTransform(transforms.base64Decode) },
    { id: 'url-encode', name: 'URL Encode', icon: '🔗', category: 'Encode', action: () => applyTransform(transforms.urlEncode) },
    { id: 'url-decode', name: 'URL Decode', icon: '🔗', category: 'Encode', action: () => applyTransform(transforms.urlDecode) },
    { id: 'html-encode', name: 'HTML Encode', icon: '🌐', category: 'Encode', action: () => applyTransform(advancedTransforms.htmlEncode) },
    { id: 'html-decode', name: 'HTML Decode', icon: '🌐', category: 'Encode', action: () => applyTransform(advancedTransforms.htmlDecode) },
    { id: 'jwt-decode', name: 'Decode JWT', icon: '🔑', category: 'Encode', action: () => applyTransform(advancedTransforms.jwtDecode) },
    
    // Converters
    { id: 'md-to-html', name: 'Markdown to HTML', icon: '📝', category: 'Convert', action: () => applyTransform(advancedTransforms.markdownToHTML) },
    { id: 'html-to-md', name: 'HTML to Markdown', icon: '📝', category: 'Convert', action: () => applyTransform(advancedTransforms.htmlToMarkdown) },
    { id: 'json-to-yaml', name: 'JSON to YAML', icon: '🔄', category: 'Convert', action: () => applyTransform(advancedTransforms.jsonToYAML) },
    { id: 'yaml-to-json', name: 'YAML to JSON', icon: '🔄', category: 'Convert', action: () => applyTransform(advancedTransforms.yamlToJSON) },
    { id: 'csv-to-json', name: 'CSV to JSON', icon: '📊', category: 'Convert', action: () => applyTransform(advancedTransforms.csvToJSON) },
    { id: 'json-to-csv', name: 'JSON to CSV', icon: '📊', category: 'Convert', action: () => applyTransform(advancedTransforms.jsonToCSV) },
    { id: 'rgb-to-hex', name: 'RGB to HEX', icon: '🎨', category: 'Convert', action: () => applyTransform(advancedTransforms.rgbToHex) },
    { id: 'hex-to-rgb', name: 'HEX to RGB', icon: '🎨', category: 'Convert', action: () => applyTransform(advancedTransforms.hexToRGB) },
    { id: 'hex-to-hsl', name: 'HEX to HSL', icon: '🎨', category: 'Convert', action: () => applyTransform(advancedTransforms.hexToHSL) },
    
    // Generators
    { id: 'gen-uuid', name: 'Generate UUID', icon: '🆔', category: 'Generate', action: () => generateAndAdd(transforms.generateUUID) },
    { id: 'gen-password', name: 'Generate Password', icon: '🔑', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generatePassword) },
    { id: 'gen-strong-password', name: 'Generate Strong Password', icon: '🔐', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generateStrongPassword) },
    { id: 'gen-pin', name: 'Generate PIN', icon: '🔢', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generatePIN) },
    { id: 'gen-lorem', name: 'Generate Lorem Ipsum', icon: '📝', category: 'Generate', action: () => generateAndAdd(transforms.generateLoremIpsum) },
    { id: 'gen-name', name: 'Generate Fake Name', icon: '👤', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generateFakeName) },
    { id: 'gen-email', name: 'Generate Fake Email', icon: '📧', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generateFakeEmail) },
    { id: 'gen-phone', name: 'Generate Fake Phone', icon: '📱', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generateFakePhone) },
    { id: 'gen-address', name: 'Generate Fake Address', icon: '🏠', category: 'Generate', action: () => generateAndAdd(advancedTransforms.generateFakeAddress) },
    
    // Hash Functions
    { id: 'hash-sha256', name: 'SHA-256 Hash', icon: '#️⃣', category: 'Hash', action: () => applyTransform(transforms.generateSHA256) },
    { id: 'hash-sha1', name: 'SHA-1 Hash', icon: '#️⃣', category: 'Hash', action: () => applyAsyncTransform(advancedTransforms.generateSHA1) },
    { id: 'hash-sha512', name: 'SHA-512 Hash', icon: '#️⃣', category: 'Hash', action: () => applyAsyncTransform(advancedTransforms.generateSHA512) },
    
    // Text Utilities
    { id: 'reverse', name: 'Reverse Text', icon: '🔄', category: 'Utility', action: () => applyTransform(transforms.reverseString) },
    { id: 'sort-lines', name: 'Sort Lines', icon: '📊', category: 'Utility', action: () => applyTransform(transforms.sortLines) },
    { id: 'remove-duplicates', name: 'Remove Duplicate Lines', icon: '🗑️', category: 'Utility', action: () => applyTransform(transforms.removeDuplicateLines) },
    { id: 'trim', name: 'Trim Whitespace', icon: '✂️', category: 'Utility', action: () => applyTransform(transforms.trimWhitespace) },
    { id: 'count-words', name: 'Count Words', icon: '🔢', category: 'Utility', action: () => applyTransform(advancedTransforms.countWords) },
    { id: 'remove-empty-lines', name: 'Remove Empty Lines', icon: '🗑️', category: 'Utility', action: () => applyTransform(advancedTransforms.removeEmptyLines) },
    { id: 'add-line-numbers', name: 'Add Line Numbers', icon: '🔢', category: 'Utility', action: () => applyTransform(advancedTransforms.addLineNumbers) },
    { id: 'slugify', name: 'Slugify', icon: '🔗', category: 'Utility', action: () => applyTransform(advancedTransforms.slugify) },
    
    // Extraction
    { id: 'extract-urls', name: 'Extract URLs', icon: '🔗', category: 'Extract', action: () => applyTransform(transforms.extractURLs) },
    { id: 'extract-emails', name: 'Extract Emails', icon: '📧', category: 'Extract', action: () => applyTransform(transforms.extractEmails) },
    { id: 'extract-numbers', name: 'Extract Numbers', icon: '🔢', category: 'Extract', action: () => applyTransform(transforms.extractNumbers) },
  ];

  const applyTransform = async (transformFn) => {
    if (!selectedClip) {
      alert('Please select a clip first');
      return;
    }
    try {
      const result = transformFn(selectedClip.content);
      await addClip(result);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const applyAsyncTransform = async (transformFn) => {
    if (!selectedClip) {
      alert('Please select a clip first');
      return;
    }
    try {
      const result = await transformFn(selectedClip.content);
      await addClip(result);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  const generateAndAdd = async (generatorFn) => {
    try {
      const result = generatorFn();
      await addClip(result);
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  // Filter commands based on query
  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 text-lg outline-none bg-transparent"
            />
            <kbd className="px-2 py-1 text-xs font-semibold text-zinc-500 bg-zinc-100 rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-lg">No commands found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {category}
                </div>
                {cmds.map((cmd, index) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <span className="text-2xl">{cmd.icon}</span>
                      <span className="flex-1 text-left font-medium text-zinc-800">
                        {cmd.name}
                      </span>
                      {isSelected && (
                        <kbd className="px-2 py-1 text-xs font-semibold text-zinc-500 bg-white rounded border border-zinc-200">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-300">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-300">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-zinc-300">ESC</kbd>
              Close
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
