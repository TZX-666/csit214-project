import express, { type NextFunction, type Request, type Response } from "express";

import { getDatabaseHealth } from "./database.js";
import {
  createServiceRequest,
  findServiceRequestByReference,
  listServiceRequests,
} from "./request-repository.js";

export const app = express();
const issueTypes = new Set([
  "Illegal dumping",
  "Waste and bins",
  "Infrastructure",
  "Other",
]);

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "coastlink-api",
    database: getDatabaseHealth(),
  });
});

app.get("/api/staff/requests", (_request, response) => {
  const requests = listServiceRequests();

  response.json({
    total: requests.length,
    requests,
  });
});

app.post("/api/requests", (request, response) => {
  const { issueType, observedOn, location, description } = request.body ?? {};
  const fields = [issueType, observedOn, location, description];

  if (fields.some((field) => typeof field !== "string" || !field.trim())) {
    response.status(400).json({
      error: "invalid_input",
      message: "Issue type, date, location and description are required.",
    });
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(observedOn)) {
    response.status(400).json({
      error: "invalid_date",
      message: "The observed date must use YYYY-MM-DD format.",
    });
    return;
  }

  if (!issueTypes.has(issueType.trim())) {
    response.status(400).json({
      error: "invalid_type",
      message: "Please select a valid issue type.",
    });
    return;
  }

  if (location.trim().length > 160 || description.trim().length > 1000) {
    response.status(400).json({
      error: "input_too_long",
      message: "The location or description is too long.",
    });
    return;
  }

  const serviceRequest = createServiceRequest({
    issueType: issueType.trim(),
    observedOn,
    location: location.trim(),
    description: description.trim(),
  });

  response.status(201).json({ request: serviceRequest });
});

app.get("/api/requests/:reference", (request, response) => {
  const serviceRequest = findServiceRequestByReference(request.params.reference);

  if (!serviceRequest) {
    response.status(404).json({
      error: "request_not_found",
      message: "No service request matches that reference number.",
    });
    return;
  }

  response.json({ request: serviceRequest });
});

app.use((_request, response) => {
  response.status(404).json({
    error: "not_found",
    message: "The requested API endpoint does not exist.",
  });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error(error);
    response.status(500).json({
      error: "internal_server_error",
      message: "The server could not complete the request.",
    });
  },
);
