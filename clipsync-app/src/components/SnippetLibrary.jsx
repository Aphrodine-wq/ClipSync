import { useState } from 'react';
import useClipStore from '../store/useClipStore';

const SnippetLibrary = ({ onClose }) => {
  const [snippets, setSnippets] = useState([
    {
      id: '1',
      title: 'React Component Template',
      description: 'Basic React functional component',
      content: `import { useState } from 'react';\n\nconst ComponentName = () => {\n  const [state, setState] = useState();\n\n  return (\n    <div>\n      {/* Your JSX here */}\n    </div>\n  );\n};\n\nexport default ComponentName;`,
      language: 'javascript',
      tags: ['react', 'component', 'template'],
      category: 'React',
      favorite: true,
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Express API Route',
      description: 'Express.js API route template',
      content: `router.get('/api/endpoint', async (req, res) => {\n  try {\n    // Your logic here\n    res.json({ success: true, data: {} });\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});`,
      language: 'javascript',
      tags: ['express', 'api', 'backend'],
      category: 'Backend',
      favorite: false,
      createdAt: Date.now(),
    },
    {
      id: '3',
      title: 'SQL Query Template',
      description: 'Common SQL query patterns',
      content: `SELECT \n  column1,\n  column2,\n  COUNT(*) as count\nFROM table_name\nWHERE condition = 'value'\nGROUP BY column1, column2\nORDER BY count DESC\nLIMIT 10;`,
      language: 'sql',
      tags: ['sql', 'database', 'query'],
      category: 'Database',
      favorite: true,
      createdAt: Date.now(),
    },
    {
      id: '4',
      title: 'Docker Compose',
      description: 'Docker compose file template',
      content: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n    volumes:\n      - ./:/app\n    depends_on:\n      - db\n  db:\n    image: postgres:14\n    environment:\n      - POSTGRES_PASSWORD=password\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n\nvolumes:\n  postgres_data:`,
      language: 'yaml',
      tags: ['docker', 'devops', 'container'],
      category: 'DevOps',
      favorite: false,
      createdAt: Date.now(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [showNewSnippet, setShowNewSnippet] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    description: '',
    content: '',
    language: 'javascript',
    tags: [],
    category: 'General',
  });

  const { addClip } = useClipStore();

  // Get unique categories
  const categories = ['All', ...new Set(snippets.map(s => s.category))];

  // Filter snippets
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || snippet.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopySnippet = async (snippet) => {
    await addClip(snippet.content);
    navigator.clipboard.writeText(snippet.content);
  };

  const handleToggleFavorite = (id) => {
    setSnippets(snippets.map(s => 
      s.id === id ? { ...s, favorite: !s.favorite } : s
    ));
  };

  const handleDeleteSnippet = (id) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      setSnippets(snippets.filter(s => s.id !== id));
      setSelectedSnippet(null);
    }
  };

  const handleCreateSnippet = () => {
    if (!newSnippet.title || !newSnippet.content) {
      alert('Title and content are required');
      return;
    }

    const snippet = {
      ...newSnippet,
      id: Date.now().toString(),
      favorite: false,
      createdAt: Date.now(),
      tags: newSnippet.tags.filter(t => t.trim()),
    };

    setSnippets([snippet, ...snippets]);
    setShowNewSnippet(false);
    setNewSnippet({
      title: '',
      description: '',
      content: '',
      language: 'javascript',
      tags: [],
      category: 'General',
    });
  };

  const languageColors = {
    javascript: 'bg-yellow-100 text-yellow-800',
    typescript: 'bg-blue-100 text-blue-800',
    python: 'bg-green-100 text-green-800',
    sql: 'bg-purple-100 text-purple-800',
    yaml: 'bg-red-100 text-red-800',
    json: 'bg-gray-100 text-gray-800',
    html: 'bg-orange-100 text-orange-800',
    css: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Snippet Library</h1>
              <p className="text-sm text-zinc-500">{snippets.length} snippets</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewSnippet(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            New Snippet
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets..."
              className="w-full px-4 py-2 pl-10 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Snippets List */}
        <div className="w-1/3 border-r border-zinc-200 overflow-y-auto bg-white">
          {filteredSnippets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-lg">No snippets found</p>
              <p className="text-sm mt-2">Try a different search or create a new snippet</p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                onClick={() => setSelectedSnippet(snippet)}
                className={`p-4 border-b border-zinc-200 cursor-pointer transition-colors ${
                  selectedSnippet?.id === snippet.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-zinc-900">{snippet.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(snippet.id);
                    }}
                    className="text-xl"
                  >
                    {snippet.favorite ? '⭐' : '☆'}
                  </button>
                </div>
                <p className="text-sm text-zinc-600 mb-2">{snippet.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${languageColors[snippet.language] || 'bg-gray-100 text-gray-800'}`}>
                    {snippet.language}
                  </span>
                  {snippet.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-zinc-100 text-zinc-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {snippet.tags.length > 2 && (
                    <span className="text-xs text-zinc-500">+{snippet.tags.length - 2}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Snippet Detail */}
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {selectedSnippet ? (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">{selectedSnippet.title}</h2>
                    <p className="text-zinc-600">{selectedSnippet.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(selectedSnippet.id)}
                    className="text-3xl"
                  >
                    {selectedSnippet.favorite ? '⭐' : '☆'}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`px-3 py-1 text-sm font-medium rounded-lg ${languageColors[selectedSnippet.language] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedSnippet.language}
                  </span>
                  <span className="px-3 py-1 text-sm bg-zinc-100 text-zinc-600 rounded-lg">
                    {selectedSnippet.category}
                  </span>
                  {selectedSnippet.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopySnippet(selectedSnippet)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📋</span>
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => handleDeleteSnippet(selectedSnippet.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Code</h3>
                <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{selectedSnippet.content}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <p className="text-xl mb-2">📚</p>
                <p className="text-lg">Select a snippet to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Snippet Modal */}
      {showNewSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-2xl font-bold text-zinc-900">Create New Snippet</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                  placeholder="e.g., React Hook Template"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                  placeholder="Brief description of the snippet"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Language
                  </label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="yaml">YAML</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newSnippet.category}
                    onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value })}
                    placeholder="e.g., React, Backend"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSnippet.tags.join(', ')}
                  onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value.split(',').map(t => t.trim()) })}
                  placeholder="react, hooks, template"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Code *
                </label>
                <textarea
                  value={newSnippet.content}
                  onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                  placeholder="Paste your code here..."
                  rows={10}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 flex gap-3">
              <button
                onClick={() => setShowNewSnippet(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSnippet}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetLibrary;
