// ---------- 상태 ----------
const MAX_ENERGY = 100;
const CELL_COUNT = 20;
let energy = 0;
let charged = false;

const gaugeCells = document.getElementById('gaugeCells');
const gaugePercent = document.getElementById('gaugePercent');
const gaugeStatus = document.getElementById('gaugeStatus');
const scenePlayground = document.getElementById('scenePlayground');
const sceneVillage = document.getElementById('sceneVillage');
const touchField = document.getElementById('touchField');
const resetBtn = document.getElementById('resetBtn');

// ---------- 게이지 셀 생성 ----------
for (let i = 0; i < CELL_COUNT; i++) {
  gaugeCells.appendChild(document.createElement('span'));
}
const cellEls = gaugeCells.querySelectorAll('span');

function updateGauge() {
  gaugePercent.textContent = Math.round(energy);
  const litCells = Math.round((energy / MAX_ENERGY) * CELL_COUNT);
  cellEls.forEach((cell, i) => cell.classList.toggle('filled', i < litCells));

  if (energy <= 0) gaugeStatus.textContent = '가동 대기 중';
  else if (energy < MAX_ENERGY) gaugeStatus.textContent = '충전 중';
  else gaugeStatus.textContent = '충전 완료';
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
    const distance = 28 + Math.random() * 20;
    spark.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
    spark.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
    layer.appendChild(spark);
    setTimeout(() => spark.remove(), 650);
  }
}

// ---------- 놀이기구 터치 처리 ----------
function playDevice(key) {
  if (charged) return;

  burstSpark(key);

  // 터치 1회당 20%씩 충전, 100%를 넘지 않도록 제한
  const gain = Math.min(20, MAX_ENERGY - energy);
  energy = Math.min(MAX_ENERGY, energy + gain);
  updateGauge();

  if (energy >= MAX_ENERGY && !charged) {
    charged = true;
    touchField.classList.add('hidden');
    setTimeout(transitionToVillage, 500);
  }
}

// 손가락 버튼 클릭 처리 (+ 눌림/발광 피드백)
touchField.addEventListener('click', (e) => {
  const btn = e.target.closest('.touch-btn');
  if (!btn) return;
  btn.classList.remove('tapped');
  void btn.offsetWidth; // 애니메이션 재시작을 위한 강제 리플로우
  btn.classList.add('tapped');
  playDevice(btn.dataset.device);
});

// ---------- 장면 전환: 놀이터 → 마을 ----------
function transitionToVillage() {
  scenePlayground.classList.remove('active');
  sceneVillage.classList.add('active');
  setTimeout(() => sceneVillage.classList.add('lit'), 700);
}

// ---------- 리셋 ----------
function resetAll() {
  energy = 0;
  charged = false;
  updateGauge();
  sceneVillage.classList.remove('lit');
  sceneVillage.classList.remove('active');
  scenePlayground.classList.add('active');
  touchField.classList.remove('hidden');
}

resetBtn.addEventListener('click', resetAll);

// 초기화
updateGauge();
