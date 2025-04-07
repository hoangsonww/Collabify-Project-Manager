import { Schema, models, model } from "mongoose";

export interface ITask {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  assignedTo?: string | null;
  priority?: "low" | "medium" | "high"; // NEW
}

export interface IMembership {
  userSub: string;
  role: "manager" | "editor" | "viewer";
}

export interface IProject {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  members: string[];
  membership: IMembership[];
  tasks: ITask[];
}

const TaskSchema = new Schema<ITask>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    assignedTo: { type: String, default: null },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { _id: false },
);

const MembershipSchema = new Schema<IMembership>(
  {
    userSub: { type: String, required: true },
    role: {
      type: String,
      enum: ["manager", "editor", "viewer"],
      default: "editor",
    },
  },
  { _id: false },
);

const ProjectSchema = new Schema<IProject>({
  projectId: { type: String, unique: true },
  name: { type: String, required: true },
  description: String,
  members: { type: [String], default: [] },
  membership: { type: [MembershipSchema], default: [] },
  tasks: { type: [TaskSchema], default: [] },
});

export const Project =
  models.Project || model<IProject>("Project", ProjectSchema);
