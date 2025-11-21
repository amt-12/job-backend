
const cron = require('node-cron');
const { fetchAllJobs } = require('../services/fetchJobs');

const setupCron = (jobQueue) => {
  cron.schedule('0 * * * *', async () => { 
    console.log('Running cron job to fetch jobs');
    try {
      const jobs = await fetchAllJobs();
      for (const job of jobs) {
        await jobQueue.add('import-job', job);
      }
      console.log(`Queued ${jobs.length} jobs`);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

module.exports = setupCron;
