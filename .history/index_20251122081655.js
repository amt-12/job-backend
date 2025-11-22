require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Job = require('./models/Job');
const app = express();
const server = http.createServer(app);

app.use(express.json());


const io = socketIo(server, {
  cors: {
    origin: 'https://job-frontend-iota.vercel.app',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: 'https://job-frontend-iota.vercel.app', 
  methods: ['GET', 'POST'],
}))
const apiRoutes = require('./api/index');
app.use('/api', apiRoutes);
app.use('/api/working', (req, res, next) => {
  res.status(404).json({
    message: "API route not found"
  });
});
mongoose.connect('mongodb+srv://mt6100378_db_user:G9*zhVLj.8UsJTJ@cluster0.hx0xvtd.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const redisConnection = new IORedis({
  host: 'https://eminent-swine-40236.upstash.io',
  token:"AZ0sAAIncDI1M2Y1NDUxNzBiZTk0ZTMzOWM0N2MwN2ZiNWIzM2YwNnAyNDAyMzY",
  port: 6379,

});

const jobQueue = new Queue('job-import', { connection: redisConnection });
console.log('BullMQ Queue initialized', jobQueue.name);



io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('fetch-jobs', async () => {
    try {
      const { fetchAllJobs } = require('./services/fetchJobs');
      const jobs = await fetchAllJobs();
      let savedCount = 0;
      for (const job of jobs) {
        await Job.findOneAndUpdate(
          { externalId: job.externalId },
          { ...job, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        savedCount++;
        await jobQueue.add('import-job', job);
      }
      socket.emit('fetch-complete', { message: `Queued and saved ${savedCount} jobs` });
    } catch (error) {
      console.error('Error fetching jobs via socket:', error);
      socket.emit('fetch-error', { error: 'Failed to fetch jobs' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

require('./cron/fetchCron')(jobQueue);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
