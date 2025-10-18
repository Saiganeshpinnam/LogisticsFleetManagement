const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  console.log('JWT_SECRET in .env file:');
  lines.forEach((line, index) => {
    if (line.includes('JWT_SECRET')) {
      console.log(`Line ${index + 1}: ${line}`);
    }
  });

  if (!envContent.includes('JWT_SECRET')) {
    console.log('JWT_SECRET not found in .env file!');
  }
} catch (error) {
  console.error('Error reading .env file:', error.message);
}
