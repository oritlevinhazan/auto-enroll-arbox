import dotenv from "dotenv";
dotenv.config();

import { createEnrollmentJobs, envokeJobs } from "./lib/arbox.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMillisUntil = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const now = new Date();
    const israelTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const target = new Date(israelTime);
    target.setHours(hours, minutes, seconds, 0);
    // if the time has already passed today, schedule for tomorrow
    // unless we're less than 10 minutes late (e.g. workflow startup delay)
    if (target <= israelTime) {
        if (israelTime - target < 10 * 60 * 1000) {
            return 0;
        }
        target.setDate(target.getDate() + 1);
    }
    return target - israelTime;
};

const REGISTER_TIME = process.env.REGISTER_TIME || "16:00:10";
const PREPARE_SECONDS = 300;
const SKIP_WAIT = process.env.SKIP_WAIT === "true";

if (!SKIP_WAIT) {
    const ms = getMillisUntil(REGISTER_TIME) - PREPARE_SECONDS * 1000;
    if (ms > 0) {
        console.log(`Waiting ${Math.round(ms / 1000)} seconds to prepare jobs...`);
        await wait(ms);
    }
}

console.log("Preparing jobs...");
await createEnrollmentJobs();

if (!SKIP_WAIT) {
    const msToRegister = getMillisUntil(REGISTER_TIME);
    if (msToRegister > 60 * 1000) {
        console.log(`Waiting ${Math.round(msToRegister / 1000)} seconds to enroll...`);
        await wait(msToRegister);
    }
}

console.log("Enrolling...");
await envokeJobs(false);

console.log("Done!");
process.exit(0);
