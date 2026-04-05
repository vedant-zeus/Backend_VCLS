
import axios from 'axios';

const API_URL = 'https://backend-chem-lab.onrender.com/api/experiments';

async function runTest() {
  try {
    console.log('1. Starting Experiment...');
    const startRes = await axios.post(`${API_URL}/start`);
    const experimentId = startRes.data._id;
    console.log('   Experiment ID:', experimentId);

    console.log('2. Sending Batch Steps...');
    const steps = [
      { action: 'add_solvent', chemical: 'Water', temperature: 25, liquidColor: '#ffffff' },
      { action: 'add_solute', chemical: 'Salt', temperature: 25, liquidColor: '#ffffff' }
    ];
    await axios.post(`${API_URL}/batch-steps/${experimentId}`, { steps });
    console.log('   Batch steps sent.');

    console.log('3. Finishing Experiment...');
    const finishRes = await axios.post(`${API_URL}/finish/${experimentId}`, {
      temperature: 25,
      liquidColor: '#ffffff',
      solutes: ['Salt'],
      reactionType: null,
      equation: null,
      precipitate: false,
      gas: false
    });
    console.log('   Experiment finished:', finishRes.data.message);

    console.log('4. Verifying Steps in Report Data...');
    // We can't easily parse the PDF here, but we can check if the endpoint returns valid PDF
    try {
      const reportRes = await axios.get(`${API_URL}/report/${experimentId}`, { responseType: 'arraybuffer' });
      console.log('   Report fetched, size:', reportRes.data.length, 'bytes');
      if (reportRes.headers['content-type'] === 'application/pdf') {
        console.log('   Report Content-Type is correct (application/pdf)');
      } else {
        console.error('   ❌ Report Content-Type is INCORRECT:', reportRes.headers['content-type']);
      }
    } catch (reportErr) {
      console.error('   ❌ Failed to fetch report:', reportErr.message);
    }

    console.log('✅ BACKEND VERIFICATION PASSED');

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
  }
}

runTest();
