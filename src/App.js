import { useState, useRef } from 'react';
import './App.css';
import { validatePhoneNumber, scamRiskCheck } from './api';
import ResultsPage from './ResultsPage';

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [fileInfo, setFileInfo] = useState(null); // { name, count } when a file is loaded
  const [results, setResults] = useState([]);
  const [page, setPage] = useState('input');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef(null);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (index, value) => {
    const updated = [...phoneNumbers];
    updated[index] = formatPhoneNumber(value);
    setPhoneNumbers(updated);
  };

  const addNumber = () => setPhoneNumbers([...phoneNumbers, '']);
  const removeNumber = (index) => setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/[\r\n,]+/);
      const parsed = lines
        .map(l => l.replace(/\D/g, ''))
        .filter(d => d.length === 10)
        .map(d => formatPhoneNumber(d));
      if (parsed.length === 0) {
        alert('No valid 10-digit phone numbers found in the file.');
        return;
      }
      setPhoneNumbers(parsed);
      setFileInfo({ name: file.name, count: parsed.length });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearFile = () => {
    setFileInfo(null);
    setPhoneNumbers(['']);
  };

  const handleSubmit = async () => {
    const entries = phoneNumbers
      .map(p => ({ formatted: p, digits: p.replace(/\D/g, '') }))
      .filter(e => e.digits.length === 10);

    if (entries.length === 0) {
      alert('Please enter at least one valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: entries.length });

    try {
      const allResults = await Promise.all(
        entries.map(async ({ formatted, digits }) => {
          const [data, scamData] = await Promise.all([
            validatePhoneNumber(digits),
            scamRiskCheck(digits),
          ]);
          setProgress(p => ({ ...p, done: p.done + 1 }));
          return {
            phoneNumber: formatted,
            valid: scamData.valid ?? data.valid,
            active: scamData.active,
            location: scamData.city && scamData.region
              ? `${scamData.city}, ${scamData.region}`
              : data.location,
            lineType: scamData.line_type || data.line_type,
            carrier: scamData.carrier || data.carrier,
            fraudScore: scamData.fraud_score,
            ipqsRawScore: scamData.ipqs_raw_score,
            riskLevel: scamData.risk_level,
            scoreBreakdown: scamData.score_breakdown,
            spammer: scamData.spammer,
            recentAbuse: scamData.recent_abuse,
            risky: scamData.risky,
            voip: scamData.VOIP,
            prepaid: scamData.prepaid,
            doNotCall: scamData.do_not_call,
            leaked: scamData.leaked,
            tcpaBlacklist: scamData.tcpa_blacklist,
            zipCode: scamData.zip_code,
          };
        })
      );

      setResults(allResults);
      setPage('results');
    } finally {
      setLoading(false);
    }
  };

  if (page === 'results') {
    return (
      <ResultsPage
        results={results}
        onBack={() => {
          setPage('input');
          setPhoneNumbers(['']);
        }}
      />
    );
  }

  const validCount = phoneNumbers.filter(p => p.replace(/\D/g, '').length === 10).length;

  return (
    <div className="App">
      <header className="App-header">
        <div className="phone-card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h2>Phone Number Lookup</h2>
          <p>Enter numbers manually or upload a .txt file</p>

          {fileInfo ? (
            <div className="file-loaded-box">
              <div className="file-loaded-info">
                <span className="file-loaded-icon">📄</span>
                <div>
                  <div className="file-loaded-name">{fileInfo.name}</div>
                  <div className="file-loaded-count">{fileInfo.count} valid numbers loaded</div>
                </div>
              </div>
              <button className="file-clear-btn" onClick={clearFile} disabled={loading}>✕</button>
            </div>
          ) : (
            <>
              <div className="phone-input-list">
                {phoneNumbers.map((number, i) => (
                  <div key={i} className="phone-input-row">
                    <input
                      className="phone-input"
                      type="tel"
                      value={number}
                      onChange={e => handleChange(i, e.target.value)}
                      placeholder="(555) 555-5555"
                      maxLength={14}
                      disabled={loading}
                    />
                    {phoneNumbers.length > 1 && (
                      <button
                        className="remove-btn"
                        onClick={() => removeNumber(i)}
                        disabled={loading}
                        aria-label="Remove"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>

              {phoneNumbers.length < 10 && (
                <button className="add-btn" onClick={addNumber} disabled={loading}>
                  + Add another number
                </button>
              )}

              <div className="upload-divider"><span>or</span></div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button className="upload-btn" onClick={() => fileInputRef.current.click()} disabled={loading}>
                Upload .txt file
              </button>
            </>
          )}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading || validCount === 0}
          >
            {loading
              ? `Checking ${progress.done} / ${progress.total}...`
              : validCount > 1 ? `Check ${validCount} Numbers` : 'Check Number'}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
