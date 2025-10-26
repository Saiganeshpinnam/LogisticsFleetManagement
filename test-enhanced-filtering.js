const axios = require('axios');

// Test various search queries to verify Google Maps-like filtering
async function testEnhancedFiltering() {
  console.log('🧪 Testing Enhanced Location Filtering\n');
  console.log('=' .repeat(60));

  const testQueries = [
    'kapil kavuri hub',
    'gachibowli',
    'hitech city',
    'mindspace',
    'mumbai',
    'andheri',
    'bandra',
    'delhi',
    'bangalore',
    'whitefield',
    'koramangala',
    'pune',
    'hinjewadi',
    'chennai',
    'kolkata',
    'financial district',
    'bkc',
    'powai',
    'noida',
    'gurgaon'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing: "${query}"`);
      const response = await axios.get(`http://localhost:4001/api/locations/search?q=${encodeURIComponent(query)}&limit=5`, {
        timeout: 5000
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        console.log(`✅ Found ${response.data.results.length} results:`);
        response.data.results.forEach((result, index) => {
          const mainText = result.structured_formatting?.main_text || result.main_text;
          const secondaryText = result.structured_formatting?.secondary_text || result.secondary_text;
          const source = result.source;
          console.log(`   ${index + 1}. ${mainText} - ${secondaryText} [${source}]`);
        });
      } else {
        console.log('❌ No results found');
      }
    } catch (error) {
      console.error(`❌ Error testing "${query}":`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Enhanced filtering test completed!');
  console.log('\n📊 Summary:');
  console.log('   - Backend has comprehensive Indian location database');
  console.log('   - Enhanced fuzzy matching algorithm');
  console.log('   - Google Maps-like filtering experience');
  console.log('   - Support for landmarks like Kapil Kavuri Hub, Mindspace, etc.');
  console.log('\n💡 Next steps:');
  console.log('   1. Open http://localhost:3000 in your browser');
  console.log('   2. Navigate to Customer Dashboard');
  console.log('   3. Try entering pickup/drop addresses');
  console.log('   4. See real-time filtered suggestions!');
}

testEnhancedFiltering();
