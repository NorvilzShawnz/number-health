import { useState } from 'react';
import './App.css';
import { validatePhoneNumber, scamRiskCheck } from './api';
import ResultsPage from './ResultsPage';

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState('input');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

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
            spammer: scamData.spammer,
            recentAbuse: scamData.recent_abuse,
            risky: scamData.risky,
            voip: scamData.VOIP,
            prepaid: scamData.prepaid,
            doNotCall: scamData.do_not_call,
            leaked: scamData.leaked,
            tcpaBlacklist: scamData.tcpa_blacklist,
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
          <h2>Phone Number Lookup</h2>
          <p>Enter up to 10 numbers to check validity and scam risk</p>

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
