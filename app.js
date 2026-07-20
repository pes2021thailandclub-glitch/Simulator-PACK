// DOM elements from index.html (เพิ่มปุ่มเปิดฟรี)
const slider = document.getElementById("coinSlider");
const input = document.getElementById("coinInput");
const dashboardSummary = document.getElementById("dashboardSummary");
const compareGrid = document.getElementById("compareGrid");
const probabilityTableBody = document.getElementById("probabilityTableBody");
const openFreeBtn = document.getElementById("openFreeBtn"); // เพิ่มปุ่มเปิดฟรี
const openSingleBtn = document.getElementById("openSingleBtn");
const openTenBtn = document.getElementById("openTenBtn");
const resetOpeningBtn = document.getElementById("resetOpeningBtn");
const openingSummary = document.getElementById("openingSummary");
const openingStats = document.getElementById("openingStats");
const openingHistory = document.getElementById("openingHistory");
const standardGrid = document.getElementById("standardCardsGrid");
const simulationCountInput = document.getElementById("simulationCount");
const runSimulationBtn = document.getElementById("runSimulationBtn");
const simulationResults = document.getElementById("simulationResults");

// Constants
const totalPoolSize = 150;
const standardCardImageUrl = "https://www.konami.com/efootball/s/img/page/dreamteam/card_standard.jpg";

// 1. ปรับข้อมูลการ์ดตามแพ็คใหม่ (Epic 1, Show Time 5, Highlight 6, Standard 138)
const epicCardsData = [
  { name: "Rodri", image: "https://efimg.com/efootballhub22/images/player_cards/89138556678367_l.png" }
];

const showTimeCardsData = [
  { name: "Marc Cucurella", image: "https://efimg.com/efootballhub22/images/player_cards/106787651045215_l.png" },
  { name: "Unai Simon", image: "https://efimg.com/efootballhub22/images/player_cards/106787651035597_l.png" },
  { name: "Dani Olmo", image: "https://efimg.com/efootballhub22/images/player_cards/106787651039542_l.png" },
  { name: "Lamine Yamal", image: "https://efimg.com/efootballhub22/images/player_cards/106787651090754_l.png" },
  { name: "Ferran Torres", image: "https://efimg.com/efootballhub22/images/player_cards/106787651045391_l.png" }
];

const highlightCardsData = [
  { name: "Aymeric Laporte", image: "https://efimg.com/efootballhub22/images/player_cards/105854569331106_l.png" },
  { name: "Mikel Merino", image: "https://efimg.com/efootballhub22/images/player_cards/105854569387197_l.png" },
  { name: "Fabian Ruiz", image: "https://efimg.com/efootballhub22/images/player_cards/105854569391823_l.png" },
  { name: "Pedro Porro", image: "https://efimg.com/efootballhub22/images/player_cards/105854569403412_l.png" },
  { name: "Alex Baena", image: "https://efimg.com/efootballhub22/images/player_cards/105854569418342_l.png" },
  { name: "Pau Cubarsi", image: "https://efimg.com/efootballhub22/images/player_cards/105854569449280_l.png" }
];

const standardCardsData = Array.from({ length: 138 }, (_, index) => ({
  name: `Standard Player ${index + 1}`,
  rarity: "standard",
  image: standardCardImageUrl
}));

// State variables
let openedCards = [];
let totalCoinsSpent = 0;
let openedCardKeys = new Set();
let remainingPackPool = [];
let isFreeChanceUsed = false; // รักษาสถานะเปิดฟรี (ใช้ได้ครั้งเดียว)

// Initialization of main catalog cards
function createCard(type, index, cardData, isOpened = false) {
  // เพิ่ม Badge สำหรับ Show Time
  const badgeText = type === "epic" ? "Epic" : type === "showtime" ? "ShowTime" : type === "highlight" ? "Highlight" : "Standard";
  
  const imageHtml = cardData.image
    ? `<img class="player-image" src="${cardData.image}" alt="${cardData.name}" onerror="this.style.display='none'; this.parentElement.classList.add('image-missing')">`
    : "";

  const cardId = type === "epic"
    ? `epic-${index}`
    : type === "showtime"
      ? `st-${index}`
      : type === "highlight"
        ? `hl-${index}`
        : `standard-${index}`;

  const placeholderHtml = type === "standard" && !cardData.image
    ? `<div class="standard-placeholder">★</div>`
    : "";

  return `
    <div class="player-card ${type} ${isOpened ? "opened" : ""}" id="${cardId}">
      <div class="card-content">
        ${imageHtml}
        ${placeholderHtml}
        <div class="card-label">${cardData.name}</div>
        <div class="card-subtext">${badgeText}</div>
      </div>
      <div class="checkmark">✓</div>
    </div>
  `;
}

function initCards() {
  standardGrid.innerHTML = '';

  // รวม Show Time เข้าไปใน Catalog Grid ด้วย
  const combinedCards = [
    ...epicCardsData.map((card, index) => ({ type: "epic", index, cardData: card })),
    ...showTimeCardsData.map((card, index) => ({ type: "showtime", index, cardData: card })),
    ...highlightCardsData.map((card, index) => ({ type: "highlight", index, cardData: card })),
    ...standardCardsData.map((card, index) => ({ type: "standard", index, cardData: card }))
  ];

  combinedCards.forEach((item) => {
    standardGrid.innerHTML += createCard(item.type, item.index, item.cardData);
  });
}

function createOpeningPool() {
  // เพิ่ม Show Time เข้าไปใน Pool การเปิดซอง
  return shufflePool([
    ...epicCardsData.map((card, index) => ({ type: "epic", index, cardData: card, key: `epic-${index}` })),
    ...showTimeCardsData.map((card, index) => ({ type: "showtime", index, cardData: card, key: `st-${index}` })),
    ...highlightCardsData.map((card, index) => ({ type: "highlight", index, cardData: card, key: `hl-${index}` })),
    ...standardCardsData.map((card, index) => ({ type: "standard", index, cardData: card, key: `standard-${index}` }))
  ]);
}

function resetOpeningState() {
  openedCards = [];
  totalCoinsSpent = 0;
  openedCardKeys = new Set();
  remainingPackPool = createOpeningPool();
  isFreeChanceUsed = false; // รีเซ็ตสถานะเปิดฟรี
  if (openFreeBtn) openFreeBtn.disabled = false; // เปิดให้กดฟรีใหม่ได้เมื่อรีเซ็ต
  
  openingSummary.innerHTML = 'No cards opened yet<br><span class="opening-user">Opened by: You</span>';
  openingStats.textContent = `Coins spent: ${totalCoinsSpent.toLocaleString()}`;
  openingHistory.innerHTML = '';
  document.querySelectorAll('.player-card').forEach((card) => card.classList.remove('opened', 'active'));
  update();
}

function renderOpeningResults() {
  const epicCount = openedCards.filter((item) => item.type === "epic").length;
  const showtimeCount = openedCards.filter((item) => item.type === "showtime").length;
  const highlightCount = openedCards.filter((item) => item.type === "highlight").length;
  const standardCount = openedCards.filter((item) => item.type === "standard").length;
  const openedCount = openedCardKeys.size;
  const remainingCount = totalPoolSize - openedCount;

  openingSummary.innerHTML = `
    <strong>${openedCount} cards</strong> opened from a 150-card pool<br>
    <span class="opening-user">Opened by: You · Epic ${epicCount} · ShowTime ${showtimeCount} · Highlight ${highlightCount} · Standard ${standardCount} · Remaining ${remainingCount} cards</span>
  `;

  // แฟลชประวัติเฉพาะการ์ดตระกูลสเปเชียล (Epic, ShowTime, Highlight)
  openingHistory.innerHTML = openedCards
    .filter((item) => item.type === "epic" || item.type === "showtime" || item.type === "highlight")
    .map((item) => {
      let badgeClass = item.type;
      let badgeText = item.type === "epic" ? "EPIC" : item.type === "showtime" ? "ShowTime" : "Highlight";
      return `
        <div class="opening-history-item">
          <span class="history-badge ${badgeClass}">${badgeText}</span>
          <span>${item.cardData.name}</span>
        </div>
      `;
    }).join("");

  document.querySelectorAll('.player-card').forEach((card) => card.classList.remove('opened'));

  openedCardKeys.forEach((cardId) => {
    const card = document.getElementById(cardId);
    if (card) card.classList.add('opened');
  });
}

function executeDraw(drawCount, isFree = false) {
  const safeCount = Math.max(1, Math.min(10, drawCount));
  const availableCount = Math.min(safeCount, remainingPackPool.length);

  if (availableCount <= 0) {
    alert("Pack pool is empty! Please reset to open again.");
    return;
  }

  // 2. ถ้าเป็นตั๋วฟรี ไม่ต้องหัก Coins คอนฟิกแบบปกติคริตตามจำนวนสุ่ม
  if (!isFree) {
    const coinsUsed = safeCount === 1 ? 100 : 900;
    totalCoinsSpent += coinsUsed;
  } else {
    isFreeChanceUsed = true;
    if (openFreeBtn) openFreeBtn.disabled = true; // กดใช้แล้วปิดปุ่มทันที
  }
  
  const currentDrawResult = [];
  for (let i = 0; i < availableCount; i++) {
    const selectedCard = remainingPackPool.pop();
    if (!selectedCard) break;
    currentDrawResult.push(selectedCard);
    openedCardKeys.add(selectedCard.key);
  }

  openedCards = [...openedCards, ...currentDrawResult];
  openingStats.textContent = `Coins spent: ${totalCoinsSpent.toLocaleString()}${isFreeChanceUsed ? " (ใช้สิทธิ์เปิดฟรีแล้ว)" : ""}`;
  
  renderOpeningResults();
}

// 3. ปรับสถิติในส่วนแดชบอร์ดและการจำลอง (Monte Carlo) ให้รองรับ Show Time
function renderDashboard(result, draw) {
  // สรุปโอกาสการเปิดตามคณิตศาสตร์ทั่วไปเบื้องต้น
  dashboardSummary.innerHTML = `
    <div class="summary-card">
      <span class="summary-label">Draw count</span>
      <span class="summary-value">${draw} draws</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">Epic Chance</span>
      <span class="summary-value" style="color: #fbbf24">${result.epicChance.toFixed(2)}%</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">ShowTime Chance</span>
      <span class="summary-value" style="color: #ec4899">${result.stChance.toFixed(2)}%</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">Expected Value</span>
      <span class="summary-value" style="font-size: 0.95rem; line-height: 1.4;">Epic: ${result.expectedEpic} <br> ST: ${result.expectedSt} <br> HL: ${result.expectedHl}</span>
    </div>
  `;
}

// ฟังก์ชันคำนวณความน่าจะเป็นพื้นฐาน (จำลองโครงสร้างใหม่)
function probability(draws) {
  // พูลใหม่: Epic 1, ST 5, HL 6 -> รวมเป็นการ์ดพิเศษ 12 ใบ จาก 150 ใบ
  const n = 150;
  const kEpic = 1;
  const kSt = 5;
  const kHl = 6;
  
  // โอกาสสุ่มได้ขั้นต่ำ 1 ใบแบบ Hypergeometric (เปิดโดยไม่ใส่คืน)
  const hyperChance = (k, d) => {
    if (d > n - k) return 100; // หากดึงมากเกินกว่าจำนวนที่ไม่มีการ์ดใบนั้น โอกาสจะได้คือ 100%
    let probNoHit = 1;
    for (let i = 0; i < d; i++) {
      probNoHit *= (n - k - i) / (n - i);
    }
    return (1 - probNoHit) * 100;
  };

  return {
    epicChance: hyperChance(epicCardsData.length, draws),
    stChance: hyperChance(showTimeCardsData.length, draws),
    hlChance: hyperChance(highlightCardsData.length, draws),
    expectedEpic: Math.round((epicCardsData.length / n) * draws),
    expectedSt: Math.round((showTimeCardsData.length / n) * draws),
    expectedHl: Math.round((highlightCardsData.length / n) * draws)
  };
}

function renderCompareMode(currentCoin) {
  const compareValues = [1000, 3000, 5000, 10000];

  compareGrid.innerHTML = compareValues.map((coinValue) => {
    const draw = Math.floor(coinValue / 100);
    const result = probability(draw);
    const isActive = coinValue === currentCoin;

    return `
      <div class="compare-card ${isActive ? "active" : ""}">
        <span class="compare-label">${coinValue.toLocaleString()} Coins</span>
        <span class="compare-value">${draw} draws</span>
        <div style="color: #fbbf24; font-weight: 700;">Epic: ${result.epicChance.toFixed(1)}%</div>
        <div style="color: #ec4899; font-weight: 700;">ShowTime: ${result.stChance.toFixed(1)}%</div>
      </div>
    `;
  }).join("");
}

function renderProbabilityTable(currentCoin) {
  const tableValues = [1000, 2000, 3000, 5000, 10000, 15000];

  probabilityTableBody.innerHTML = tableValues.map((coinValue) => {
    const draw = Math.floor(coinValue / 100);
    const result = probability(draw);
    const isActive = coinValue === currentCoin;
    const epicPct = Math.min(100, result.epicChance);
    const stPct = Math.min(100, result.stChance);

    return `
      <tr class="${isActive ? "row-gold-highlight" : ""}">
        <td class="coin-col">${coinValue.toLocaleString()}</td>
        <td class="draw-col">${draw} draws</td>
        <td class="prob-col">
          <div class="progress-wrapper">
            <div class="progress-bar bar-gold" style="width: ${epicPct.toFixed(1)}%"></div>
            <span class="pct-text">${epicPct.toFixed(1)}%</span>
          </div>
        </td>
        <td class="prob-col">
          <div class="progress-wrapper">
            <div class="progress-bar bar-pink" style="width: ${stPct.toFixed(1)}%; background-color:#ec4899;"></div>
            <span class="pct-text">${stPct.toFixed(1)}%</span>
          </div>
        </td>
        <td class="draw-col" style="font-size: 0.85rem; font-weight: 600;">Epic ${result.expectedEpic} · ST ${result.expectedSt}</td>
      </tr>
    `;
  }).join("");
}

// Monte Carlo การจำลองพูลใหม่
function createSimulationPool() {
  return Array.from({ length: 150 }, (_, index) => {
    if (index < epicCardsData.length) return "epic";
    if (index < epicCardsData.length + showTimeCardsData.length) return "showtime";
    if (index < epicCardsData.length + showTimeCardsData.length + highlightCardsData.length) return "highlight";
    return "normal";
  });
}

function shufflePool(pool) {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function runSimulation(draws, iterations) {
  const safeDraws = Math.max(1, Math.min(150, draws));
  const safeIterations = Math.max(100, Math.min(10000, iterations));

  let epicAtLeastOne = 0;
  let stAtLeastOne = 0;
  let epicTotal = 0;
  let stTotal = 0;

  for (let i = 0; i < safeIterations; i++) {
    const drawn = shufflePool(createSimulationPool()).slice(0, safeDraws);
    const epicCount = drawn.filter((card) => card === "epic").length;
    const stCount = drawn.filter((card) => card === "showtime").length;

    if (epicCount > 0) epicAtLeastOne += 1;
    if (stCount > 0) stAtLeastOne += 1;
    epicTotal += epicCount;
    stTotal += stCount;
  }

  return {
    iterations: safeIterations,
    epicChance: (epicAtLeastOne / safeIterations) * 100,
    stChance: (stAtLeastOne / safeIterations) * 100,
    avgEpic: epicTotal / safeIterations,
    avgSt: stTotal / safeIterations
  };
}

function renderSimulation(draws) {
  const iterations = Number(simulationCountInput.value) || 1000;
  const result = runSimulation(draws, iterations);

  simulationResults.innerHTML = `
    <div class="simulation-result-card">
      <small>Epic (at least 1)</small>
      <strong>${result.epicChance.toFixed(1)}%</strong>
    </div>
    <div class="simulation-result-card">
      <small>ShowTime (at least 1)</small>
      <strong>${result.stChance.toFixed(1)}%</strong>
    </div>
    <div class="simulation-result-card">
      <small>Avg Epic per round</small>
      <strong>${result.avgEpic.toFixed(2)}</strong>
    </div>
    <div class="simulation-result-card">
      <small>Avg ST per round</small>
      <strong>${result.avgSt.toFixed(2)}</strong>
    </div>
  `;
}

// 4. ผูก Event Listeners รวมถึงฟังก์ชันเปิดฟรี
if (openFreeBtn) {
  openFreeBtn.addEventListener("click", () => {
    if (!isFreeChanceUsed) {
      executeDraw(1, true); // พารามิเตอร์ที่ 2 ส่ง true เพื่อระบุว่าเป็นฟรี
    }
  });
}
slider.addEventListener("input", update);
input.addEventListener("input", update);
openSingleBtn.addEventListener("click", () => executeDraw(1));
openTenBtn.addEventListener("click", () => executeDraw(10));
resetOpeningBtn.addEventListener("click", resetOpeningState);

runSimulationBtn.addEventListener("click", () => {
  const draw = Math.floor(Number(input.value || slider.value) / 100);
  renderSimulation(draw);
});

function update() {
  let coin = Number(slider.value);

  if (this === input) {
    coin = Number(input.value);
    slider.value = coin;
  } else {
    input.value = coin;
  }

  const draw = Math.min(150, Math.floor(coin / 100));
  document.getElementById("drawCount").innerHTML = draw + " draws";

  const result = probability(draw);

  document.getElementById("epicChance").innerHTML = result.epicChance.toFixed(2) + "%";
  document.getElementById("hlChance").innerHTML = result.hlChance.toFixed(2) + "%";

  renderDashboard(result, draw);
  renderCompareMode(coin);
  renderProbabilityTable(coin);

  document.querySelectorAll('.player-card').forEach(card => card.classList.remove('active'));

  for (let i = 0; i < result.expectedEpic; i++) {
    const card = document.getElementById(`epic-${i}`);
    if (card) card.classList.add('active');
  }

  // ไฮไลต์การ์ด Show Time ในแคตตาล็อกตามความน่าจะเป็นคาดหวัง
  for (let i = 0; i < result.expectedSt; i++) {
    const card = document.getElementById(`st-${i}`);
    if (card) card.classList.add('active');
  }
}

// Initial Run
initCards();
resetOpeningState();
update();
renderSimulation(Math.floor(Number(slider.value) / 100));
