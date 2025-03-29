const startTimeInput = document.getElementById("startTimeInput");
const seedDataInput = document.getElementById("seedData");
const startBtn = document.getElementById("startShow");
const fillBtn = document.getElementById("fillDefaults");
const settingsPanel = document.getElementById("settings");
const main = document.querySelector("main");

const defaultSeedData = `## trivia
What year was GitHub founded? | 2008
Which company created TypeScript? | Microsoft
What does CSS stand for? | Cascading Style Sheets
What HTTP status code means “Unauthorized”? | 401
Which HTML element is used to embed JavaScript? | <script>
What language does Node.js let you run outside the browser? | JavaScript
What command installs packages in npm? | npm install
Which Houston museum is located in Hermann Park and known for its IMAX? | Houston Museum of Natural Science
What NASA program was headquartered in Houston and landed humans on the moon? | Apollo
What does the acronym API stand for? | Application Programming Interface

## icebreakers
What’s a local business or venue you’d recommend to someone new in Houston?
Have you ever debugged something totally bizarre? What happened?
What’s a tech topic you’d love to give a lightning talk on?
Which open source projects are you watching or contributing to?
What's your current favorite dev tool or browser extension?
If you could automate any annoying life task, what would it be?
What’s a coding “aha” moment you remember clearly?
Where do you usually work or study when not at home?
Are you more of a “build from scratch” or “use a framework” kind of person?
What's a non-coding hobby that helps you unwind?
`;

fillBtn.addEventListener("click", () => {
    seedDataInput.value = defaultSeedData;
});

let triviaPool = [],
    icebreakerPool = [],
    slideSequence = [];
let startTime = null;
let sequenceIndex = 0;

const slideColors = [
    "#2c3e50",
    "#34495e",
    "#3b3b98",
    "#2e4053",
    "#1c2833",
];

function toggleSettings() {
    settingsPanel.classList.toggle("show");
}

function parseSeedData(text) {
    const lines = text.split("\n");
    const trivia = [];
    const icebreakers = [];
    let mode = null;

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith("## trivia")) mode = "trivia";
        else if (line.startsWith("## icebreakers")) mode = "icebreaker";
        else if (line && mode === "trivia" && line.includes("|")) {
            const [q, a] = line.split("|").map((s) => s.trim());
            trivia.push({ question: q, answer: a });
        } else if (line && mode === "icebreaker") {
            icebreakers.push(line);
        }
    }
    return { trivia, icebreakers };
}

function updateCountdownText() {
    const now = new Date();
    const diff = startTime - now;
    const minutes = Math.max(0, Math.ceil(diff / 60000));
    return `Event starts in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

function buildSlideSequence() {
    slideSequence.length = 0;
    for (let i = 0; i < triviaPool.length; i++) {
        const trivia = triviaPool[i];
        slideSequence.push({ type: "trivia", content: trivia.question });
        slideSequence.push({ type: "countdown" });
        if (icebreakerPool.length) {
            slideSequence.push({
                type: "icebreaker",
                content: icebreakerPool[i % icebreakerPool.length],
            });
        }
        slideSequence.push({ type: "countdown" });
        slideSequence.push({
            type: "answer",
            content: trivia.answer,
            reference: trivia.question,
        });
        slideSequence.push({ type: "countdown" });
        if (icebreakerPool.length) {
            slideSequence.push({
                type: "icebreaker",
                content: icebreakerPool[(i + 1) % icebreakerPool.length],
            });
        }
    }
}

function createSlide(item, background) {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.style.backgroundColor = background;

    let content = "";
    if (item.type === "countdown") {
        content = `<p>${updateCountdownText()}</p>`;
    } else if (item.type === "answer") {
        content = `<h4>Answer to:</h4><p><em>${item.reference}</em></p><h2>${item.content}</h2>`;
    } else {
        const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        content = `<h4>${label}</h4><h2>${item.content}</h2>`;
    }

    slide.innerHTML = content;
    main.appendChild(slide);
    return slide;
}

function showSlide() {
    const prev = document.querySelector(".slide.active");
    if (prev) {
        prev.classList.remove("active");
        prev.classList.add("outgoing");
        setTimeout(() => {
            prev.remove();
        }, 5000);
    }

    const item = slideSequence[sequenceIndex % slideSequence.length];
    const color =
        item.type === "countdown"
            ? "#222"
            : slideColors[sequenceIndex % slideColors.length];
    const slide = createSlide(item, color);

    requestAnimationFrame(() => {
        slide.classList.add("active");
    });

    sequenceIndex++;
}

startBtn.addEventListener("click", () => {
    const parsed = parseSeedData(seedDataInput.value);
    triviaPool = parsed.trivia;
    icebreakerPool = parsed.icebreakers;

    const timeVal = startTimeInput.value;
    if (timeVal) {
        startTime = new Date(timeVal);
        localStorage.setItem("startTime", timeVal);
    }

    localStorage.setItem("seedData", seedDataInput.value);
    sequenceIndex = 0;
    buildSlideSequence();
    showSlide();
});

window.addEventListener("load", () => {
    const storedTime = localStorage.getItem("startTime");
    const storedData = localStorage.getItem("seedData");

    if (storedTime) {
        startTime = new Date(storedTime);
        startTimeInput.value = storedTime;
    }
    if (storedData) {
        seedDataInput.value = storedData;
    }
});

setInterval(() => {
    showSlide();
}, 30000);
