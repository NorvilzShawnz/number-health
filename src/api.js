const apiKey = process.env.REACT_APP_NUMVERIFY_API_KEY;

export const validatePhoneNumber = async (phoneNumber) => {
  const fullNumber = `1${phoneNumber}`;

  const response = await fetch(
    `https://apilayer.net/api/validate?access_key=${apiKey}&number=${fullNumber}`
  );

  const data = await response.json();
  return data;
};