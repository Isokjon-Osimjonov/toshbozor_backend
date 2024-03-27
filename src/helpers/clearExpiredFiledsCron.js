const cron = require("node-cron");
const { clearExpiredFileds } = require("../utils/clearExpiredFields");
const initCronJob = () => {
  // Define a cron job to run the function every 10 minutes
  cron.schedule("0 0 * * *", async () => {
    try {
      await clearExpiredFileds();
    } catch (error) {
      throw error;
    }
  });
};

module.exports = initCronJob;
