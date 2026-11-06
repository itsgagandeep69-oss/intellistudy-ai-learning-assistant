
const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = "intellistudy-v2";
const API_URL = "http://127.0.0.1:8000";

let chats = [];
let currentChatId = null;
let documents = [];
let toastTimer;
let backendConnected = false;

const form = $("#chatForm");
const questionInput = $("#question");
const messages = $("#messages");
const historyList = $("#historyList");
const conversation = $("#conversation");
const welcomeSection = $("#welcomeSection");
const fileInput = $("#fileInput");
const documentList = $("#documentList");
const verificationStatus = $("#verificationStatus");

function makeId() {
  return crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeChat() {
  return {
    id: makeId(),
    title: "New session",
    messages: [],
    createdAt: Date.now()
  };
}

function currentChat() {
  return chats.find((chat) => chat.id === currentChatId);
}

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ chats, currentChatId })
    );
  } catch {
    toast("Browser storage is full. Some changes may not be saved.");
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    chats = Array.isArray(saved.chats) ? saved.chats : [];
    currentChatId = saved.currentChatId || null;
  } catch {
    chats = [];
    currentChatId = null;
  }

  if (!chats.length) {
    const chat = makeChat();
    chats = [chat];
    currentChatId = chat.id;
  }

  if (!chats.some((chat) => chat.id === currentChatId)) {
    currentChatId = chats[0].id;
  }
}

function toast(message) {
  let element = $(".toast");

  if (!element) {
    element = document.createElement("div");
    element.className = "toast";
    element.setAttribute("role", "status");
    document.body.appendChild(element);
  }

  element.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.remove(), 3500);
}

function renderHistory() {
  historyList.innerHTML = "";

  [...chats].reverse().forEach((chat) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.textContent = chat.title;

    if (chat.id === currentChatId) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      currentChatId = chat.id;
      save();
      render();
    });

    historyList.appendChild(button);
  });
}

function renderDocuments() {
  documentList.innerHTML = "";

  documents.forEach((doc) => {
    const item = document.createElement("div");
    item.className = "document-item";

    const label = document.createElement("span");
    label.textContent = `📄 ${doc.name}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${doc.name}`);
    remove.style.cssText =
      "border:0;background:transparent;color:#68e0bd;font-size:18px;";

    remove.addEventListener("click", () => {
      documents = documents.filter((entry) => entry.id !== doc.id);
      renderDocuments();
      toast("Removed from the selected file list.");
    });

    item.append(label, remove);
    documentList.appendChild(item);
  });
}

function addMessage(role, text, extra = {}) {
  const chat = currentChat();
  if (!chat) return null;

  return addMessageToChat(chat.id, role, text, extra);
}

function addMessageToChat(chatId, role, text, extra = {}) {
  const chat = chats.find((entry) => entry.id === chatId);
  if (!chat) return null;

  const message = {
    id: makeId(),
    role,
    text,
    sources: extra.sources || [],
    verification: extra.verification || ""
  };

  chat.messages.push(message);

  if (role === "user" && chat.title === "New session") {
    chat.title = text.slice(0, 30) +
      (text.length > 30 ? "…" : "");
  }

  save();
  render();

  return message;
}

function formatVerification(result) {
  if (!result) return "No verification details returned.";

  if (typeof result === "string") {
    return result;
  }

  const claims = result.claims;

  if (!Array.isArray(claims) || claims.length === 0) {
    return JSON.stringify(result, null, 2);
  }

  return claims.map((item, index) => {
    const claim = item.claim || "Claim";
    const status = item.status || "Unknown";
    const explanation = item.explanation || "";

    return `${index + 1}. ${claim}\nStatus: ${status}` +
      (explanation ? `\nExplanation: ${explanation}` : "");
  }).join("\n\n");
}

function renderMessages() {
  const chat = currentChat();
  const hasMessages = Boolean(chat?.messages?.length);

  messages.innerHTML = "";
  welcomeSection.hidden = hasMessages;
  conversation.classList.toggle("has-messages", hasMessages);

  if (!hasMessages) {
    verificationStatus.textContent = backendConnected
      ? "Llama API connected"
      : "Evidence verification: not connected";
    return;
  }

  chat.messages.forEach((message) => {
    const row = document.createElement("article");
    row.className = `message ${message.role}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = message.role === "user" ? "S" : "i.";

    const body = document.createElement("div");
    body.className = "message-body";

    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = message.role === "user"
      ? "You"
      : "IntelliStudy";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.text;

    body.append(name, bubble);

    if (message.sources?.length) {
      const sourceBox = document.createElement("div");
      sourceBox.className = "sources";
      sourceBox.textContent = "Sources";

      message.sources.forEach((source) => {
        const line = document.createElement("div");
        line.className = "source-item";
        line.textContent = `• ${source}`;
        sourceBox.appendChild(line);
      });

      body.appendChild(sourceBox);
    }

    if (message.verification) {
      const box = document.createElement("div");
      box.className = "verification-result";
      box.textContent = message.verification;
      body.appendChild(box);
    }

    row.append(avatar, body);
    messages.appendChild(row);
  });

  verificationStatus.textContent = backendConnected
    ? "Llama API connected • Answer verification enabled"
    : "Connecting to IntelliStudy backend...";
}

function render() {
  renderHistory();
  renderDocuments();
  renderMessages();
}

async function ask(question) {
  const text = question.trim();

  if (!text) {
    toast("Type a question first.");
    return;
  }

  if (form.dataset.busy === "true") {
    toast("Please wait for the current answer.");
    return;
  }

  const chatId = currentChatId;

  addMessageToChat(chatId, "user", text);

  questionInput.value = "";
  $("#heroPrompt").value = "";
  questionInput.style.height = "auto";

  const submitButton = form.querySelector(
    'button[type="submit"], button:not([type])'
  );

  form.dataset.busy = "true";
  if (submitButton) submitButton.disabled = true;

  const loadingMessage = addMessageToChat(
    chatId,
    "assistant",
    "Thinking... Llama is preparing your answer."
  );

  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: text,
        context: ""
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The backend returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail || `Backend error: ${response.status}`
      );
    }

    if (!data.answer) {
      throw new Error("The backend did not return an answer.");
    }

    backendConnected = true;

    const chat = chats.find((entry) => entry.id === chatId);
    const message = chat?.messages.find(
      (entry) => entry.id === loadingMessage?.id
    );

    if (message) {
      message.text = data.answer;
      message.verification = formatVerification(data.verification);
      save();
    }

    render();
  } catch (error) {
    console.error("IntelliStudy API error:", error);

    const chat = chats.find((entry) => entry.id === chatId);
    const message = chat?.messages.find(
      (entry) => entry.id === loadingMessage?.id
    );

    if (message) {
      message.text =
        `Unable to get an answer: ${error.message}\n\n` +
        "Check that your backend is running at " +
        "http://127.0.0.1:8000 and try again.";
      message.verification = "";
      save();
    }

    backendConnected = false;
    render();
    toast("Couldn't connect to the AI backend.");
  } finally {
    form.dataset.busy = "false";
    if (submitButton) submitButton.disabled = false;
    questionInput.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ask(questionInput.value);
});

$("#heroAsk").addEventListener("click", () => {
  ask($("#heroPrompt").value);
});

$("#heroPrompt").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    ask($("#heroPrompt").value);
  }
});

$("#newChat").addEventListener("click", () => {
  const chat = makeChat();
  chats.push(chat);
  currentChatId = chat.id;
  save();
  render();
  questionInput.focus();
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    questionInput.value = button.dataset.prompt || "";
    questionInput.focus();
    questionInput.style.height = "auto";
    questionInput.style.height =
      `${Math.min(questionInput.scrollHeight, 130)}px`;
  });
});

questionInput.addEventListener("input", () => {
  questionInput.style.height = "auto";
  questionInput.style.height =
    `${Math.min(questionInput.scrollHeight, 130)}px`;
});

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

fileInput.addEventListener("change", async () => {
  const files = Array.from(fileInput.files || []);

  for (const file of files) {
    const extension = file.name.split(".").pop().toLowerCase();
    const allowed = ["pdf", "txt", "png", "jpg", "jpeg", "webp"];

    if (!allowed.includes(extension)) {
      toast(`Unsupported file: ${file.name}`);
      continue;
    }

    if (documents.some((doc) => doc.name === file.name)) continue;

    let text = "";

    if (extension === "txt") {
      try {
        text = await file.text();
      } catch {
        toast(`Unable to read ${file.name}`);
        continue;
      }
    }

    documents.push({
      id: makeId(),
      name: file.name,
      extension,
      text,
      size: file.size
    });
  }

  renderDocuments();

  if (files.length) {
    toast(
      "Files are selected, but document processing is not connected yet."
    );
  }

  fileInput.value = "";
});

document.querySelectorAll(".nav-btn[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn[data-view]")
      .forEach((nav) => nav.classList.remove("active"));

    button.classList.add("active");

    const views = {
      study: ["Study room", "INTELLISTUDY"],
      personal: ["AI companion", "PERSONAL CHAT"],
      files: ["Knowledge vault", "YOUR MATERIALS"],
      search: ["Explore", "DISCOVER KNOWLEDGE"]
    };

    const [title, crumb] = views[button.dataset.view];

    $("#breadcrumbCurrent").textContent = title;
    $("#heroPrompt").placeholder =
      `Explore ${title.toLowerCase()}...`;

    verificationStatus.textContent = button.dataset.view === "files"
      ? "PDF and image processing is not connected yet"
      : backendConnected
        ? "Llama API connected"
        : "Evidence verification: not connected";

    welcomeSection.hidden = Boolean(currentChat()?.messages?.length);
    $("#breadcrumbCurrent").title = crumb;

    if (button.dataset.view === "files") {
      toast("Use the plus button to select files.");
    }
  });
});

load();
render();
