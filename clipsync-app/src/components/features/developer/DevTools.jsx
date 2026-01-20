import { useState } from 'react';
import useClipStore from '../../../store/useClipStore';

const DevTools = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('regex');
  const { addClip } = useClipStore();

  // Regex Tester State
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestString, setRegexTestString] = useState('');
  const [regexMatches, setRegexMatches] = useState([]);
  const [regexError, setRegexError] = useState('');

  // JSON Path Tester State
  const [jsonInput, setJsonInput] = useState('{\n  "user": {\n    "name": "John",\n    "age": 30\n  }\n}');
  const [jsonPath, setJsonPath] = useState('$.user.name');
  const [jsonResult, setJsonResult] = useState('');

  // Diff Tool State
  const [diffText1, setDiffText1] = useState('');
  const [diffText2, setDiffText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);

  // API Tester State
  const [apiUrl, setApiUrl] = useState('https://api.github.com/users/github');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiHeaders, setApiHeaders] = useState('');
  const [apiBody, setApiBody] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  // Color Picker State
  const [pickedColor, setPickedColor] = useState('#3B82F6');

  // Hash Calculator State
  const [hashInput, setHashInput] = useState('');
  const [hashResults, setHashResults] = useState({});

  // Base64 Tool State
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState('encode');

  // Regex Tester
  const testRegex = () => {
    try {
      setRegexError('');
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = [];
      let match;
      
      if (regexFlags.includes('g')) {
        while ((match = regex.exec(regexTestString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(regexTestString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      setRegexMatches(matches);
    } catch (error) {
      setRegexError(error.message);
      setRegexMatches([]);
    }
  };

  // JSON Path Tester
  const testJsonPath = () => {
    try {
      const json = JSON.parse(jsonInput);
      // Simple JSON path implementation
      const path = jsonPath.replace('$.', '').split('.');
      let result = json;
      
      for (const key of path) {
        if (result && typeof result === 'object') {
          result = result[key];
        } else {
          throw new Error('Invalid path');
        }
      }
      
      setJsonResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setJsonResult(`Error: ${error.message}`);
    }
  };

  // Diff Tool
  const calculateDiff = () => {
    const lines1 = diffText1.split('\n');
    const lines2 = diffText2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    const diff = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        diff.push({ type: 'equal', line: line1, lineNum: i + 1 });
      } else if (!line1) {
        diff.push({ type: 'added', line: line2, lineNum: i + 1 });
      } else if (!line2) {
        diff.push({ type: 'removed', line: line1, lineNum: i + 1 });
      } else {
        diff.push({ type: 'changed', line1, line2, lineNum: i + 1 });
      }
    }
    
    setDiffResult(diff);
  };

  // API Tester
  const testAPI = async () => {
    setApiLoading(true);
    try {
      const headers = apiHeaders ? JSON.parse(apiHeaders) : {};
      const options = {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (apiMethod !== 'GET' && apiBody) {
        options.body = apiBody;
      }

      const response = await fetch(apiUrl, options);
      const data = await response.json();
      
      setApiResponse(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      }, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Hash Calculator
  const calculateHashes = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    
    try {
      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      const sha256Array = Array.from(new Uint8Array(sha256Buffer));
      const sha256 = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      const sha1Array = Array.from(new Uint8Array(sha1Buffer));
      const sha1 = sha1Array.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
      const sha512Array = Array.from(new Uint8Array(sha512Buffer));
      const sha512 = sha512Array.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashResults({ sha256, sha1, sha512 });
    } catch (error) {
      console.error('Hash calculation error:', error);
    }
  };

  // Base64 Tool
  const processBase64 = () => {
    try {
      if (base64Mode === 'encode') {
        setBase64Output(btoa(unescape(encodeURIComponent(base64Input))));
      } else {
        setBase64Output(decodeURIComponent(escape(atob(base64Input))));
      }
    } catch (error) {
      setBase64Output(`Error: ${error.message}`);
    }
  };

  const tabs = [
    { id: 'regex', name: 'Regex Tester', icon: '🔍' },
    { id: 'json', name: 'JSON Path', icon: '📊' },
    { id: 'diff', name: 'Diff Tool', icon: '📏' },
    { id: 'api', name: 'API Tester', icon: '🌐' },
    { id: 'color', name: 'Color Picker', icon: '🎨' },
    { id: 'hash', name: 'Hash Calculator', icon: '#️⃣' },
    { id: 'base64', name: 'Base64', icon: '🔐' },
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
              <h1 className="text-2xl font-bold text-zinc-900">Developer Tools</h1>
              <p className="text-sm text-zinc-500">Professional utilities for developers</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
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
        {/* Regex Tester */}
        {activeTab === 'regex' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Regular Expression Tester</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Pattern</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      placeholder="e.g., \d{3}-\d{3}-\d{4}"
                      className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <input
                      type="text"
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="Flags"
                      className="w-20 px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Flags: g (global), i (case-insensitive), m (multiline)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Test String</label>
                  <textarea
                    value={regexTestString}
                    onChange={(e) => setRegexTestString(e.target.value)}
                    placeholder="Enter text to test against the pattern..."
                    rows={6}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <button
                  onClick={testRegex}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Test Regex
                </button>

                {regexError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {regexError}
                  </div>
                )}

                {regexMatches.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {regexMatches.length} match{regexMatches.length !== 1 ? 'es' : ''} found
                    </h3>
                    <div className="space-y-2">
                      {regexMatches.map((match, index) => (
                        <div key={index} className="p-2 bg-white rounded border border-green-200">
                          <div className="font-mono text-sm text-green-700">&quot;{match.match}&quot;</div>
                          <div className="text-xs text-green-600 mt-1">
                            Index: {match.index}
                            {match.groups.length > 0 && ` | Groups: ${match.groups.join(', ')}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JSON Path Tester */}
        {activeTab === 'json' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">JSON Path Tester</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">JSON Input</label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">JSON Path</label>
                  <input
                    type="text"
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="$.user.name"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  onClick={testJsonPath}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Test Path
                </button>

                {jsonResult && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <h3 className="font-semibold text-zinc-800 mb-2">Result:</h3>
                    <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap">{jsonResult}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diff Tool */}
        {activeTab === 'diff' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Text Diff Tool</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Text 1</label>
                  <textarea
                    value={diffText1}
                    onChange={(e) => setDiffText1(e.target.value)}
                    placeholder="Enter first text..."
                    rows={10}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Text 2</label>
                  <textarea
                    value={diffText2}
                    onChange={(e) => setDiffText2(e.target.value)}
                    placeholder="Enter second text..."
                    rows={10}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              <button
                onClick={calculateDiff}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
              >
                Compare
              </button>

              {diffResult.length > 0 && (
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  {diffResult.map((item, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 font-mono text-sm border-b border-zinc-200 last:border-b-0 ${
                        item.type === 'equal' ? 'bg-white' :
                        item.type === 'added' ? 'bg-green-50 text-green-700' :
                        item.type === 'removed' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50'
                      }`}
                    >
                      <span className="text-zinc-400 mr-4">{item.lineNum}</span>
                      {item.type === 'changed' ? (
                        <>
                          <div className="text-red-700">- {item.line1}</div>
                          <div className="text-green-700">+ {item.line2}</div>
                        </>
                      ) : (
                        <span>{item.line}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Tester */}
        {activeTab === 'api' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">API Tester</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value)}
                    className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                  </select>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Headers (JSON)</label>
                  <textarea
                    value={apiHeaders}
                    onChange={(e) => setApiHeaders(e.target.value)}
                    placeholder='{"Authorization": "Bearer token"}'
                    rows={3}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                {apiMethod !== 'GET' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Body (JSON)</label>
                    <textarea
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={5}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                )}

                <button
                  onClick={testAPI}
                  disabled={apiLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {apiLoading ? 'Sending...' : 'Send Request'}
                </button>

                {apiResponse && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <h3 className="font-semibold text-zinc-800 mb-2">Response:</h3>
                    <pre className="font-mono text-xs text-zinc-700 whitespace-pre-wrap overflow-x-auto">{apiResponse}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Color Picker */}
        {activeTab === 'color' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Color Picker</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={pickedColor}
                    onChange={(e) => setPickedColor(e.target.value)}
                    className="w-32 h-32 rounded-lg cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-zinc-700">HEX</label>
                        <input
                          type="text"
                          value={pickedColor}
                          readOnly
                          className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-700">RGB</label>
                        <input
                          type="text"
                          value={`rgb(${parseInt(pickedColor.slice(1, 3), 16)}, ${parseInt(pickedColor.slice(3, 5), 16)}, ${parseInt(pickedColor.slice(5, 7), 16)})`}
                          readOnly
                          className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addClip(pickedColor);
                    navigator.clipboard.writeText(pickedColor);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Copy HEX to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hash Calculator */}
        {activeTab === 'hash' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Hash Calculator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Input Text</label>
                  <textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="Enter text to hash..."
                    rows={4}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={calculateHashes}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Calculate Hashes
                </button>

                {Object.keys(hashResults).length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(hashResults).map(([algo, hash]) => (
                      <div key={algo} className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-zinc-800 uppercase">{algo}</h3>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(hash);
                              addClip(hash);
                            }}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Copy
                          </button>
                        </div>
                        <code className="text-xs font-mono text-zinc-700 break-all">{hash}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Base64 Tool */}
        {activeTab === 'base64' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Base64 Encoder/Decoder</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setBase64Mode('encode')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      base64Mode === 'encode'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setBase64Mode('decode')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      base64Mode === 'decode'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    Decode
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Input</label>
                  <textarea
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder={base64Mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                    rows={6}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <button
                  onClick={processBase64}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {base64Mode === 'encode' ? 'Encode' : 'Decode'}
                </button>

                {base64Output && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-800">Output:</h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(base64Output);
                          addClip(base64Output);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap break-all">{base64Output}</pre>
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

export default DevTools;
