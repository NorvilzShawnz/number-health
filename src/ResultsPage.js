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
  fraudScore:    'IPQualityScore fraud score (0-100). Higher scores indicate greater risk. Any score below 75 is considered not suspicious.',
  zipCode:       'The zip code associated with this phone number.',
};

const RECOMMENDATIONS = {
  spammer: {
    title: 'Remove "Spammer" Flag from Your Number',
    severity: 'critical',
    steps: [
      'Register your number at freecallerregistry.com — free, takes minutes, and pushes your verified business identity to AT&T (Hiya), T-Mobile (First Orion), and Verizon (TNS) simultaneously.',
      'Submit a dispute to IPQualityScore at ipqualityscore.com/contact explaining you operate a legitimate AI voice service.',
      'Email removal requests to the major blocklists: nomorobo.com/contact, support@youmail.com, and support@robokiller.com.',
      'Work with your carrier to confirm you have A-level STIR/SHAKEN attestation — without it, your AI calls are treated as unverified by receiving carriers.',
      'Audit your call patterns: high volume, short call durations, and rapid redialing are the primary triggers. Throttle calls per number and spread volume across multiple numbers.',
      'Retire this number from active campaigns and let it rest while disputes are processed — continued use will re-trigger the flag.',
    ],
  },
  recentAbuse: {
    title: 'Clear "Recent Abuse" Flag',
    severity: 'critical',
    steps: [
      'Pause outbound calls from this number immediately — active calling while flagged for abuse will worsen the score and get the number blocked at the carrier level.',
      'File a dispute with IPQualityScore at ipqualityscore.com/contact with documentation of your business and intended call use case.',
      'Check with your carrier if this number is being spoofed by a third party generating abuse signals independent of your calls.',
      'Register at freecallerregistry.com to assert your verified business identity while the dispute is processed.',
      'If the flag does not clear within 2–3 weeks, retire the number and provision a fresh one — then register it on freecallerregistry.com before placing any calls.',
    ],
  },
  risky: {
    title: 'Remove "Risky" Flag from Your Number',
    severity: 'high',
    steps: [
      'Register at freecallerregistry.com — this is the single most effective step and directly informs the analytics engines used by the three major US carriers.',
      'Apply for Hiya Branded Calling at hiya.com to display your company name and call reason on outbound calls, which reduces hang-ups and complaint rates that feed the "Risky" score.',
      'Dispute the flag with IPQualityScore at ipqualityscore.com/contact.',
      'Ask your carrier to provision A-level STIR/SHAKEN attestation for this number, confirming it belongs to a verified business.',
      'Reduce call velocity on this number (fewer calls per hour) — AI dialers hitting high volumes on a single number are a primary signal for the "Risky" label.',
      'Monitor your number\'s standing continuously with a tool like Numeracle (numeracle.com) or Call Confident (callconfident.com).',
    ],
  },
  leaked: {
    title: 'Number Exposed in a Data Breach',
    severity: 'medium',
    steps: [
      'A leaked number is more likely to be pre-blocked by recipients\' spam filters. Register at freecallerregistry.com to reassert it as a verified business number.',
      'Watch your answer rates on this number closely — a sustained drop signals it may be bulk-blocked even if no flag shows yet.',
      'If answer rates don\'t recover after registration and dispute, retire the number and provision a replacement from your carrier before it accumulates further flags.',
    ],
  },
  voip: {
    title: 'Improve Deliverability for VOIP Number',
    severity: 'medium',
    steps: [
      'VOIP numbers start with lower carrier trust scores. Offset this by registering at freecallerregistry.com and securing A-level STIR/SHAKEN attestation from your provider.',
      'Apply for Hiya Branded Calling (hiya.com) — a branded VOIP number can reach answer rates close to traditional carrier lines.',
      'If your VOIP provider cannot issue A-level attestation, consider migrating your AI calling numbers to a carrier-grade (non-VOIP) line, which carries a higher baseline trust score.',
      'Use a reputation monitoring service like Numeracle to track how carriers are scoring this number over time.',
    ],
  },
  prepaid: {
    title: 'Prepaid Number — Lower Trust Baseline',
    severity: 'low',
    steps: [
      'Prepaid lines are scored lower by carrier spam-detection algorithms, which will hurt AI call answer rates.',
      'Migrate your AI voice numbers to a postpaid or business carrier plan — these have meaningfully stronger default reputations.',
      'Register the number at freecallerregistry.com regardless of line type to layer a verified business identity on top of the prepaid baseline.',
    ],
  },
  doNotCall: {
    title: 'Your Number Is on the DNC Registry',
    severity: 'high',
    steps: [
      'A number used for outbound AI calls should not be on the DNC registry itself. Investigate how it was registered and request removal through donotcall.gov if it was listed in error.',
      'Ensure your AI dialer is scrubbing contact lists against the National DNC Registry at least every 31 days before campaigns go out — failure to do so carries fines up to $51,744 per violation.',
      'Only place AI calls between 8:00 AM – 9:00 PM in the recipient\'s local time zone.',
    ],
  },
  tcpaBlacklist: {
    title: 'TCPA Blacklist — Serious Legal Exposure',
    severity: 'critical',
    steps: [
      'If this is a number in your contact list that your AI system calls: remove it immediately. TCPA blacklist numbers belong to known litigants who actively sue for unsolicited contact — fines are $500–$1,500 per call.',
      'Integrate a real-time TCPA scrubbing API (e.g. tcpalitigatorlist.com or blacklistalliance.com) directly into your AI dialer so these numbers are blocked before the call is placed.',
      'If this is one of your own outbound numbers: consult legal counsel — operating an AI voice system from a TCPA-listed number creates significant liability.',
      'Maintain an internal suppression list and honor all opt-out requests for a minimum of 5 years.',
    ],
  },
  highFraudScore: {
    title: 'High Fraud Score on Your Number',
    severity: 'high',
    steps: [
      'Carriers are likely suppressing or labeling your AI calls from this number. Register at freecallerregistry.com first — it directly informs the analytics engines scoring your calls.',
      'Dispute the score with IPQualityScore at ipqualityscore.com/contact, noting your business type and typical call volume.',
      'Throttle call volume on this number while the dispute is active — high call frequency is the biggest contributor to elevated fraud scores for AI dialers.',
      'Ensure your carrier has issued A-level STIR/SHAKEN attestation for this number to counter the fraud score with a verified identity signal.',
      'If the score does not improve within a few weeks, retire this number and provision a fresh one — register it on freecallerregistry.com before your first call.',
    ],
  },
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

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

const SEVERITY_LABELS = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
};

function RecommendationCard({ rec }) {
  return (
    <div className={`rec-card rec-${rec.severity}`}>
      <div className="rec-card-header">
        <span className="rec-title">{rec.title}</span>
        <span className={`rec-badge rec-badge-${rec.severity}`}>{SEVERITY_LABELS[rec.severity]}</span>
      </div>
      <ul className="rec-steps">
        {rec.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationsPanel({ results }) {
  const activeKeys = new Set();

  results.forEach(r => {
    if (r.spammer)       activeKeys.add('spammer');
    if (r.recentAbuse)   activeKeys.add('recentAbuse');
    if (r.leaked)        activeKeys.add('leaked');
    if (r.risky)         activeKeys.add('risky');
    if (r.voip)          activeKeys.add('voip');
    if (r.prepaid)       activeKeys.add('prepaid');
    if (r.doNotCall)     activeKeys.add('doNotCall');
    if (r.tcpaBlacklist) activeKeys.add('tcpaBlacklist');
    if (r.fraudScore != null && r.fraudScore >= 75) activeKeys.add('highFraudScore');
  });

  const recs = Object.entries(RECOMMENDATIONS)
    .filter(([key]) => activeKeys.has(key))
    .sort(([, a], [, b]) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="rec-panel">
      <div className="rec-panel-header">
        <span className="rec-panel-title">What To Do</span>
        <span className="rec-panel-subtitle">
          {recs.length === 0
            ? 'All numbers look clean — no action needed.'
            : `${recs.length} issue${recs.length !== 1 ? 's' : ''} affecting call deliverability.`}
        </span>
      </div>
      {recs.length === 0 ? (
        <div className="rec-all-clear">
          <span className="rec-all-clear-icon">✓</span>
          <span>All numbers look clean. No action needed.</span>
        </div>
      ) : (
        <div className="rec-list">
          {recs.map(([key, rec]) => (
            <RecommendationCard key={key} rec={rec} />
          ))}
        </div>
      )}
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
        <div className="results-body">
          <div className="results-list">
            {results.map((result, i) => (
              <ResultCard key={i} result={result} />
            ))}
          </div>
          <RecommendationsPanel results={results} />
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
