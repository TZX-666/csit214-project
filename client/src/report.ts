import "./style.css";

const form = document.querySelector<HTMLFormElement>("#form")!;
const type = document.querySelector<HTMLSelectElement>("#type")!;
const date = document.querySelector<HTMLInputElement>("#date")!;
const place = document.querySelector<HTMLInputElement>("#place")!;
const desc = document.querySelector<HTMLTextAreaElement>("#desc")!;
const pics = document.querySelector<HTMLInputElement>("#pics")!;
const files = document.querySelector<HTMLUListElement>("#files")!;
const count = document.querySelector<HTMLSpanElement>("#count")!;
const msg = document.querySelector<HTMLParagraphElement>("#msg")!;
const send = document.querySelector<HTMLButtonElement>("#send")!;

const now = new Date();
const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 10);
date.max = local;
date.value = local;

const typeMap: Record<string, string> = {
  dumping: "Illegal dumping",
  waste: "Waste and bins",
  infra: "Infrastructure",
};
const preset = new URLSearchParams(location.search).get("type");

if (preset && typeMap[preset]) {
  type.value = typeMap[preset];
}

desc.addEventListener("input", () => {
  count.textContent = String(desc.value.length);
});

pics.addEventListener("change", () => {
  msg.textContent = "";
  files.replaceChildren();
  const chosen = Array.from(pics.files ?? []);

  if (chosen.length > 5) {
    pics.value = "";
    msg.textContent = "Please choose no more than 5 photos.";
    return;
  }

  if (chosen.some((file) => file.size > 10 * 1024 * 1024)) {
    pics.value = "";
    msg.textContent = "Each photo must be 10 MB or smaller.";
    return;
  }

  for (const file of chosen) {
    const item = document.createElement("li");
    item.textContent = file.name;
    files.append(item);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  msg.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    msg.textContent = "Please complete all required fields.";
    return;
  }

  send.disabled = true;
  send.textContent = "Sending…";

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issueType: type.value,
        observedOn: date.value,
        location: place.value,
        description: desc.value,
      }),
    });
    const data = (await response.json()) as {
      request?: { reference: string };
      message?: string;
    };

    if (!response.ok || !data.request) {
      throw new Error(data.message ?? "The report could not be submitted.");
    }

    location.href = `/done.html?ref=${encodeURIComponent(data.request.reference)}`;
  } catch (error) {
    msg.textContent =
      error instanceof Error ? error.message : "The report could not be submitted.";
    send.disabled = false;
    send.textContent = "Continue →";
  }
});
