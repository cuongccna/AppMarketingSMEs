const axios = require('axios');

// Cấu hình URL của ứng dụng (mặc định là localhost:3000)
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const CRON_ENDPOINT = `${APP_URL}/api/cron/process-scheduled-replies`;

console.log(`Starting cron worker for ${CRON_ENDPOINT}`);

async function runCron() {
  try {
    console.log(`[${new Date().toISOString()}] Triggering cron job...`);
    const response = await axios.get(CRON_ENDPOINT);
    console.log(`[${new Date().toISOString()}] Success:`, response.data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
  }
}

// Chạy ngay lập tức khi khởi động
runCron();

// Chạy định kỳ mỗi 1 phút (60000 ms)
// Bạn có thể điều chỉnh thời gian này tùy nhu cầu
setInterval(runCron, 60 * 1000);
