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
      `https://www.ipqualityscore.com/api/json/phone/${process.env.IPQS_API_KEY}/${phoneNumber}?country[]=US&country[]=UK&country[]=CA`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "IPQualityScore request failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});