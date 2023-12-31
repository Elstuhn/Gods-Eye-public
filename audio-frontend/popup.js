showLatestTranscript();
chrome.storage.local.get("transcript", ({ transcript }) => {
  if (transcript && transcript !== "") {
    document.getElementById("stop").disabled = false;
    document.getElementById("start").disabled = true;
  }
});
getCurrentTab().then((tab) => {
  window.elliottTab = tab;
});

document.getElementById("stop").addEventListener("click", async () => {
  document.getElementById("stop").disabled = true;
  document.getElementById("start").disabled = false;
  const tab = await getCurrentTab();
  if (!tab) return alert("Require an active tab");
  chrome.tabs.sendMessage(tab.id, { message: "stop" });
});

document.getElementById("clear").addEventListener("click", async () => {
  const res = await fetch("http://localhost:5000/clear", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: input,
      url: window.elliottTab.url,
    }),
  });
});

document.getElementById("scribe").addEventListener("click", async () => {
  document.getElementById("stop").disabled = true;
  document.getElementById("scribe").disabled = true;
  fetch("http://localhost:5000/scribe", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: window.elliottTab.url,
  }),
})
  .then((res) => res.blob())
  .then((blob) => {
    const objectURL = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: objectURL,
      filename: "minutes.docx",
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
  /*
  await fetch("http://localhost:5000/scribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: window.elliottTab.url,
    }),
  }).then((res) => {
    var blob = res.blob(type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    //var blob = new Blob(res, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const objectURL = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: objectURL,
      //filename: "./minutes.docx"
    });
  });
  */
});

document.getElementById("notion").addEventListener("click", async () => {
  document.getElementById("stop").disabled = true;
  document.getElementById("notion").disabled = true;
  fetch("http://localhost:5000/notion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: window.elliottTab.url,
    }),
  })
  document.getElementById("notion").disabled = false;
  document.getElementById("stop").disabled = false;
});

document.getElementById("start").addEventListener("click", async () => {
  const tab = await getCurrentTab();
  document.getElementById("stop").disabled = false;
  document.getElementById("start").disabled = true;
  if (!tab) return alert("Require an active tab");
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["main.js"],
  });
});

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onMessage.addListener(({ message }) => {
  if (message == "transcriptavailable") {
    console.log(showLatestTranscript());
  }
});

chrome.runtime.onMessage.addListener(({ message }) => {
  if (message == "stop") {
    socket.close();
    alert("Transcription ended");
    console.log("message", message);
  }
});

function showLatestTranscript() {
  chrome.storage.local.get("transcript", ({ transcript }) => {
    // document.getElementById("transcript").innerHTML = transcript;
  });
}

async function sendQuestion(e) {
  e.preventDefault();
  const input = document.getElementById("question-input").value;
  const res = await fetch("http://localhost:5000/questioning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: input,
      url: window.elliottTab.url,
    }),
  });
  const data = await res.json();
  const qnaDiv = document.getElementById("qna");
  // <div style="margin-top: 1rem">
  //       <p id="question">Q: <strong>What is this about?</strong></p>
  //       <p id="answer">Reluvape: <strong>this is about you</strong></p>
  //     </div>
  const div = document.createElement("div");
  div.style.marginTop = "1rem";
  const question = document.createElement("p");
  question.id = "question";
  question.innerHTML = `Q: <strong>${input}</strong>`;
  const answer = document.createElement("p");
  answer.id = "answer";
  answer.innerHTML = `Reluvape: <strong>${data.answer}</strong>`;
  div.appendChild(question);
  div.appendChild(answer);
  qnaDiv.appendChild(div);
  document.getElementById("question-input").value = "";
}
