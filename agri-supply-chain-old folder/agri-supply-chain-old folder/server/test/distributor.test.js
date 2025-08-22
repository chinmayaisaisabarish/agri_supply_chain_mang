const axios = require('axios');
const baseURL = 'http://localhost:5000/api';
let token = '';
let cropId = '';

const testDistributorFlow = async () => {
  try {
    // 1. Login as distributor
    console.log('1. Testing distributor login...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Get distributor profile
    console.log('\n2. Testing get profile...');
    const profileRes = await axios.get(`${baseURL}/distributor/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile fetched:', profileRes.data);

    // 3. Get available crops
    console.log('\n3. Testing get available crops...');
    const cropsRes = await axios.get(`${baseURL}/distributor/crops`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (cropsRes.data.length > 0) {
      cropId = cropsRes.data[0]._id;
      console.log(`✅ Found ${cropsRes.data.length} available crops`);
    } else {
      console.log('⚠️ No available crops found');
    }

    // 4. Buy a crop (if available)
    if (cropId) {
      console.log('\n4. Testing buy crop...');
      const buyRes = await axios.post(
        `${baseURL}/distributor/buy-crop`,
        {
          cropId,
          transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
          sellingPrice: 100
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Crop purchased:', buyRes.data.message);
    }

    // 5. Get purchased crops
    console.log('\n5. Testing get purchased crops...');
    const purchasedRes = await axios.get(`${baseURL}/distributor/purchased-crops`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${purchasedRes.data.length} purchased crops`);

    // 6. Get transactions
    console.log('\n6. Testing get transactions...');
    const transactionsRes = await axios.get(`${baseURL}/distributor/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${transactionsRes.data.length} transactions`);

    // 7. Get inventory
    console.log('\n7. Testing get inventory...');
    const inventoryRes = await axios.get(`${baseURL}/distributor/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${inventoryRes.data.length} inventory items`);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the tests
testDistributorFlow(); 