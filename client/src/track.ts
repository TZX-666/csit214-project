import "./style.css";

type EventData = {
  message: string;
  actor: string;
  occurredAt: string;
};

type RequestData = {
  reference: string;
  title: string;
  location: string;
  status: string;
  priority: string | null;
  assignedTeam: string | null;
  updatedAt: string;
  history: EventData[];
};

const form = document.querySelector<HTMLFormElement>("#search")!;
const input = document.querySelector<HTMLInputElement>("#ref")!;
const msg = document.querySelector<HTMLElement>("#msg")!;
const result = document.querySelector<HTMLElement>("#result")!;
const title = document.querySelector<HTMLElement>("#title")!;
const refOut = document.querySelector<HTMLElement>("#out-ref")!;
const updated = document.querySelector<HTMLElement>("#updated")!;
const status = document.querySelector<HTMLElement>("#status")!;
const priority = document.querySelector<HTMLElement>("#priority")!;
const team = document.querySelector<HTMLElement>("#team")!;
const place = document.querySelector<HTMLElement>("#place")!;
const list = document.querySelector<HTMLOListElement>("#history")!;

function label(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function show(request: RequestData) {
  title.textContent = request.title;
  refOut.textContent = request.reference;
  updated.textContent = new Date(request.updatedAt).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  status.textContent = label(request.status);
  priority.textContent = request.priority ? label(request.priority) : "Not set";
  team.textContent = request.assignedTeam ?? "Awaiting assignment";
  place.textContent = request.location;
  list.replaceChildren();

  for (const event of request.history) {
    const item = document.createElement("li");
    const text = document.createElement("b");
    const note = document.createElement("span");
    text.textContent = event.message;
    note.textContent = `${event.actor} · ${new Date(event.occurredAt).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`;
    item.append(text, note);
    list.append(item);
  }

  result.hidden = false;
}

async function load(ref: string) {
  msg.textContent = "";
  result.hidden = true;

  try {
    const response = await fetch(`/api/requests/${encodeURIComponent(ref.trim())}`);
    const data = (await response.json()) as {
      request?: RequestData;
      message?: string;
    };

    if (!response.ok || !data.request) {
      throw new Error(data.message ?? "The request could not be loaded.");
    }

    input.value = data.request.reference;
    window.history.replaceState(
      null,
      "",
      `?ref=${encodeURIComponent(data.request.reference)}`,
    );
    show(data.request);
  } catch (error) {
    msg.textContent =
      error instanceof Error ? error.message : "The request could not be loaded.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (input.value.trim()) {
    void load(input.value);
  }
});

const preset = new URLSearchParams(location.search).get("ref") ?? "CL-2026-00125";
input.value = preset;
void load(preset);
