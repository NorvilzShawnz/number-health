import { useState } from 'react';
import './App.css';
import { validatePhoneNumber, scamRiskCheck } from './api';
import ResultsPage from './ResultsPage';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState('input');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async () => {
    const digits = phoneNumber.replace(/\D/g, '');

    if (digits.length !== 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const [data, scamData] = await Promise.all([
        validatePhoneNumber(digits),
        scamRiskCheck(digits),
      ]);

      console.log('Phone validation data:', data);
      console.log('Telesign scam risk data:', scamData);

      setResults([{
        phoneNumber,
        valid: data.valid,
        location: data.location,
        lineType: data.line_type,
        carrier: data.carrier,
        riskLevel: scamData.risk?.level,
        riskRecommendation: scamData.risk?.recommendation,
      }]);
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
          setPhoneNumber('');
        }}
      />
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="phone-card">
          <h2>Phone Number Lookup</h2>
          <p>Enter a number to check its validity and scam risk</p>
          <input
            className="phone-input"
            type="tel"
            value={phoneNumber}
            onChange={handleChange}
            placeholder="(555) 555-5555"
            maxLength={14}
            disabled={loading}
          />
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Checking...' : 'Check Number'}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
