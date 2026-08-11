import http from 'http';

const testLogin = () => {
  const data = JSON.stringify({ email: 'alex@student.com', password: 'password123', role: 'Student' });
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      const parsed = JSON.parse(body);
      console.log('Success:', parsed.success);
      if (parsed.user) console.log('User role:', parsed.user.role);
      if (parsed.token) console.log('Token received:', !!parsed.token);
      if (!parsed.success) console.log('Message:', parsed.message);
    });
  });
  req.on('error', e => console.error('Error:', e.message));
  req.write(data);
  req.end();
};

const testReports = (token) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/reports',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  };
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(body);
      console.log('\n--- Admin Reports Test ---');
      console.log('Success:', parsed.success);
      if (parsed.stats) console.log('Stats:', JSON.stringify(parsed.stats));
      if (parsed.monthly_registrations) console.log('Monthly reg count:', parsed.monthly_registrations.length);
    });
  });
  req.on('error', e => console.error('Error:', e.message));
  req.end();
};

// Test login, then test admin endpoint
const data = JSON.stringify({ email: 'admin@careersync.com', password: 'password123', role: 'Admin' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(body);
    console.log('Admin Login - Status:', res.statusCode, '| Success:', parsed.success);
    if (parsed.token) {
      testReports(parsed.token);
    }
    
    // Also test student login
    testLogin();
  });
});
req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
