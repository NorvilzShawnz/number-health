const axios = require("axios");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Authenticate with a shared API key
  const apiKey = event.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.WEBHOOK_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized: invalid or missing API key" }) };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch (e) {
    console.error("Raw body received:", JSON.stringify(event.body));
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON", received: event.body }) };
  }
  let { phoneNumber } = parsed;
  if (!phoneNumber) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "phoneNumber is required" }) };
  }

  phoneNumber = phoneNumber.replace(/\D/g, "");
  if (!phoneNumber.startsWith("1")) {
    phoneNumber = "1" + phoneNumber;
  }
  const formattedNumber = "+" + phoneNumber;

  try {
    const [validateRes, scamRes] = await Promise.all([
      axios.get(
        `${process.env.VERIFY_API_URL}?access_key=${process.env.VERIFY_API_KEY}&number=${formattedNumber}`
      ),
      axios.get(
        `${process.env.IPQS_API_URL}/${process.env.IPQS_API_KEY}/${phoneNumber}?country[]=US&country[]=UK&country[]=CA`
      ),
    ]);

    const data = validateRes.data;
    const scamData = scamRes.data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        phoneNumber: formattedNumber,
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
        zipCode: scamData.zip_code,
      }),
    };
  } catch (error) {
    console.error(error.response?.data || error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Number health check failed" }) };
  }
};
