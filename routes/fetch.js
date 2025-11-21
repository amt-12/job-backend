const express = require('express');
const { fetchAllJobs } = require('../services/fetchJobs');
const jobQueue = require('../queue/queue');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Manually fetching jobs');
    const jobs = await fetchAllJobs();
    console.log(`Fetched ${jobs.length} jobs`);
    let queuedCount = 0;
    for (const job of jobs) {
      await jobQueue.add('import-job', job);
      queuedCount++;
    }
    res.json({ message: `Queued ${queuedCount} jobs` });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
