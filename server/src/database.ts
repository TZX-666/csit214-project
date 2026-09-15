import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

type SQLiteVersionRow = {
  sqliteVersion: string;
};

const defaultDatabasePath = resolve(process.cwd(), "../data/coastlink.sqlite");
const databasePath = process.env.COASTLINK_DB_PATH ?? defaultDatabasePath;

mkdirSync(dirname(databasePath), { recursive: true });

export const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );

  INSERT OR IGNORE INTO schema_migrations (version, applied_at)
  VALUES (1, CURRENT_TIMESTAMP);

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0)
  );

  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    issue_type TEXT NOT NULL,
    title TEXT NOT NULL,
    observed_on TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (
      status IN (
        'submitted',
        'under_review',
        'assessing',
        'assigned',
        'scheduled',
        'in_progress',
        'resolved'
      )
    ),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    service_level TEXT,
    affected_area TEXT,
    assigned_team_id INTEGER REFERENCES teams(id),
    target_at TEXT,
    assessment_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    actor TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    UNIQUE (request_id, event_type, occurred_at)
  );

  CREATE INDEX IF NOT EXISTS idx_service_requests_status
    ON service_requests(status);

  CREATE INDEX IF NOT EXISTS idx_service_requests_priority
    ON service_requests(priority);

  CREATE INDEX IF NOT EXISTS idx_audit_events_request_id
    ON audit_events(request_id, occurred_at);

  INSERT OR IGNORE INTO teams (id, name, display_name, capacity) VALUES
    (1, 'Coastal Operations', 'Coastal Ops', 10),
    (2, 'Central Response', 'Central Response', 8),
    (3, 'Waste Services', 'Waste Services', 12);

  INSERT OR IGNORE INTO service_requests (
    id,
    reference,
    issue_type,
    title,
    observed_on,
    location,
    latitude,
    longitude,
    description,
    status,
    priority,
    service_level,
    affected_area,
    assigned_team_id,
    target_at,
    assessment_notes,
    created_at,
    updated_at
  ) VALUES
    (
      125,
      'CL-2026-00125',
      'Illegal dumping',
      'Illegal dumping near North Beach car park',
      '2026-09-14',
      'North Beach Car Park, Cliff Road, CoastLink NSW',
      -34.4238,
      150.8982,
      'Construction waste and household items are blocking part of the pedestrian access.',
      'assessing',
      'high',
      'urgent_4h',
      'North Beach',
      1,
      '2026-09-14T14:00:00+10:00',
      'Pedestrian access is partially obstructed. A site inspection is required before removal.',
      '2026-09-14T09:18:00+10:00',
      '2026-09-14T10:42:00+10:00'
    ),
    (
      124,
      'CL-2026-00124',
      'Waste and bins',
      'Overflowing bins',
      '2026-09-14',
      'Central Park, CoastLink NSW',
      NULL,
      NULL,
      'Public bins are overflowing near the main playground entrance.',
      'submitted',
      'high',
      'urgent_4h',
      'Central Park',
      NULL,
      NULL,
      NULL,
      '2026-09-14T09:57:00+10:00',
      '2026-09-14T09:57:00+10:00'
    ),
    (
      119,
      'CL-2026-00119',
      'Infrastructure',
      'Damaged footpath',
      '2026-09-13',
      'Harbour precinct, CoastLink NSW',
      NULL,
      NULL,
      'A raised section of footpath presents a trip hazard.',
      'assigned',
      'high',
      'urgent_4h',
      'Harbour',
      2,
      '2026-09-14T08:00:00+10:00',
      'Temporary warning barriers are required before repair.',
      '2026-09-13T13:30:00+10:00',
      '2026-09-14T08:15:00+10:00'
    ),
    (
      117,
      'CL-2026-00117',
      'Waste and bins',
      'Missed collection',
      '2026-09-13',
      'Seaview residential area, CoastLink NSW',
      NULL,
      NULL,
      'Several scheduled household bins were not collected.',
      'in_progress',
      'medium',
      'standard_1d',
      'Seaview',
      3,
      '2026-09-15T12:00:00+10:00',
      'Waste Services is completing a recovery collection.',
      '2026-09-13T08:05:00+10:00',
      '2026-09-14T09:05:00+10:00'
    ),
    (
      114,
      'CL-2026-00114',
      'Other',
      'Graffiti report',
      '2026-09-12',
      'Market Lane, CoastLink NSW',
      NULL,
      NULL,
      'Graffiti has been reported on a Council-owned wall.',
      'submitted',
      'medium',
      'standard_1d',
      'Market Lane',
      NULL,
      NULL,
      NULL,
      '2026-09-12T16:20:00+10:00',
      '2026-09-12T16:20:00+10:00'
    ),
    (
      108,
      'CL-2026-00108',
      'Infrastructure',
      'Broken street bin',
      '2026-09-11',
      'Central shopping area, CoastLink NSW',
      NULL,
      NULL,
      'The lid and hinge of a public street bin are damaged.',
      'scheduled',
      'low',
      'routine_3d',
      'Central',
      3,
      '2026-09-16T10:00:00+10:00',
      'Replacement parts have been requested.',
      '2026-09-11T11:10:00+10:00',
      '2026-09-14T08:30:00+10:00'
    );

  INSERT OR IGNORE INTO audit_events (
    request_id,
    event_type,
    message,
    actor,
    occurred_at
  ) VALUES
    (125, 'report_submitted', 'Report submitted through the resident portal.', 'Resident portal', '2026-09-14T09:18:00+10:00'),
    (125, 'category_confirmed', 'Issue category confirmed as illegal dumping.', 'Customer Service', '2026-09-14T09:34:00+10:00'),
    (125, 'priority_set', 'Priority set to high.', 'Duty Officer', '2026-09-14T10:10:00+10:00'),
    (125, 'team_assigned', 'Assigned to Coastal Operations.', 'System', '2026-09-14T10:42:00+10:00'),
    (124, 'report_submitted', 'Report submitted through the resident portal.', 'Resident portal', '2026-09-14T09:57:00+10:00'),
    (119, 'team_assigned', 'Assigned to Central Response.', 'Duty Officer', '2026-09-14T08:15:00+10:00'),
    (117, 'work_started', 'Recovery collection started.', 'Waste Services', '2026-09-14T09:05:00+10:00'),
    (114, 'report_submitted', 'Report submitted through the resident portal.', 'Resident portal', '2026-09-12T16:20:00+10:00'),
    (108, 'work_scheduled', 'Bin repair scheduled.', 'Waste Services', '2026-09-14T08:30:00+10:00');

  INSERT OR IGNORE INTO schema_migrations (version, applied_at)
  VALUES (2, CURRENT_TIMESTAMP);
`);

export function getDatabaseHealth() {
  const row = database
    .prepare("SELECT sqlite_version() AS sqliteVersion")
    .get() as SQLiteVersionRow;

  return {
    status: "connected" as const,
    engine: "sqlite" as const,
    version: row.sqliteVersion,
  };
}
