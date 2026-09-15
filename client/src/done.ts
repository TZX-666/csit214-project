import "./style.css";

type RequestData = {
  reference: string;
  issueType: string;
  location: string;
  createdAt: string;
};

const ref = new URLSearchParams(location.search).get("ref");
const refOut = document.querySelector<HTMLElement>("#ref")!;
const typeOut = document.querySelector<HTMLElement>("#type")!;
const placeOut = document.querySelector<HTMLElement>("#place")!;
const whenOut = document.querySelector<HTMLElement>("#when")!;
const msg = document.querySelector<HTMLElement>("#msg")!;
const view = document.querySelector<HTMLAnchorElement>("#view")!;

async function load() {
  if (!ref) {
    refOut.textContent = "Not available";
    msg.textContent = "No request number was provided.";
    return;
  }

  refOut.textContent = ref;
  view.href = `/track.html?ref=${encodeURIComponent(ref)}`;

  try {
    const response = await fetch(`/api/requests/${encodeURIComponent(ref)}`);
    const data = (await response.json()) as {
      request?: RequestData;
      message?: string;
    };

    if (!response.ok || !data.request) {
      throw new Error(data.message ?? "The request details could not be loaded.");
    }

    typeOut.textContent = data.request.issueType;
    placeOut.textContent = data.request.location;
    whenOut.textContent = new Date(data.request.createdAt).toLocaleString("en-AU", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (error) {
    msg.textContent =
      error instanceof Error ? error.message : "The request details could not be loaded.";
  }
}

void load();
