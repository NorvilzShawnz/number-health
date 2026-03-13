import './ResultsPage.css';

function StatusIcon({ ok }) {
  return <span className={`status-icon ${ok ? 'icon-ok' : 'icon-bad'}`}>{ok ? '✓' : '✗'}</span>;
}

function ResultRow({ label, value, valueClass }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className={`result-value ${valueClass || ''}`}>{value || '—'}</span>
    </div>
  );
}

function ResultCard({ result }) {
  const riskLevel = result.riskLevel?.toLowerCase();
  const riskClass =
    riskLevel === 'high' ? 'risk-high' :
    riskLevel === 'medium' ? 'risk-medium' :
    riskLevel === 'low' ? 'risk-low' : '';

  const lineTypeLabel = result.lineType
    ? result.lineType.charAt(0).toUpperCase() + result.lineType.slice(1)
    : null;

  const riskDisplay = result.riskLevel
    ? `${result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}${result.riskRecommendation ? ` — ${result.riskRecommendation}` : ''}`
    : null;

  return (
    <div className="result-card">
      <div className="result-card-header">
        <div className="result-number-group">
          <StatusIcon ok={result.valid} />
          <span className="result-number">{result.phoneNumber}</span>
        </div>
        <span className={`validity-badge ${result.valid ? 'valid' : 'invalid'}`}>
          {result.valid ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="result-card-body">
        <div className="result-section-label">Number Details</div>

        <ResultRow
          label="In Service"
          value={result.valid ? 'Yes — number is active' : 'No — number is not in service'}
          valueClass={result.valid ? 'text-green' : 'text-red'}
        />
        <ResultRow
          label="Line Type"
          value={lineTypeLabel}
        />
        <ResultRow
          label="Carrier"
          value={result.carrier}
        />
        {result.location && (
          <ResultRow
            label="Location"
            value={result.location}
          />
        )}

        <div className="result-divider" />
        <div className="result-section-label">Risk Assessment</div>

        <ResultRow
          label="Spam / Fraud Risk"
          value={riskDisplay}
          valueClass={riskClass}
        />
        <ResultRow
          label="Reachability Score"
          value={null}
        />
      </div>
    </div>
  );
}

function ResultsPage({ results, onBack }) {
  return (
    <div className="App">
      <div className="results-page">
        <div className="results-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="results-title-group">
            <h2>Lookup Results</h2>
            <p>{results.length} number{results.length !== 1 ? 's' : ''} checked</p>
          </div>
        </div>
        <div className="results-list">
          {results.map((result, i) => (
            <ResultCard key={i} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
