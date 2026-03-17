const axios = require("axios");

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
    const response = await axios.get(
      `${process.env.IPQS_API_URL}/${process.env.IPQS_API_KEY}/${phoneNumber}?country[]=US&country[]=UK&country[]=CA`
    );
    return { statusCode: 200, headers, body: JSON.stringify(response.data) };
  } catch (error) {
    console.error(error.response?.data || error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "IPQualityScore request failed" }) };
  }
};
