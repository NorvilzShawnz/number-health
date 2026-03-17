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

function getRiskLevel(score) {
  if (score == null) return { label: 'Unknown', className: '' };
  if (score <= 24)   return { label: 'Low Risk',      className: 'risk-low' };
  if (score <= 59)   return { label: 'Moderate Risk', className: 'risk-medium' };
  if (score <= 84)   return { label: 'High Risk',     className: 'risk-high' };
  return               { label: 'Critical Risk',  className: 'risk-critical' };
}

function ScoreBar({ score }) {
  const { label, className } = getRiskLevel(score);
  const pct = score ?? 0;
  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span className="score-bar-label">Fraud Score</span>
        <span className={`score-bar-value ${className}`}>
          {score ?? '—'}<span className="score-bar-max"> / 100</span>
        </span>
      </div>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${className}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`score-risk-label ${className}`}>{label}</span>
    </div>
  );
}

function RiskFlags({ result }) {
  const flags = [
    { key: 'spammer',       label: 'Spammer',        active: result.spammer },
    { key: 'recentAbuse',   label: 'Recent Abuse',   active: result.recentAbuse },
    { key: 'leaked',        label: 'Leaked',         active: result.leaked },
    { key: 'voip',          label: 'VOIP',           active: result.voip },
    { key: 'prepaid',       label: 'Prepaid',        active: result.prepaid },
    { key: 'doNotCall',     label: 'Do Not Call',    active: result.doNotCall },
    { key: 'tcpaBlacklist', label: 'TCPA Blacklist', active: result.tcpaBlacklist },
  ];

  const activeFlags = flags.filter(f => f.active);

  if (activeFlags.length === 0) {
    return <div className="risk-flags-none">No risk flags detected</div>;
  }

  return (
    <div className="risk-flags">
      {activeFlags.map(f => (
        <span key={f.key} className="risk-flag-pill">{f.label}</span>
      ))}
    </div>
  );
}

function SignalBreakdown({ result }) {
  const signals = [
    { label: 'Spammer',        value: result.spammer },
    { label: 'Recent Abuse',   value: result.recentAbuse },
    { label: 'Leaked',         value: result.leaked },
    { label: 'Risky',          value: result.risky },
    { label: 'VOIP',           value: result.voip },
    { label: 'Prepaid',        value: result.prepaid },
    { label: 'Do Not Call',    value: result.doNotCall },
    { label: 'TCPA Blacklist', value: result.tcpaBlacklist },
  ];

  return (
    <div className="signal-grid">
      {signals.map(s => (
        <div key={s.label} className="signal-item">
          <span className="signal-label">{s.label}</span>
          <span className={`signal-value ${s.value ? 'signal-yes' : 'signal-no'}`}>
            {s.value ? 'Yes' : 'No'}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResultCard({ result }) {
  const isActive = result.active ?? result.valid;

  const lineTypeLabel = result.lineType
    ? result.lineType.charAt(0).toUpperCase() + result.lineType.slice(1)
    : null;

  return (
    <div className="result-card">
      <div className="result-card-header">
        <div className="result-number-group">
          <StatusIcon ok={isActive} />
          <span className="result-number">{result.phoneNumber}</span>
        </div>
        <span className={`validity-badge ${isActive ? 'valid' : 'invalid'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="result-card-body">
        <div className="result-section-label">Number Details</div>

        <ResultRow label="Line Type" value={lineTypeLabel} />
        <ResultRow label="Carrier"   value={result.carrier} />
        {result.location && (
          <ResultRow label="Location" value={result.location} />
        )}

        <div className="result-divider" />
        <div className="result-section-label">Risk Assessment</div>

        <ScoreBar score={result.fraudScore} />

        <div className="result-section-sublabel">Risk Flags</div>
        <RiskFlags result={result} />

        <div className="result-section-sublabel">Signal Breakdown</div>
        <SignalBreakdown result={result} />
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
