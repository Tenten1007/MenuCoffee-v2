const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  results.tests.push({ name: testName, passed, details });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
};

// Test 1: Rate Limiting
const testRateLimiting = async () => {
  console.log('\n🔒 Testing Rate Limiting...');
  
  try {
    const promises = [];
    for (let i = 0; i < 110; i++) {
      promises.push(axios.get(`${BASE_URL}/health`));
    }
    
    const responses = await Promise.allSettled(promises);
    const rateLimited = responses.filter(r => 
      r.status === 'rejected' && 
      r.reason.response?.status === 429
    ).length;
    
    logTest('Rate Limiting', rateLimited > 0, 
      `${rateLimited} requests were rate limited`);
  } catch (error) {
    logTest('Rate Limiting', false, error.message);
  }
};

// Test 2: SQL Injection Prevention
const testSQLInjection = async () => {
  console.log('\n🛡️ Testing SQL Injection Prevention...');
  
  const sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; INSERT INTO users VALUES (1, 'hacker', 'password'); --",
    "admin'--",
    "admin'/*"
  ];
  
  for (const payload of sqlInjectionPayloads) {
    try {
      await axios.post(`${BASE_URL}/staff/login`, {
        username: payload,
        password: 'test'
      });
      logTest(`SQL Injection: ${payload}`, false, 'Request succeeded (vulnerable)');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        logTest(`SQL Injection: ${payload}`, true, 'Request properly rejected');
      } else {
        logTest(`SQL Injection: ${payload}`, false, `Unexpected response: ${error.response?.status}`);
      }
    }
  }
};

// Test 3: XSS Prevention
const testXSS = async () => {
  console.log('\n🚫 Testing XSS Prevention...');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>',
    '&#60;script&#62;alert("XSS")&#60;/script&#62;'
  ];
  
  for (const payload of xssPayloads) {
    try {
      await axios.post(`${BASE_URL}/orders`, {
        customerName: payload,
        items: [{ name: 'test', price: 10, quantity: 1 }]
      });
      logTest(`XSS: ${payload}`, false, 'Request succeeded (vulnerable)');
    } catch (error) {
      if (error.response?.status === 400) {
        logTest(`XSS: ${payload}`, true, 'Request properly rejected');
      } else {
        logTest(`XSS: ${payload}`, false, `Unexpected response: ${error.response?.status}`);
      }
    }
  }
};

// Test 4: File Upload Security
const testFileUpload = async () => {
  console.log('\n📁 Testing File Upload Security...');
  
  // This would require actual file upload testing
  // For now, we'll test the endpoint exists and requires authentication
  try {
    await axios.post(`${BASE_URL}/upload`);
    logTest('File Upload Authentication', false, 'Upload allowed without auth');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('File Upload Authentication', true, 'Upload requires authentication');
    } else {
      logTest('File Upload Authentication', false, `Unexpected response: ${error.response?.status}`);
    }
  }
};

// Test 5: Authentication Security
const testAuthentication = async () => {
  console.log('\n🔐 Testing Authentication Security...');
  
  // Test invalid credentials
  try {
    await axios.post(`${BASE_URL}/staff/login`, {
      username: 'invalid',
      password: 'invalid'
    });
    logTest('Invalid Login', false, 'Login succeeded with invalid credentials');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Invalid Login', true, 'Login properly rejected');
    } else {
      logTest('Invalid Login', false, `Unexpected response: ${error.response?.status}`);
    }
  }
  
  // Test missing credentials
  try {
    await axios.post(`${BASE_URL}/staff/login`, {});
    logTest('Missing Credentials', false, 'Login succeeded without credentials');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Missing Credentials', true, 'Login properly rejected');
    } else {
      logTest('Missing Credentials', false, `Unexpected response: ${error.response?.status}`);
    }
  }
};

// Test 6: CORS Security
const testCORS = async () => {
  console.log('\n🌐 Testing CORS Security...');
  
  try {
    await axios.get(`${BASE_URL}/health`, {
      headers: {
        'Origin': 'http://malicious-site.com'
      }
    });
    logTest('CORS Origin Validation', false, 'Request allowed from malicious origin');
  } catch (error) {
    if (error.response?.status === 403) {
      logTest('CORS Origin Validation', true, 'Request properly blocked');
    } else {
      logTest('CORS Origin Validation', false, `Unexpected response: ${error.response?.status}`);
    }
  }
};

// Test 7: Input Validation
const testInputValidation = async () => {
  console.log('\n✅ Testing Input Validation...');
  
  const invalidInputs = [
    { name: '', price: 10, category: 'test' }, // Empty name
    { name: 'test', price: -10, category: 'test' }, // Negative price
    { name: 'test', price: 'invalid', category: 'test' }, // Invalid price type
    { name: 'a'.repeat(300), price: 10, category: 'test' }, // Name too long
  ];
  
  for (const input of invalidInputs) {
    try {
      await axios.post(`${BASE_URL}/coffees`, input);
      logTest(`Input Validation: ${JSON.stringify(input)}`, false, 'Invalid input accepted');
    } catch (error) {
      if (error.response?.status === 400) {
        logTest(`Input Validation: ${JSON.stringify(input)}`, true, 'Invalid input properly rejected');
      } else {
        logTest(`Input Validation: ${JSON.stringify(input)}`, false, `Unexpected response: ${error.response?.status}`);
      }
    }
  }
};

// Test 8: Security Headers
const testSecurityHeaders = async () => {
  console.log('\n🛡️ Testing Security Headers...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    const headers = response.headers;
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    for (const header of requiredHeaders) {
      if (headers[header]) {
        logTest(`Security Header: ${header}`, true, `Header present: ${headers[header]}`);
      } else {
        logTest(`Security Header: ${header}`, false, 'Header missing');
      }
    }
  } catch (error) {
    logTest('Security Headers', false, error.message);
  }
};

// Main test runner
const runSecurityTests = async () => {
  console.log('🔒 MenuCoffee Security Test Suite');
  console.log('=====================================');
  
  try {
    await testRateLimiting();
    await testSQLInjection();
    await testXSS();
    await testFileUpload();
    await testAuthentication();
    await testCORS();
    await testInputValidation();
    await testSecurityHeaders();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      results.tests.filter(t => !t.passed).forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests }; 