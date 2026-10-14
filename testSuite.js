const http = require('http');

async function testEndpoint(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting EquiRent Automated Verification Tests ---');

  // 1. System Status
  const statusRes = await testEndpoint('/api/system/status');
  console.log('1. System Status:', statusRes.status, statusRes.body?.platform, '| DB Mode:', statusRes.body?.database?.mode);
  if (statusRes.status !== 200) throw new Error('Status failed');

  // 2. Equipment Listings
  const eqRes = await testEndpoint('/api/equipment');
  console.log('2. Equipment Count:', eqRes.body?.count, 'items returned.');
  if (eqRes.body?.count < 5) throw new Error('Equipment list too small');

  // 3. Demo Login as Renter
  const renterLogin = await testEndpoint('/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { role: 'renter' }
  });
  console.log('3. Demo Renter Login:', renterLogin.status, renterLogin.body?.user?.name, '| Token received:', !!renterLogin.body?.token);
  const renterToken = renterLogin.body?.token;
  if (!renterToken) throw new Error('Renter login failed');

  // 4. Demo Login as Owner
  const ownerLogin = await testEndpoint('/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { role: 'owner' }
  });
  console.log('4. Demo Owner Login:', ownerLogin.status, ownerLogin.body?.user?.name);
  const ownerToken = ownerLogin.body?.token;

  // 5. Test Bookings Fetch (Renter)
  const bookingsRes = await testEndpoint('/api/bookings', {
    headers: { 'Authorization': `Bearer ${renterToken}` }
  });
  console.log('5. Renter Bookings:', bookingsRes.body?.count, 'bookings found.');

  // 6. Test Create New Booking
  const firstEquipment = eqRes.body.equipment[2]; // e.g. Bobcat S650 owned by Alex Rivera
  console.log('Attempting booking on:', firstEquipment.title, '(Owner:', firstEquipment.ownerName, ')');
  const startOffset = 20 + Math.floor(Math.random() * 50);
  const startDateStr = new Date(Date.now() + startOffset * 86400000).toISOString().split('T')[0];
  const endDateStr = new Date(Date.now() + (startOffset + 3) * 86400000).toISOString().split('T')[0];

  const createBookingRes = await testEndpoint('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${renterToken}`
    },
    body: {
      equipmentId: firstEquipment._id,
      startDate: startDateStr,
      endDate: endDateStr,
      deliveryType: 'Delivery Requested',
      notes: 'Test automated booking verification'
    }
  });
  console.log('6. Create Booking:', createBookingRes.status, createBookingRes.body?.booking?.bookingId, '| Total Price: ₹', createBookingRes.body?.booking?.totalPrice);
  if (createBookingRes.status !== 201) throw new Error('Create booking failed: ' + JSON.stringify(createBookingRes.body));

  const newBookingId = createBookingRes.body.booking._id;

  // 7. Test Earnings Summary (Owner)
  const earningsRes = await testEndpoint('/api/earnings/summary', {
    headers: { 'Authorization': `Bearer ${ownerToken}` }
  });
  console.log('7. Owner Earnings Summary:', earningsRes.status, '| Gross Revenue: ₹', earningsRes.body?.summary?.totalGrossRevenue, '| Commission:', earningsRes.body?.summary?.commissionRatePercent + '%');

  // 8. Test Export CSV
  const csvRes = await testEndpoint('/api/earnings/export-csv', {
    headers: { 'Authorization': `Bearer ${ownerToken}` }
  });
  console.log('8. CSV Export Test:', csvRes.status, '| Content-Type:', csvRes.headers['content-type'], '| Length:', csvRes.raw?.length || 'bytes');
  if (csvRes.status !== 200 || !csvRes.raw.includes('Booking ID,Equipment Title') || !csvRes.raw.includes('Daily Rate (₹)')) {
    throw new Error('CSV Export failed or missing ₹ header');
  }

  // 9. Static Assets (index.html)
  const indexRes = await testEndpoint('/');
  console.log('9. Index HTML Check:', indexRes.status, '| Contains EquiRent:', indexRes.raw?.includes('EquiRent'));

  console.log('--- ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
