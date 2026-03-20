/**
 * Composite fraud score algorithm combining IPQualityScore and Abstract API signals.
 *
 * Designed for outbound AI calling context:
 *  - IPQS "risky" flag is heavily discounted (it penalizes robocalls, which overlaps
 *    with legitimate AI outbound calling).
 *  - VOIP is only penalized when both APIs agree.
 *  - Cross-validated signals (both APIs confirm) carry full weight;
 *    single-source signals carry reduced weight.
 *
 * Returns { compositeScore, riskLevel, breakdown } where breakdown lists
 * every signal that contributed points so the score is fully transparent.
 */

function calculateCompositeScore(ipqs, abstract) {
  const breakdown = [];
  let score = 0;

  const add = (points, label) => {
    if (points > 0) {
      breakdown.push({ signal: label, points });
      score += points;
    }
  };

  // ── Cross-validated signals (highest confidence) ────────────────────

  // VOIP: only penalize when both APIs agree
  const ipqsVoip = ipqs.VOIP === true;
  const abstractVoip = abstract.phone_validation?.is_voip === true;
  if (ipqsVoip && abstractVoip) {
    add(15, "VOIP confirmed (IPQS + Abstract)");
  }

  // Abuse: cross-check IPQS recent_abuse with Abstract is_abuse_detected
  const ipqsAbuse = ipqs.recent_abuse === true;
  const abstractAbuse = abstract.phone_risk?.is_abuse_detected === true;
  if (ipqsAbuse && abstractAbuse) {
    add(25, "Recent abuse confirmed (IPQS + Abstract)");
  } else if (ipqsAbuse) {
    add(12, "Recent abuse (IPQS only)");
  } else if (abstractAbuse) {
    add(12, "Abuse detected (Abstract only)");
  }

  // ── IPQS-only signals ──────────────────────────────────────────────

  if (ipqs.spammer === true) {
    add(20, "Spammer (IPQS)");
  }

  if (ipqs.leaked === true) {
    add(10, "Leaked in data breach (IPQS)");
  }

  if (ipqs.do_not_call === true) {
    add(10, "Do Not Call list (IPQS)");
  }

  if (ipqs.tcpa_blacklist === true) {
    add(8, "TCPA blacklist (IPQS)");
  }

  if (ipqs.prepaid === true) {
    add(5, "Prepaid line (IPQS)");
  }

  // "risky" is heavily discounted — IPQS defines it as "fraudulent activity,
  // scams, robocalls, fake accounts" and the robocall overlap catches
  // legitimate AI outbound callers.
  if (ipqs.risky === true) {
    add(3, "Risky flag (IPQS — discounted, robocall overlap)");
  }

  // ── Abstract-only signals ──────────────────────────────────────────

  if (abstract.phone_risk?.is_disposable === true) {
    add(20, "Disposable number (Abstract)");
  }

  const abstractRisk = abstract.phone_risk?.risk_level;
  if (abstractRisk === "high") {
    add(15, "High risk level (Abstract)");
  } else if (abstractRisk === "medium") {
    add(8, "Medium risk level (Abstract)");
  }

  // ── Validity / activity checks ─────────────────────────────────────

  if (ipqs.valid === false) {
    add(15, "Invalid number (IPQS)");
  }

  if (ipqs.active === false) {
    add(10, "Inactive number (IPQS)");
  }

  const compositeScore = Math.min(score, 100);

  let riskLevel;
  if (compositeScore <= 20)      riskLevel = "Low Risk";
  else if (compositeScore <= 45) riskLevel = "Medium Risk";
  else if (compositeScore <= 70) riskLevel = "High Risk";
  else                           riskLevel = "Critical Risk";

  return { compositeScore, riskLevel, breakdown };
}

module.exports = { calculateCompositeScore };
