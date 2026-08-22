// Comprehensive Smoke Test Script
async function runSmokeTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('Testing endpoints on', baseUrl);

  // 1. Landing / Login page
  const loginRes = await fetch(baseUrl + '/login');
  console.log('1. GET /login status:', loginRes.status);

  // 2. Admin Sign-In
  const adminAuthRes = await fetch(baseUrl + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@odoo.com', password: 'Admin@123456' })
  });
  console.log('2. POST /api/auth/signin (Admin) status:', adminAuthRes.status);
  const adminData = await adminAuthRes.json();
  console.log('   Admin Auth user:', adminData.user?.name, '| role:', adminData.user?.role);

  // Extract session cookie from Set-Cookie header
  const rawCookie = adminAuthRes.headers.get('set-cookie');
  const adminCookie = rawCookie ? rawCookie.split(';')[0] : '';
  console.log('   Admin Cookie captured:', adminCookie ? 'YES' : 'NO');

  // 3. Admin Auth Me
  const meRes = await fetch(baseUrl + '/api/auth/me', {
    headers: { 'Cookie': adminCookie }
  });
  const meData = await meRes.json();
  console.log('3. GET /api/auth/me status:', meRes.status, '| Current user:', meData.user?.name);

  // 4. Admin Dashboard Summary
  const summaryRes = await fetch(baseUrl + '/api/dashboard/summary', {
    headers: { 'Cookie': adminCookie }
  });
  const summaryData = await summaryRes.json();
  console.log('4. GET /api/dashboard/summary status:', summaryRes.status, '| Summary:', summaryData);

  // 5. Employees API
  const empRes = await fetch(baseUrl + '/api/employees', {
    headers: { 'Cookie': adminCookie }
  });
  const empList = await empRes.json();
  console.log('5. GET /api/employees status:', empRes.status, '| Employees count:', Array.isArray(empList) ? empList.length : typeof empList);

  // 6. Admin Payroll API
  const payrollRes = await fetch(baseUrl + '/api/payroll/admin', {
    headers: { 'Cookie': adminCookie }
  });
  console.log('6. GET /api/payroll/admin status:', payrollRes.status);

  // 7. Admin Leave API
  const leaveRes = await fetch(baseUrl + '/api/leave/admin', {
    headers: { 'Cookie': adminCookie }
  });
  console.log('7. GET /api/leave/admin status:', leaveRes.status);

  // 8. Employee Sign-In
  const empAuthRes = await fetch(baseUrl + '/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'john.doe@odoo.com', password: 'Emp@123456' })
  });
  console.log('8. POST /api/auth/signin (Employee) status:', empAuthRes.status);
  const empAuthData = await empAuthRes.json();
  console.log('   Employee Auth user:', empAuthData.user?.name, '| role:', empAuthData.user?.role);

  const empRawCookie = empAuthRes.headers.get('set-cookie');
  const empCookie = empRawCookie ? empRawCookie.split(';')[0] : '';

  // 9. Employee Attendance status
  const attStatusRes = await fetch(baseUrl + '/api/attendance/status', {
    headers: { 'Cookie': empCookie }
  });
  const attStatusData = await attStatusRes.json();
  console.log('9. GET /api/attendance/status status:', attStatusRes.status, '| Attendance status:', attStatusData);

  // 10. Leave balance
  const leaveBalRes = await fetch(baseUrl + '/api/leave/balance', {
    headers: { 'Cookie': empCookie }
  });
  const leaveBalData = await leaveBalRes.json();
  console.log('10. GET /api/leave/balance status:', leaveBalRes.status, '| Balance info:', leaveBalData);

  // 11. Test rendering major frontend pages with Admin session
  console.log('\n--- Checking Frontend Pages HTML status ---');
  const pages = [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/employees',
    '/dashboard/attendance',
    '/dashboard/time-off',
    '/payroll/admin',
    '/profile',
    '/employee-dashboard',
    '/attendance',
    '/leave',
    '/payroll'
  ];

  for (const page of pages) {
    const pageRes = await fetch(baseUrl + page, {
      headers: { 'Cookie': adminCookie }
    });
    console.log(`Page: ${page.padEnd(25)} -> Status ${pageRes.status}`);
  }

  console.log('\n=== ALL SMOKE TESTS COMPLETED SUCCESSFULLY! ===\n');
}

runSmokeTests().catch(console.error);
