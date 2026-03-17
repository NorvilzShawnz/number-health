import './ResultsPage.css';

const FLAG_TOOLTIPS = {
  spammer:       'Has this number been reported for spam or harassing calls/texts?',
  recentAbuse:   'Has this number been associated with recent or ongoing fraud?',
  leaked:        'Has this number been exposed in an online database breach or compromise?',
  risky:         'Is this number associated with fraudulent activity, scams, or robocalls?',
  voip:          'Is this a Voice Over Internet Protocol (VOIP) or digital phone number?',
  prepaid:       'Is this number associated with a prepaid service plan?',
  doNotCall:     'Is this number listed on any Do Not Call (DNC) lists? (USA & Canada only)',
  tcpaBlacklist: 'Is this number associated with repeated TCPA lawsuit plaintiffs?',
  fraudScore:    'IPQualityScore fraud score (0-100). Higher scores indicate greater risk.',
  zipCode:       'The zip code associated with this phone number.',
};

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
  if (score < 75)    return { label: 'Low Risk',        className: 'risk-low' };
  if (score < 85)    return { label: 'Suspicious',      className: 'risk-medium' };
  if (score < 90)    return { label: 'High Risk',       className: 'risk-high' };
  return               { label: 'Critical Risk',    className: 'risk-critical' };
}

function isHighRisk(result) {
  return result.valid === false || result.active === false || (result.fraudScore != null && result.fraudScore >= 90);
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
        <span key={f.key} className="risk-flag-pill" data-tooltip={FLAG_TOOLTIPS[f.key]}>{f.label}</span>
      ))}
    </div>
  );
}

function SignalBreakdown({ result }) {
  const boolSignals = [
    { key: 'spammer',       label: 'Spammer',        value: result.spammer },
    { key: 'recentAbuse',   label: 'Recent Abuse',   value: result.recentAbuse },
    { key: 'leaked',        label: 'Leaked',         value: result.leaked },
    { key: 'risky',         label: 'Risky',          value: result.risky },
    { key: 'voip',          label: 'VOIP',           value: result.voip },
    { key: 'prepaid',       label: 'Prepaid',        value: result.prepaid },
    { key: 'doNotCall',     label: 'Do Not Call',    value: result.doNotCall },
    { key: 'tcpaBlacklist', label: 'TCPA Blacklist', value: result.tcpaBlacklist },
  ];

  const dataSignals = [
    { key: 'fraudScore', label: 'Fraud Score', value: result.fraudScore ?? '—' },
    { key: 'zipCode',    label: 'Zip Code',    value: result.zipCode || '—' },
  ];

  return (
    <div className="signal-grid">
      {dataSignals.map(s => (
        <div key={s.label} className="signal-item" data-tooltip={FLAG_TOOLTIPS[s.key]}>
          <span className="signal-label">{s.label}</span>
          <span className="signal-value signal-data">{s.value}</span>
        </div>
      ))}
      {boolSignals.map(s => (
        <div key={s.label} className="signal-item" data-tooltip={FLAG_TOOLTIPS[s.key]}>
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
  const highRisk = isHighRisk(result);
  const isActive = result.active ?? result.valid;

  const lineTypeLabel = result.lineType
    ? result.lineType.charAt(0).toUpperCase() + result.lineType.slice(1)
    : null;

  return (
    <div className={`result-card${highRisk ? ' result-card-danger' : ''}`}>
      <div className="result-card-header">
        <div className="result-number-group">
          <StatusIcon ok={!highRisk} />
          <span className="result-number">{result.phoneNumber}</span>
        </div>
        <span className={`validity-badge ${highRisk ? 'invalid' : 'valid'}`}>
          {highRisk ? 'High Risk' : isActive ? 'Active' : 'Inactive'}
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
