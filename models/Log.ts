import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  // The log date is expected to be provided by Auth0
  date: { type: Date, required: true },
  // Event type (for example, 'seccft' in your sample)
  type: { type: String, required: true },
  // A description message (empty string if no description)
  description: { type: String, default: "" },
  // Connection identifier (optional)
  connection_id: { type: String, default: "" },
  // Client identifier – required as provided by Auth0
  client_id: { type: String, required: true },
  // Client name, defaults to empty if not provided
  client_name: { type: String, default: "" },
  // IP address where the log originated
  ip: { type: String, default: "" },
  // Client IP (if different from the primary IP)
  client_ip: { type: String, default: "" },
  // User agent string; useful for debugging issues related to the source of the event
  user_agent: { type: String, default: "" },
  // Hostname from which the log was generated
  hostname: { type: String, default: "" },
  // User id (if applicable)
  user_id: { type: String, default: "" },
  // User name (if applicable)
  user_name: { type: String, default: "" },
  // Audience information (could be the API endpoint targeted)
  audience: { type: String, default: "" },
  // Scope associated with the event
  scope: { type: String, default: "" },
  // Map the $event_schema to a conventional field name (store as Mixed to allow any structure)
  event_schema: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Auth0’s unique log identifier; defined as unique to avoid duplicate entries
  log_id: { type: String, required: true, unique: true },
  // Tenant name from Auth0
  tenant_name: { type: String, default: "" },
  // Boolean flag indicating if the log event originated from a mobile device
  isMobile: { type: Boolean, default: false },
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
