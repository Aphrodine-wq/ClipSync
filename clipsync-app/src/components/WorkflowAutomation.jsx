import { useState } from 'react';
import useClipStore from '../store/useClipStore';

const WorkflowAutomation = ({ onClose }) => {
  const { addClip } = useClipStore();
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'API Response Formatter',
      description: 'Format API responses for documentation',
      steps: [
        { action: 'beautify-json', label: 'Beautify JSON' },
        { action: 'add-markdown', label: 'Wrap in Markdown code block' }
      ],
      enabled: true
    },
    {
      id: '2',
      name: 'SQL Query Formatter',
      description: 'Format and document SQL queries',
      steps: [
        { action: 'format-sql', label: 'Format SQL' },
        { action: 'add-comments', label: 'Add comment header' }
      ],
      enabled: true
    },
    {
      id: '3',
      name: 'Code Documentation',
      description: 'Prepare code for documentation',
      steps: [
        { action: 'add-line-numbers', label: 'Add line numbers' },
        { action: 'syntax-highlight', label: 'Add syntax highlighting' },
        { action: 'add-markdown', label: 'Wrap in Markdown' }
      ],
      enabled: true
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [processing, setProcessing] = useState(false);

  const executeWorkflow = async (workflow) => {
    setProcessing(true);
    let result = inputText;

    try {
      for (const step of workflow.steps) {
        result = await processStep(result, step.action);
      }
      setOutputText(result);
      await addClip(result);
    } catch (error) {
      console.error('Workflow execution error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const processStep = async (text, action) => {
    switch (action) {
      case 'beautify-json':
        return JSON.stringify(JSON.parse(text), null, 2);
      
      case 'format-sql':
        return formatSQL(text);
      
      case 'add-markdown':
        return `\`\`\`\n${text}\n\`\`\``;
      
      case 'add-line-numbers':
        return text.split('\n').map((line, i) => `${i + 1}  ${line}`).join('\n');
      
      case 'add-comments':
        return `-- Query Description\n-- Generated: ${new Date().toLocaleString()}\n\n${text}`;
      
      case 'syntax-highlight':
        return `\`\`\`javascript\n${text}\n\`\`\``;
      
      default:
        return text;
    }
  };

  const formatSQL = (sql) => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                     'INNER JOIN', 'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY'];
    
    let formatted = sql;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${keyword}`);
    });
    
    return formatted.trim();
  };

  const createCustomWorkflow = () => {
    const name = prompt('Enter workflow name:');
    if (!name) return;

    const newWorkflow = {
      id: Date.now().toString(),
      name,
      description: 'Custom workflow',
      steps: [],
      enabled: true
    };

    setWorkflows([...workflows, newWorkflow]);
  };

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
              <h1 className="text-2xl font-bold text-zinc-900">Workflow Automation</h1>
              <p className="text-sm text-zinc-500">Chain multiple transformations together</p>
            </div>
          </div>
          <button
            onClick={createCustomWorkflow}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + Create Workflow
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Workflows List */}
            <div className="col-span-1">
              <h2 className="text-lg font-semibold mb-4">Available Workflows</h2>
              <div className="space-y-3">
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedWorkflow?.id === workflow.id
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-white border border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-zinc-900">{workflow.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        workflow.enabled ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {workflow.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 mb-3">{workflow.description}</p>
                    <div className="space-y-1">
                      {workflow.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Executor */}
            <div className="col-span-2">
              {selectedWorkflow ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">{selectedWorkflow.name}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Input</label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your content here..."
                        rows={10}
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>

                    <button
                      onClick={() => executeWorkflow(selectedWorkflow)}
                      disabled={!inputText || processing}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        `Execute Workflow (${selectedWorkflow.steps.length} steps)`
                      )}
                    </button>

                    {outputText && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-zinc-700">Output</label>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(outputText);
                              addClip(outputText);
                            }}
                            className="px-3 py-1 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <textarea
                          value={outputText}
                          readOnly
                          rows={10}
                          className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-zinc-50 font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Workflow Steps Visualization */}
                  <div className="mt-6 pt-6 border-t border-zinc-200">
                    <h3 className="text-sm font-semibold text-zinc-700 mb-3">Workflow Steps</h3>
                    <div className="flex items-center gap-2">
                      {selectedWorkflow.steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            <div className="font-medium text-blue-900">{index + 1}. {step.label}</div>
                          </div>
                          {index < selectedWorkflow.steps.length - 1 && (
                            <svg className="w-6 h-6 text-zinc-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <svg className="w-16 h-16 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Select a Workflow</h3>
                  <p className="text-zinc-600">Choose a workflow from the list to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAutomation;
