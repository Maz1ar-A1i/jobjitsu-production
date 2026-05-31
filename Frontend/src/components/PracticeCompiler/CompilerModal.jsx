import React, { useState } from 'react';
import { Play, X, RefreshCw, Terminal } from 'lucide-react';
import './CompilerModal.scss';

export default function CompilerModal({ isOpen, onClose, snippet }) {
  const [code, setCode] = useState(snippet?.starterCode || '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  // Sync state if snippet changes
  React.useEffect(() => {
    if (isOpen && snippet) {
      setCode(snippet.starterCode);
      setOutput('');
      setError(null);
    }
  }, [isOpen, snippet]);

  if (!isOpen || !snippet) return null;

  const runCode = () => {
    setOutput('');
    setError(null);

    // Mock an output console
    let logs = [];
    const originalLog = console.log;
    console.log = function(...args) {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalLog.apply(console, args);
    };

    try {
      // Evaluate the user code safely for demonstration
      new Function(code)();
      setOutput(logs.join('\n') || 'Execution complete. No output.');
    } catch (err) {
      setError(err.toString());
    }

    // Restore original console
    console.log = originalLog;
  };

  const handleReset = () => {
    setCode(snippet.starterCode);
    setOutput('');
    setError(null);
  };

  return (
    <div className="compiler-modal-overlay">
      <div className="compiler-modal">
        <div className="cm-header">
          <div className="cm-title">
            <Terminal size={18} className="cm-icon" />
            <span>JobJitsu JS Compiler</span>
            <span className="cm-badge">{snippet.title}</span>
          </div>
          <button className="cm-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="cm-body">
          <div className="cm-editor-section">
            <div className="cm-toolbar">
              <span>editor.js</span>
              <div className="cm-actions">
                <button className="btn-icon" onClick={handleReset} title="Reset Code"><RefreshCw size={14} /> Reset</button>
                <button className="btn-primary" onClick={runCode}><Play size={14} /> Run Code</button>
              </div>
            </div>
            <textarea 
              className="cm-textarea" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div className="cm-output-section">
            <div className="cm-toolbar">
              <span>Console Output</span>
            </div>
            <div className="cm-console">
              {error ? (
                <div className="cm-error">{error}</div>
              ) : (
                <pre>{output || 'Click "Run Code" to view output.'}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
