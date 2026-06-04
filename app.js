import dotenv from "dotenv";
dotenv.config();

import { loginArbox, createEnrollmentJobs, envokeJobs } from "./lib/arbox.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMillisUntil = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, seconds, 0);
    return target - now;
};

const REGISTER_TIME = process.env.REGISTER_TIME || "16:00:10";
const PREPARE_SECONDS = 30;

const ms = getMillisUntil(REGISTER_TIME) - PREPARE_SECONDS * 1000;

console.log(`Waiting ${Math.round(ms / 1000)} seconds to prepare jobs...`);
await wait(ms);

console.log("Preparing jobs...");
await createEnrollmentJobs();

const msToRegister = getMillisUntil(REGISTER_TIME);
console.log(`Waiting ${Math.round(msToRegister / 1000)} seconds to enroll...`);
await wait(msToRegister);

console.log("Enrolling...");
await envokeJobs();

console.log("Done!");
process.exit(0);
