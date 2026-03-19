const axios = require("axios");
const { calculateCompositeScore } = require("./composite-score");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  let { phoneNumber } = JSON.parse(event.body);

  phoneNumber = phoneNumber.replace(/\D/g, "");
  if (!phoneNumber.startsWith("1")) {
    phoneNumber = "1" + phoneNumber;
  }

  try {
    const [ipqsRes, abstractRes] = await Promise.all([
      axios.get(
        `${process.env.IPQS_API_URL}/${process.env.IPQS_API_KEY}/${phoneNumber}?country[]=US&country[]=UK&country[]=CA`
      ),
      axios.get(
        `${process.env.ABSTRACT_API_URL}`, { params: { api_key: process.env.ABSTRACT_API_KEY, phone: phoneNumber } }
      ),
    ]);

    const ipqs = ipqsRes.data;
    const abstract = abstractRes.data;

    const ipqsVoip = ipqs.VOIP === true;
    const abstractVoip = abstract.phone_validation?.is_voip === true;
    const confirmedVoip = ipqsVoip && abstractVoip;

    const lineType = abstract.phone_carrier?.line_type || ipqs.line_type || null;

    const { compositeScore, riskLevel, breakdown } = calculateCompositeScore(ipqs, abstract);

    const merged = {
      ...ipqs,
      VOIP: confirmedVoip,
      line_type: lineType,
      fraud_score: compositeScore,
      risk_level: riskLevel,
      score_breakdown: breakdown,
      ipqs_raw_score: ipqs.fraud_score,
      abstractRiskLevel: abstract.phone_risk?.risk_level || null,
    };

    return { statusCode: 200, headers, body: JSON.stringify(merged) };
  } catch (error) {
    console.error(error.response?.data || error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Phone risk check failed" }) };
  }
};
