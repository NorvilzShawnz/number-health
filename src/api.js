

export const validatePhoneNumber = async (phoneNumber) => {
  try {
    const res = await fetch("/.netlify/functions/validate-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error calling backend:", err);
    return null;
  }
};

export const scamRiskCheck = async (phoneNumber) => {
  try {
    const res = await fetch("/.netlify/functions/scam-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    return await res.json();
  } catch (err) {
    console.error("Error calling backend:", err);
    return null;
  }
};