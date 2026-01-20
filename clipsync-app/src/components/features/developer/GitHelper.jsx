import { useState } from 'react';
import useClipStore from '../../../store/useClipStore';

const GitHelper = ({ onClose }) => {
  const { addClip } = useClipStore();
  const [activeTab, setActiveTab] = useState('commit');

  // Commit Message State
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('');
  const [commitSubject, setCommitSubject] = useState('');
  const [commitBody, setCommitBody] = useState('');
  const [commitBreaking, setCommitBreaking] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  // Branch Name State
  const [branchType, setBranchType] = useState('feature');
  const [branchDescription, setBranchDescription] = useState('');
  const [branchTicket, setBranchTicket] = useState('');
  const [branchName, setBranchName] = useState('');

  // PR Template State
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [prChanges, setPrChanges] = useState('');
  const [prTesting, setPrTesting] = useState('');
  const [prTemplate, setPrTemplate] = useState('');

  // .gitignore Generator State
  const [gitignoreType, setGitignoreType] = useState('node');
  const [gitignoreContent, setGitignoreContent] = useState('');

  const commitTypes = [
    { value: 'feat', label: '✨ feat', desc: 'A new feature' },
    { value: 'fix', label: '🐛 fix', desc: 'A bug fix' },
    { value: 'docs', label: '📝 docs', desc: 'Documentation only changes' },
    { value: 'style', label: '💄 style', desc: 'Code style changes (formatting, etc)' },
    { value: 'refactor', label: '♻️ refactor', desc: 'Code refactoring' },
    { value: 'perf', label: '⚡ perf', desc: 'Performance improvements' },
    { value: 'test', label: '✅ test', desc: 'Adding or updating tests' },
    { value: 'build', label: '🔨 build', desc: 'Build system changes' },
    { value: 'ci', label: '👷 ci', desc: 'CI configuration changes' },
    { value: 'chore', label: '🔧 chore', desc: 'Other changes' },
  ];

  const branchTypes = [
    { value: 'feature', prefix: 'feature/' },
    { value: 'bugfix', prefix: 'bugfix/' },
    { value: 'hotfix', prefix: 'hotfix/' },
    { value: 'release', prefix: 'release/' },
    { value: 'docs', prefix: 'docs/' },
    { value: 'refactor', prefix: 'refactor/' },
  ];

  const gitignoreTemplates = {
    node: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db`,
    
    python: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
ENV/
env/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store`,
    
    react: `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/`,
    
    java: `# Compiled class file
*.class

# Log file
*.log

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties

# Gradle
.gradle
build/

# IDE
.idea/
*.iml
.vscode/
*.swp`,
  };

  // Generate Commit Message
  const generateCommitMessage = () => {
    let message = commitType;
    
    if (commitScope) {
      message += `(${commitScope})`;
    }
    
    message += `: ${commitSubject}`;
    
    if (commitBody) {
      message += `\n\n${commitBody}`;
    }
    
    if (commitBreaking) {
      message += `\n\nBREAKING CHANGE: ${commitBreaking}`;
    }
    
    setCommitMessage(message);
  };

  // Generate Branch Name
  const generateBranchName = () => {
    const prefix = branchTypes.find(t => t.value === branchType)?.prefix || '';
    const slug = branchDescription
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let name = prefix + slug;
    
    if (branchTicket) {
      name = prefix + branchTicket + '-' + slug;
    }
    
    setBranchName(name);
  };

  // Generate PR Template
  const generatePRTemplate = () => {
    const template = `## ${prTitle}

### Description
${prDescription}

### Changes Made
${prChanges.split('\n').map(line => line ? `- ${line}` : '').join('\n')}

### Testing
${prTesting}

### Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Dependent changes merged

### Screenshots (if applicable)
<!-- Add screenshots here -->

### Related Issues
<!-- Link related issues here -->
`;
    
    setPrTemplate(template);
  };

  // Generate .gitignore
  const generateGitignore = () => {
    setGitignoreContent(gitignoreTemplates[gitignoreType] || '');
  };

  const copyToClipboard = async (text) => {
    await addClip(text);
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'commit', name: 'Commit Message', icon: '💬' },
    { id: 'branch', name: 'Branch Name', icon: '🌿' },
    { id: 'pr', name: 'PR Template', icon: '🔀' },
    { id: 'gitignore', name: '.gitignore', icon: '🚫' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-zinc-900">Git Helper</h1>
              <p className="text-sm text-zinc-500">Generate Git-related content</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto p-6">
        {/* Commit Message Generator */}
        {activeTab === 'commit' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Conventional Commit Message Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {commitTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setCommitType(type.value)}
                        className={`px-4 py-3 rounded-lg text-left transition-colors ${
                          commitType === type.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs opacity-75">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Scope (optional)</label>
                  <input
                    type="text"
                    value={commitScope}
                    onChange={(e) => setCommitScope(e.target.value)}
                    placeholder="e.g., api, ui, auth"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={commitSubject}
                    onChange={(e) => setCommitSubject(e.target.value)}
                    placeholder="Brief description of the change"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Body (optional)</label>
                  <textarea
                    value={commitBody}
                    onChange={(e) => setCommitBody(e.target.value)}
                    placeholder="Detailed description of the change..."
                    rows={4}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Breaking Change (optional)</label>
                  <input
                    type="text"
                    value={commitBreaking}
                    onChange={(e) => setCommitBreaking(e.target.value)}
                    placeholder="Description of breaking change"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={generateCommitMessage}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate Commit Message
                </button>

                {commitMessage && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-800">Generated Message:</h3>
                      <button
                        onClick={() => copyToClipboard(commitMessage)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap">{commitMessage}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Branch Name Generator */}
        {activeTab === 'branch' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Branch Name Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Branch Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {branchTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setBranchType(type.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          branchType === type.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        {type.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Ticket/Issue Number (optional)</label>
                  <input
                    type="text"
                    value={branchTicket}
                    onChange={(e) => setBranchTicket(e.target.value)}
                    placeholder="e.g., JIRA-123, #456"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={branchDescription}
                    onChange={(e) => setBranchDescription(e.target.value)}
                    placeholder="Brief description of the branch"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={generateBranchName}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate Branch Name
                </button>

                {branchName && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-800">Generated Branch Name:</h3>
                      <button
                        onClick={() => copyToClipboard(branchName)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <code className="font-mono text-lg text-zinc-700">{branchName}</code>
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <p className="text-sm text-zinc-600 mb-2">Git command:</p>
                      <code className="text-sm font-mono text-zinc-700 bg-zinc-100 px-2 py-1 rounded">
                        git checkout -b {branchName}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PR Template Generator */}
        {activeTab === 'pr' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Pull Request Template Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">PR Title *</label>
                  <input
                    type="text"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    placeholder="Brief title for the pull request"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Description *</label>
                  <textarea
                    value={prDescription}
                    onChange={(e) => setPrDescription(e.target.value)}
                    placeholder="What does this PR do?"
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Changes Made (one per line)</label>
                  <textarea
                    value={prChanges}
                    onChange={(e) => setPrChanges(e.target.value)}
                    placeholder="Added new feature&#10;Fixed bug in component&#10;Updated documentation"
                    rows={4}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Testing</label>
                  <textarea
                    value={prTesting}
                    onChange={(e) => setPrTesting(e.target.value)}
                    placeholder="How was this tested?"
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={generatePRTemplate}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate PR Template
                </button>

                {prTemplate && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-800">Generated Template:</h3>
                      <button
                        onClick={() => copyToClipboard(prTemplate)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-zinc-700 whitespace-pre-wrap overflow-x-auto">{prTemplate}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* .gitignore Generator */}
        {activeTab === 'gitignore' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">.gitignore Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Project Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(gitignoreTemplates).map(type => (
                      <button
                        key={type}
                        onClick={() => setGitignoreType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                          gitignoreType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateGitignore}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate .gitignore
                </button>

                {gitignoreContent && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-800">.gitignore Content:</h3>
                      <button
                        onClick={() => copyToClipboard(gitignoreContent)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-zinc-700 whitespace-pre-wrap">{gitignoreContent}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHelper;
