#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const { Project } = require("../models/Project");

/**
 * Retrieve the MongoDB URI from environment variables.
 */
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("Missing MONGODB_URI in environment");
  process.exit(1);
}

/**
 * Connect to MongoDB.
 */
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

/**
 * Migrate tasks to add a missing priority field.
 * For any task missing the 'priority' field, sets its value to "medium".
 * @returns {Promise<void>} Resolves when the migration is complete.
 */
const migrateTasksPriority = async () => {
  console.log("Starting migration: update tasks with missing priority...");
  // Find projects where at least one task is missing the "priority" field.
  const projects = await Project.find({ "tasks.priority": { $exists: false } });
  console.log(
    `Found ${projects.length} projects to migrate (missing priority).`,
  );
  for (const project of projects) {
    let updated = false;
    project.tasks = project.tasks.map((task) => {
      if (typeof task.priority === "undefined") {
        task.priority = "medium";
        updated = true;
      }
      return task;
    });
    if (updated) {
      await project.save();
      console.log(
        `Migrated project: ${project.projectId} (tasks updated with default priority)`,
      );
    }
  }
};

/**
 * Migration: Set a new 'updatedAt' field on projects that don't have one.
 * This migration adds the current date as the updatedAt value.
 * @returns {Promise<void>} Resolves when the migration is complete.
 */
const migrateAddUpdatedAt = async () => {
  console.log("Starting migration: add missing updatedAt field to projects...");
  // Find projects missing the updatedAt field.
  const projects = await Project.find({ updatedAt: { $exists: false } });
  console.log(`Found ${projects.length} projects without updatedAt field.`);
  for (const project of projects) {
    project.updatedAt = new Date();
    await project.save();
    console.log(`Updated project: ${project.projectId} with updatedAt field.`);
  }
};

/**
 * Migrate project memberships: Remove legacy members field if exists.
 * For example, if both legacy members and new membership arrays exist,
 * remove legacy members.
 * @returns {Promise<void>} Resolves when the migration is complete.
 */
const migrateCleanupLegacyMembers = async () => {
  console.log("Starting migration: cleanup legacy members field...");
  // Find projects with a legacy "members" field that is not an empty array.
  const projects = await Project.find({ members: { $exists: true, $ne: [] } });
  console.log(`Found ${projects.length} projects with legacy members field.`);
  for (const project of projects) {
    // Clean up legacy members field
    project.members = [];
    await project.save();
    console.log(`Cleaned up legacy members for project: ${project.projectId}`);
  }
};

/**
 * Run all migrations sequentially.
 */
(async () => {
  try {
    await migrateTasksPriority();
    await migrateAddUpdatedAt();
    await migrateCleanupLegacyMembers();
    console.log("All migrations complete.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    mongoose.connection.close(() => {
      console.log("Connection closed");
      process.exit(0);
    });
  }
})();
