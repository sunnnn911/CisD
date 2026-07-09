// ---------- 상태 ----------
const MAX_ENERGY = 100;
const CELL_COUNT = 20;
let energy = 0;
let charged = false;

// 놀이기구별 애니메이션 대상 요소와 지속 시간(ms)
const devices = {
  slide:     { el: document.getElementById('rider-slide'),     duration: 900 },
  swing:     { el: document.getElementById('rider-swing'),     duration: 900 },
  seesaw:    { el: document.getElementById('rider-seesaw'),    duration: 900 },
  carousel:  { el: document.getElementById('rider-carousel'),  duration: 900 },
  numberpad: { el: document.getElementById('rider-numberpad'), duration: 350 },
  wheel:     { el: document.getElementById('rider-wheel'),     duration: 900 },
};

const gaugeCells = document.getElementById('gaugeCells');
const gaugePercent = document.getElementById('gaugePercent');
const gaugeStatus = document.getElementById('gaugeStatus');
const playground = document.getElementById('playground');
const village = document.getElementById('village');
const villageMessage = document.getElementById('villageMessage');
const resetBtn = document.getElementById('resetBtn');

// ---------- 게이지 셀 생성 ----------
for (let i = 0; i < CELL_COUNT; i++) {
  const span = document.createElement('span');
  gaugeCells.appendChild(span);
}
const cellEls = gaugeCells.querySelectorAll('span');

function updateGauge() {
  gaugePercent.textContent = Math.round(energy);
  const litCells = Math.round((energy / MAX_ENERGY) * CELL_COUNT);
  cellEls.forEach((cell, i) => {
    cell.classList.toggle('filled', i < litCells);
  });

  if (energy <= 0) {
    gaugeStatus.textContent = '가동 대기 중';
  } else if (energy < MAX_ENERGY) {
    gaugeStatus.textContent = '충전 중';
  } else {
    gaugeStatus.textContent = '충전 완료';
  }
}

// ---------- 스파크 이펙트 ----------
function burstSpark(deviceKey) {
  const layer = document.getElementById('spark-' + deviceKey);
  if (!layer) return;
  const count = 8;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 30 + Math.random() * 20;
    spark.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
    spark.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
    spark.style.left = '50%';
    spark.style.top = '50%';
    layer.appendChild(spark);
    setTimeout(() => spark.remove(), 650);
  }
}

// ---------- 놀이기구 클릭 처리 ----------
function playDevice(key) {
  if (charged) return;

  const device = devices[key];
  if (!device || !device.el) return;

  // 애니메이션 재생 (재시작을 위해 클래스 리셋)
  device.el.classList.remove('playing');
  void device.el.offsetWidth; // 리플로우 강제로 애니메이션 재시작 허용
  device.el.classList.add('playing');
  setTimeout(() => device.el.classList.remove('playing'), device.duration);

  burstSpark(key);

  const card = document.querySelector(`.device-card[data-device="${key}"]`);
  if (card) {
    card.classList.add('charged');
    setTimeout(() => card.classList.remove('charged'), 500);
  }

  // 클릭 1회당 20%씩 충전, 100%를 넘지 않도록 제한
  const gain = Math.min(20, MAX_ENERGY - energy);
  energy = Math.min(MAX_ENERGY, energy + gain);
  updateGauge();

  if (energy >= MAX_ENERGY && !charged) {
    charged = true;
    setTimeout(lightUpVillage, 400);
  }
}

playground.addEventListener('click', (e) => {
  const card = e.target.closest('.device-card');
  if (!card) return;
  playDevice(card.dataset.device);
});

// ---------- 마을 점등 ----------
function lightUpVillage() {
  village.classList.add('lit');
  villageMessage.textContent = '에너지 놀이터가 만든 전력으로 마을에 불이 켜졌습니다';
  playground.classList.add('disabled');
}

// ---------- 리셋 ----------
function resetAll() {
  energy = 0;
  charged = false;
  updateGauge();
  village.classList.remove('lit');
  villageMessage.textContent = '아직 마을에는 전력이 공급되지 않았습니다';
  playground.classList.remove('disabled');
  document.querySelectorAll('.device-card').forEach(c => c.classList.remove('charged'));
}

resetBtn.addEventListener('click', resetAll);

// 초기화
updateGauge();
