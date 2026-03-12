

export const validatePhoneNumber = async (phoneNumber) => {
  try {
    const res = await fetch("http://localhost:5000/validate-phone", {
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
    const res = await fetch('http://localhost:5000/scam-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error calling backend:', err);
    return null;
  }
};