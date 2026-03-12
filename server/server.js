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
  const { phoneNumber } = req.body;

  const auth = Buffer.from(
    `${process.env.TELESIGN_CUSTOMER_ID}:${process.env.TELESIGN_API_KEY}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://detect.telesign.com/intelligence/phone",
      `phone_number=${phoneNumber}&account_lifecycle_event=create`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Telesign request failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});