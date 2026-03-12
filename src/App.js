import { useState } from 'react';
import './App.css';
import { validatePhoneNumber } from './api';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

const handleSubmit = async () => {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length !== 10) {
    alert('Please enter a valid 10-digit phone number.');
    console.log('Invalid phone number length:', digits.length);
    return;
  }

  alert(`Phone number submitted: ${phoneNumber}`);

  const data = await validatePhoneNumber(digits);

  if (data.valid) {
    // Actual Phone Number
    console.log(phoneNumber);
    console.log('Phone number is valid:', data.valid);
    console.log('Country:', data.country_name);
    console.log('Location:', data.location);
    console.log('Carrier:', data.carrier);
  } else {
    console.log('Phone number is invalid');
  }
};

  return (
    <div className="App">
      <header className="App-header">
        <h2>Please enter your Phone Number</h2>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          placeholder="(555) 555-5555"
          maxLength={14}
          style={{
            padding: '10px 15px',
            fontSize: '1.2rem',
            borderRadius: '8px',
            border: '2px solid #61dafb',
            outline: 'none',
            marginBottom: '15px',
            width: '220px',
            textAlign: 'center',
            background: '#282c34',
            color: 'white',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 25px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            background: '#61dafb',
            color: '#282c34',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Submit
        </button>
      </header>
    </div>
  );
}


export default App;
