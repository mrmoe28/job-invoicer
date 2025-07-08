const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Path to the PDF file
const pdfPath = '/Users/edwardharrison/Desktop/Test Solar Agreement.pdf';

async function uploadDocument() {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('File does not exist:', pdfPath);
      return;
    }
    
    console.log('File exists, preparing upload...');
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath));
    form.append('category', 'contract');
    
    console.log('Sending request to API...');
    
    // Send request to API
    const response = await fetch('http://localhost:3000/api/docs', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('Response status:', response.status);
    
    // Parse response
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadDocument();
