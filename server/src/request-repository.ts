import { database } from "./database.js";

export type RequestStatus =
  | "submitted"
  | "under_review"
  | "assessing"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "resolved";

export type RequestPriority = "low" | "medium" | "high";

export type ServiceRequestSummary = {
  id: number;
  reference: string;
  issueType: string;
  title: string;
  location: string;
  status: RequestStatus;
  priority: RequestPriority | null;
  affectedArea: string | null;
  assignedTeam: string | null;
  targetAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditEvent = {
  id: number;
  eventType: string;
  message: string;
  actor: string;
  occurredAt: string;
};

export type ServiceRequestDetails = ServiceRequestSummary & {
  observedOn: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  serviceLevel: string | null;
  assessmentNotes: string | null;
  history: AuditEvent[];
};

export type NewRequest = {
  issueType: string;
  observedOn: string;
  location: string;
  description: string;
};

const requestSummaryColumns = `
  requests.id,
  requests.reference,
  requests.issue_type AS issueType,
  requests.title,
  requests.location,
  requests.status,
  requests.priority,
  requests.affected_area AS affectedArea,
  teams.display_name AS assignedTeam,
  requests.target_at AS targetAt,
  requests.created_at AS createdAt,
  requests.updated_at AS updatedAt
`;

export function listServiceRequests(): ServiceRequestSummary[] {
  return database
    .prepare(`
      SELECT ${requestSummaryColumns}
      FROM service_requests AS requests
      LEFT JOIN teams ON teams.id = requests.assigned_team_id
      ORDER BY requests.created_at DESC
    `)
    .all() as unknown as ServiceRequestSummary[];
}

export function findServiceRequestByReference(
  reference: string,
): ServiceRequestDetails | null {
  const request = database
    .prepare(`
      SELECT
        ${requestSummaryColumns},
        requests.observed_on AS observedOn,
        requests.latitude,
        requests.longitude,
        requests.description,
        requests.service_level AS serviceLevel,
        requests.assessment_notes AS assessmentNotes
      FROM service_requests AS requests
      LEFT JOIN teams ON teams.id = requests.assigned_team_id
      WHERE requests.reference = ?
    `)
    .get(reference.toUpperCase()) as unknown as
    | Omit<ServiceRequestDetails, "history">
    | undefined;

  if (!request) {
    return null;
  }

  const history = database
    .prepare(`
      SELECT
        id,
        event_type AS eventType,
        message,
        actor,
        occurred_at AS occurredAt
      FROM audit_events
      WHERE request_id = ?
      ORDER BY occurred_at ASC, id ASC
    `)
    .all(request.id) as unknown as AuditEvent[];

  return {
    ...request,
    history,
  };
}

export function createServiceRequest(input: NewRequest): ServiceRequestDetails {
  const next = database
    .prepare("SELECT COALESCE(MAX(id), 0) + 1 AS id FROM service_requests")
    .get() as { id: number };
  const year = new Date().getFullYear();
  const reference = `CL-${year}-${String(next.id).padStart(5, "0")}`;
  const now = new Date().toISOString();

  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare(`
        INSERT INTO service_requests (
          id,
          reference,
          issue_type,
          title,
          observed_on,
          location,
          description,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)
      `)
      .run(
        next.id,
        reference,
        input.issueType,
        `${input.issueType} report`,
        input.observedOn,
        input.location,
        input.description,
        now,
        now,
      );

    database
      .prepare(`
        INSERT INTO audit_events (
          request_id,
          event_type,
          message,
          actor,
          occurred_at
        ) VALUES (?, 'report_submitted', ?, 'Resident portal', ?)
      `)
      .run(
        next.id,
        "Report submitted through the resident portal.",
        now,
      );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }

  const request = findServiceRequestByReference(reference);

  if (!request) {
    throw new Error("The new request could not be loaded.");
  }

  return request;
}
