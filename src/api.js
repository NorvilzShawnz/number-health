

export const validatePhoneNumber = async (phoneNumber) => {
  const fullNumber = `1${phoneNumber}`;

  const response = await fetch(
    `${process.env.REACT_APP_VERIFY_API_URL}?access_key=${process.env.REACT_APP_VERIFY_API_KEY}&number=${fullNumber}`
  );

  const data = await response.json();
  return data;
};