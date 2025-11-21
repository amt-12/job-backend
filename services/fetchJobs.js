const axios = require("axios");
const xmlToJson = require("./xmlToJson");
const Job = require("../models/Job");

const API_URLS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

function extractValue(node) {
  if (!node) return null;
  if (typeof node === "string") return node;
  if (node._text) return node._text;
  if (node._cdata) return node._cdata;
  if (node._) return node._;
  return null;
}

const fetchAllJobs = async () => {
  const allJobs = [];

  for (const url of API_URLS) {
    try {
      const res = await axios.get(url);
      const data = await xmlToJson(res.data);

      const jobs =
        data?.rss?.channel?.item ||
        data?.jobs?.job ||
        [];

      const jobArray = Array.isArray(jobs) ? jobs : [jobs];


      let jobIndex = 0;

      for (const job of jobArray) {
        const sanitized = {};
        for (const key of Object.keys(job)) {
          if (!key.startsWith("$") && !key.startsWith("@")) {
            sanitized[key] = job[key];
          }
        }

        const externalId =
          extractValue(sanitized.guid) ||
          extractValue(sanitized.id) ||
          extractValue(sanitized.link) ||
          `${url}-job-${jobIndex}`; 

        const jobData = {
          title: extractValue(sanitized.title) || "Untitled Job",
          description: extractValue(sanitized.description),
          link: extractValue(sanitized.link),
          company: extractValue(sanitized.company) || "Unknown",
          location: extractValue(sanitized.location),
          category: extractValue(sanitized.category),
          type: extractValue(sanitized.type),
          region: extractValue(sanitized.region),
          sourceUrl: url,
          externalId,
          updatedAt: new Date(),
        };

        try {
          await Job.updateOne(
            { externalId: jobData.externalId },
            { $set: jobData },
            { upsert: true }
          );
          console.log(`Saved/Updated: ${jobData.title}`);
        } catch (dbError) {
          console.error("DB Save Error:", dbError.message);
        }

        allJobs.push(jobData);
        jobIndex++;
      }
    } catch (err) {
      console.error(`Fetch failed from ${url}:`, err.message);
    }
  }

  console.log(`Total jobs processed: ${allJobs.length}`);
  return allJobs;
};

module.exports = { fetchAllJobs };
