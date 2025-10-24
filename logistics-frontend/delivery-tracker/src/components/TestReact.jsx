// Test that React imports are working correctly
import React, { useState } from 'react';

function TestComponent() {
  const [test, setTest] = useState('working');
  return <div>{test}</div>;
}

export default TestComponent;
