const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/mini-app/locations');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.substring(0, 500)); // Print first 500 chars
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
