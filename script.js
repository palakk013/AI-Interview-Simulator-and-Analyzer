
let performanceChartInstance = null;
let questionsDB = {};

async function loadQuestions() {
  const res = await fetch("questions.json");
  questionsDB = await res.json();
}

const savedData = JSON.parse(localStorage.getItem('aiInterviewData')) || {};
function saveProgress() {
  localStorage.setItem(
    'aiInterviewData',
    JSON.stringify({
      totalMocks: appState.totalMocks,
      overallScore: appState.overallScore,
      weakTopics: appState.weakTopics,
      history: appState.history,
      activityDates: appState.activityDates
    })
  );
}
let appState = {
  username: "",
  totalMocks: savedData.totalMocks || 0,
  overallScore: savedData.overallScore || 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,
  sessionScores: [],
  weakTopics: savedData.weakTopics || [],
  history: savedData.history || [],
  activityDates: savedData.activityDates || []
};

function loadQuestionsForProfile(profile, difficulty) {

  if (!questionsDB[profile]) {
    alert("No questions found for this field.");
    return;
  }

  let allQuestions = questionsDB[profile][difficulty] || [];

  // shuffle questions
  allQuestions = [...allQuestions].sort(() => 0.5 - Math.random());

  // pick 5 questions
  appState.sessionQuestions = allQuestions.slice(0, 5);

  appState.currentQuestionIndex = 0;
}
window.onload = async function () {

  await loadQuestions();

  const loginLayout = document.getElementById('login-layout');
  const appLayout = document.getElementById('app-layout');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const savedUser = localStorage.getItem('aiInterviewUsername');
  if (savedUser && loginLayout && appLayout) {
    appState.username = savedUser;
    document.getElementById('welcome-msg').textContent = `Welcome back, ${savedUser}!`;
    document.getElementById('display-name').textContent = savedUser;
    document.querySelector('.avatar').textContent = savedUser.charAt(0).toUpperCase();
    loginLayout.style.display = 'none';
    appLayout.style.display = 'flex';
    initDashboard();
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const user = document.getElementById('login-user').value.trim();
      if(user) {
        appState.username = user;
        localStorage.setItem('aiInterviewUsername', user); 
        document.getElementById('welcome-msg').textContent = `Welcome back, ${user}!`;
        document.getElementById('display-name').textContent = user;
        document.querySelector('.avatar').textContent = user.charAt(0).toUpperCase();
        loginLayout.style.display = 'none';
        appLayout.style.display = 'flex';
        initDashboard();
      } else {
        alert("Please enter a username.");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('aiInterviewUsername'); 
      appLayout.style.display = 'none';
      loginLayout.style.display = 'flex';
      document.getElementById('profile-dropdown').classList.remove('show');
    });
  }

  const profileToggle = document.getElementById('profile-toggle');
  if (profileToggle) {
    profileToggle.addEventListener('click', () => {
      document.getElementById('profile-dropdown').classList.toggle('show');
    });
  }

  const navLinks = document.querySelectorAll('#nav-links li');
  const pages = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('page-title');

  function navigateTo(targetId, title) {
    navLinks.forEach(nav => nav.classList.remove('active'));
    pages.forEach(page => page.classList.remove('active-view'));
    const targetLink = Array.from(navLinks).find(link => link.getAttribute('data-target') === targetId);
    if (targetLink) targetLink.classList.add('active');
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active-view');
    if (pageTitle) pageTitle.textContent = title;
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function() { navigateTo(this.getAttribute('data-target'), this.textContent); });
  });

  const startPracticeBtn = document.getElementById('start-practice-btn');
  if (startPracticeBtn) {
    startPracticeBtn.addEventListener('click', () => navigateTo('planner-page', 'Planner & Topics'));
  }

const fieldTopicsDb = {
  "SDE": [
    "Data Structures & Algorithms",
    "System Design",
    "Object-Oriented Programming",
    "Operating Systems",
    "Database Management Systems"
  ],

  "Web Developer": [
    "HTML & CSS",
    "JavaScript",
    "React / Frontend Frameworks",
    "REST APIs",
    "Authentication & Security"
  ],

  "App Developer": [
    "Mobile UI Design",
    "Android / iOS Development",
    "API Integration",
    "State Management",
    "App Performance Optimization"
  ],

  "Data Scientist": [
    "Machine Learning",
    "Statistics",
    "Data Cleaning",
    "Python for Data Science",
    "Model Evaluation"
  ],

  "DevOps Engineer": [
    "CI/CD Pipelines",
    "Docker & Containers",
    "Kubernetes",
    "Cloud Infrastructure",
    "Monitoring & Logging"
  ]
};

  const fieldSelect = document.getElementById('planner-field-select');
  const topicsContainer = document.getElementById('dynamic-topics-container');
  const topicsTagsBox = document.getElementById('dynamic-topics-tags');
  const generateBtn = document.getElementById('generate-interview-btn');

if (fieldSelect) {
  fieldSelect.addEventListener('change', (e) => {
    const selectedField = e.target.value;
    const topics = fieldTopicsDb[selectedField] || fieldTopicsDb["SDE"];

    topicsTagsBox.innerHTML = "";

    topics.forEach(topic => {
      let span = document.createElement('span');
      span.className = "topic-tag";
      span.textContent = topic;
      topicsTagsBox.appendChild(span);
    });

    topicsContainer.style.display = 'block';
    generateBtn.style.display = 'block';   // ← THIS makes button appear
  });
}
  const questionText = document.getElementById('ai-question-text');
  const answerBox = document.getElementById('user-answer-box');
  const analyzeBtn = document.getElementById('analyze-btn');
  const nextBtn = document.getElementById('next-question-btn');
  const progressText = document.getElementById('interview-progress');
  const feedbackBox = document.getElementById('live-feedback-box');
  const feedbackText = document.getElementById('live-feedback-text');
  const scoreBadge = document.getElementById('live-score-badge');
if (generateBtn) {
generateBtn.addEventListener('click', async () => {

  const selectedField = fieldSelect.value;
  const difficulty = document.getElementById("planner-difficulty-select").value;

  if (!difficulty) {
    alert("Please select a difficulty level.");
    return;
  }

  loadQuestionsForProfile(selectedField, difficulty);

  appState.sessionScores = [];

  loadQuestion();

  navigateTo('live-page', 'Live Interview');
});
}
function loadQuestion() {
    if (!answerBox || !questionText) return;

    answerBox.value = "";
    answerBox.disabled = false;

    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = "1";
    analyzeBtn.style.cursor = "pointer";
    analyzeBtn.style.display = "block";
    analyzeBtn.textContent = "Analyze Answer";

    nextBtn.style.display = "none";
    feedbackBox.style.display = "none";

    progressText.textContent = `Question ${appState.currentQuestionIndex + 1} of ${appState.sessionQuestions.length}`;
    questionText.textContent = appState.sessionQuestions[appState.currentQuestionIndex];
}
  if (analyzeBtn) {
analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "Analyzing...";
    analyzeBtn.style.opacity = "0.6";
    analyzeBtn.style.cursor = "not-allowed";

    let GEMINI_API_KEY;
try {
  const keyRes = await fetch('/api/getkey');
  const keyData = await keyRes.json();
  GEMINI_API_KEY = keyData.key;
} catch (e) {
  GEMINI_API_KEY = "";
}

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a technical interviewer.
Question: "${appState.sessionQuestions[appState.currentQuestionIndex]}"
User Answer: "${answerBox.value.trim()}"

Score the answer from 0-100 and give concise feedback.

Return EXACTLY:

Score: <number>
Feedback: <short feedback>`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      if (!response.ok || !data.candidates || !data.candidates[0]) {
  const errMsg = data?.error?.message || `API error ${response.status}`;
  alert("AI Error: " + errMsg);
  analyzeBtn.disabled = false;
  analyzeBtn.innerText = "Analyze Answer";
  analyzeBtn.style.opacity = "1";
  analyzeBtn.style.cursor = "pointer";
  return;
}
      const aiReply = data.candidates[0].content.parts[0].text;

      // extract score
      const scoreMatch = aiReply.match(/\d+/);
      const score = scoreMatch ? parseInt(scoreMatch[0]) : 70;

      scoreBadge.textContent = score + "%";
      scoreBadge.style.display = "inline-block";

      appState.sessionScores.push(score);
      answerBox.disabled = true;

      feedbackText.textContent = aiReply;
      feedbackBox.style.display = "block";

      analyzeBtn.style.display = "none";
      nextBtn.style.display = "block";

      // set next button behavior
     // set next button behavior
if (appState.currentQuestionIndex === appState.sessionQuestions.length - 1) {
  nextBtn.textContent = "Submit & View Results";
  nextBtn.style.background = "#3b49df";
  nextBtn.style.color = "white";
  nextBtn.onclick = finishSession;
} else {
  nextBtn.textContent = "Next Question";
  nextBtn.style.background = "";
  nextBtn.style.color = "";
  nextBtn.onclick = () => {
    appState.currentQuestionIndex++;
    loadQuestion();
  };
}
    } catch (error) {
      console.error(error);
      alert("AI analysis failed. Try again.");
      analyzeBtn.disabled = false;
      analyzeBtn.innerText = "Analyze Answer";
      analyzeBtn.style.opacity = "1";
      analyzeBtn.style.cursor = "pointer";
    }
  });
}

function finishSession() {
  // Calculate average of this session
  let avgScore = Math.round(appState.sessionScores.reduce((a,b)=>a+b,0) / appState.sessionScores.length);

  // Update overall score
  appState.overallScore = Math.round((appState.overallScore + avgScore)/2);
  appState.totalMocks++;

  // Update dashboard completed count
  const dashComp = document.getElementById('dash-completed');
  if(dashComp) dashComp.textContent = appState.totalMocks;

  // Add to history list
  const historyUl = document.getElementById('dash-history');
  if(historyUl && fieldSelect.options[fieldSelect.selectedIndex]) {
    let newHistory = document.createElement('li');
    let fieldName = fieldSelect.options[fieldSelect.selectedIndex].text;
    newHistory.textContent = `Completed Session - ${fieldName} (Avg Score: ${avgScore}%)`;
    historyUl.prepend(newHistory);
  }

  // Show session scores and average
  const resultsDiv = document.getElementById('feedback-content');
  if(resultsDiv) {
    let scoresHTML = appState.sessionScores.map((s,i) => `<li>Q${i+1}: ${s}%</li>`).join("");
    resultsDiv.innerHTML = `
      <p style="font-size: 18px;">Session Complete! Your average score across all questions was <strong style="color:#39d353;">${avgScore}%</strong>.</p>
      <ul>${scoresHTML}</ul>
    `;
  }

  // Update chart if exists
  if(performanceChartInstance) {
     performanceChartInstance.data.datasets[0].data = [appState.overallScore, 100 - appState.overallScore];
     performanceChartInstance.update();
  }

  nextBtn.style.background = "transparent";
  nextBtn.style.color = "#3b49df";

  navigateTo('results-page', 'Results & Feedback');
}
  function initDashboard() {
    const canvas = document.getElementById("performanceChart");
    try {
      if(typeof Chart !== 'undefined' && canvas && !performanceChartInstance) {
        const centerTextPlugin = {
          id: 'centerText',
          beforeDraw(chart) {
            const { width, height, ctx } = chart; ctx.restore();
            const fontSize = (height / 100).toFixed(2); ctx.font = `${fontSize}em sans-serif`; ctx.textBaseline = "middle";
            const currentText = chart.data.datasets[0].data[0] + "%";
            const textX = Math.round((width - ctx.measureText(currentText).width) / 2); const textY = height / 2;
            ctx.fillStyle = "#ffffff"; ctx.fillText(currentText, textX, textY); ctx.save();
          }
        };
        performanceChartInstance = new Chart(canvas, {
          type: "doughnut",
          data: { datasets: [{ data: [appState.overallScore, 100 - appState.overallScore], backgroundColor: ["#3b49df", "#322d46"], borderWidth: 0 }] },
          options: { cutout: "75%", plugins: { legend: { display: false }, tooltip: { enabled: false } }, animation: { animateScale: true } },
          plugins: [centerTextPlugin] 
        });
      }
    } catch(e) { console.error("Chart failed to load.", e); }
    generateYearHeatmap();
  }

  function generateYearHeatmap() {
    const heatmap = document.getElementById("heatmap");
    const monthsDiv = document.getElementById("months");
    if (!heatmap || !monthsDiv) return;
    heatmap.innerHTML = ""; monthsDiv.innerHTML = "";
    for (let i = 0; i < 364; i++) {
      let cell = document.createElement("div");
      cell.className = "day" + (Math.random() > 0.7 ? ` level-${Math.floor(Math.random() * 4)+1}` : "");
      heatmap.appendChild(cell);
    }
 ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].forEach((m, i) => {
      let div = document.createElement("div"); div.textContent = m;
      div.style.gridColumn = Math.floor(i * 4.3) + 1; monthsDiv.appendChild(div);
    });
  }
};
