const cron = require("node-cron");
const { clearExpiredFileds } = require("../utils/clearExpiredFields");
const initCronJob = () => {
  // Define a cron job to run the function every 10 minutes
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running cron job to clear expired password reset tokens...");
      await clearExpiredFileds();
      console.log("Expired password reset tokens cleared successfully.");
    } catch (error) {
      console.error("Error clearing expired password reset tokens:", error);
    }
  });
};

module.exports = initCronJob;
