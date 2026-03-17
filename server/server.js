const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/validate-phone", async (req, res) => {
  let { phoneNumber } = req.body;

  // Remove all non-digit characters
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // Prepend +1 if no country code is present
  if (!phoneNumber.startsWith("1")) {
    phoneNumber = "1" + phoneNumber;
  }

  // Add + prefix for NumVerify
  const formattedNumber = "+" + phoneNumber;

  try {
    const response = await axios.get(
      `${process.env.VERIFY_API_URL}?access_key=${process.env.VERIFY_API_KEY}&number=${formattedNumber}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Phone validation failed" });
  }
});

app.post("/scam-risk", async (req, res) => {
  let { phoneNumber } = req.body;

  // Remove all non-digit characters and ensure leading 1
  phoneNumber = phoneNumber.replace(/\D/g, "");
  if (!phoneNumber.startsWith("1")) {
    phoneNumber = "1" + phoneNumber;
  }

  try {
    const response = await axios.get(
      `${process.env.IPQS_API_URL}/${process.env.IPQS_API_KEY}/${phoneNumber}?country[]=US&country[]=UK&country[]=CA`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "IPQualityScore request failed" });
  }
});

// Webhook: external sources can POST here to run a full Number Health check
app.post("/webhook/number-health", async (req, res) => {
  // Authenticate with a shared API key sent in the x-api-key header
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
  }

  let { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "phoneNumber is required" });
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

    res.json({
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
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Number health check failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});