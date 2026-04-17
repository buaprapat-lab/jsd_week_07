// ประกาศ  variables ทั้งหมดก่อน

// หน้าตา bun ที่จะเปลี่ยนแปลงไปแต่ละ stage
const BUN_STATES = [
  "bun-1.png",
  "bun-2.png",
  "bun-3.png",
  "bun-4.png",
  "bun-5.png",
  "bun-6.png",
  "bun-7.png",
  "bun-8.png",
  "bun-9.png",
  "bun-10.png",
  "bun-11.png",
  "bun-11.png",
];

//เมื่อแต้มถึงเท่านี้ ถึงให้ bun เปลี่ยนร่าง
const BUN_THRESHOLDS = [
  0, 20, 60, 150, 300, 500, 800, 1500, 3000, 5000, 7500, 10000,
];

//ชื่อของทั้ง 12 stages

const STAGE_NAMES = [
  "sleepy bun · stage 1",
  "coffee time · stage 2",
  "wake up bun · stage 3",
  "eyes open · stage 4",
  "sleepless bun · stage 5",
  "bloodshot mode · stage 6",
  "part-time barista · stage 7",
  "something's wrong! · stage 8",
  "Eh??? · stage 9",
  "balloons? · stage 10",
  "liftoff soon · stage 11",
  "space bun · final",
];

/* 4. จำนวนเมล็ดกาแฟที่นับได้ แสดงผล และไอคอน lucide ตรง milestone bar */
const MILESTONES = [
  {
    n: 20,
    label: "20",
    msg: "Eyes open! Stage 2",
    lucide_name: "balloon",
  },

  {
    n: 60,
    label: "60",
    msg: "Barista apron unlocked!",
    lucide_name: "balloon",
  },
  {
    n: 150,
    label: "150",
    msg: "Triple tray! Bun is serious",
    lucide_name: "balloon",
  },
  {
    n: 400,
    label: "400",
    msg: "Coffee everywhere!!",
    lucide_name: "balloon",
  },
  {
    n: 1000,
    label: "1k",
    msg: "A balloon appears... uh oh",
    lucide_name: "balloon",
  },
  {
    n: 3000,
    label: "3k",
    msg: "4 balloons! Bun is floating",
    lucide_name: "balloon",
  },
  {
    n: 10000,
    label: "10k",
    msg: "BUN IS IN SPACE!!",
    lucide_name: "balloon",
    isWin: true,
  },
];

//ตั้งค่าการอัพเกรดแต่ละตัวว่าใช้ไปกี่เมล็ด (costs)
const UPGRADES = [
  {
    costs: [30, 100, 300],
    cb: [1, 2, 4],
    ib: [0, 0, 0],
    descs: ["double shot", "triple shot", "quad shot"],
  },
  {
    costs: [80, 250, 700],
    cb: [0, 0, 0],
    ib: [0.4, 1.2, 3],
    descs: ["basic drip", "fast drip", "turbo drip"],
  },
  {
    costs: [200, 600, 1600],
    cb: [2, 4, 8],
    ib: [0.8, 2, 5],
    descs: ["arabica", "geisha", "kopi luwak"],
  },
];

//สร้างหน่วยความจำสถานนะของ player

let beans = 0, // เริ่มต้นที 0
  clickPower = 1, // 1 click ได้ 1 แต้ม
  idleRate = 0, // เริ่มที่ 0 ก่อน เมื่อเริ่มอัพเกรด drip machine ถึงจะ unlock
  lvs = [0, 0, 0]; // กล่อง 3 ใบที่เอาไว้จดเลเวลของอัปเกรดทั้ง 3 อย่าง esprs\esso, drip, alien
let combo = 0, // จำนวนคอมโบ
  lastClick = 0, //  เอาไว้จดว่าผู้เล่น "คลิกครั้งล่าสุด" เมื่อกี่วินาทีที่แล้ว (เพื่อเอามาคำนวณว่าคลิกเร็วพอที่จะได้คอมโบไหม)
  comboTimer = null; // นาฬิกาจับเวลา ถ้านิ้วหยุดคลิกเมื่อไหร่ นาฬิกานี้จะสั่งให้ combo กลับไปเป็น 0
let gameWon = false, // false หมายความว่า ตอนเริ่มเกมมา ผู้เล่นยังเล่นไม่จบนะ (ถ้าแต้มถึง 10,000 เมื่อไหร่ โค้ดจะเปลี่ยนค่านี้เป็น true เพื่อล็อคไม่ให้คลิกต่อได้)
  currentStage = 0; // ตอนนี้หมาอยู่ร่างที่ 0 (ร่างแรกสุด)
let startTime = Date.now(), // จดเวลาแรกสุดที่เปิดเว็บขึ้นมา เอาไว้คำนวณตอนจบเกมว่าใช้เวลาเล่นไปกี่นาที
  totalClicks = 0; // จดว่าคลิกเมาส์ไปทั้งหมดกี่ครั้งแล้ว

//getElementByIdสั่งให้ไปจับชิ้นส่วนใน HTML ไว้เพื่อไปจำ ID html แล้วสั่งให้เปลี่ยนตัวเลขตามแต้มที่มี
const hel = document.getElementById("hcount"); // ไปหาแท็กใน HTML ที่ชื่อ id ว่า hcount แล้วเอามาผูกกับตัวแปรที่ชื่อ hel
const idel = document.getElementById("idle-disp"); // สร้างตัวแปรรีโมทชื่อ idel ไปคุมตัวเลข 0.1/s
const cbadge = document.getElementById("combo-badge"); // เอาไว้สั่งให้มันโผล่มา หรือซ่อนไป ตอนเราคลิกเร็วๆ
const cnum = document.getElementById("combo-num");
const ringWrap = document.getElementById("ring-wrap"); // สร้างตัวแปรไปคุม bun เพื่อที่เวลาแต้มถึงกำหนด JS จะได้กดรีโมทสั่งเปลี่ยนรูปหมาตัวใหม่ได้
const bunImg = document.getElementById("bun-img");
const gameEl = document.getElementById("game");
const stageEl = document.getElementById("stage-label");
const ringFill = document.getElementById("ring-fill");
const ringDot = document.getElementById("ring-dot");
const CIRC = 2 * Math.PI * 108; // สูตรหาความยาวเส้นรอบวงกลม 2TTr, r = 108

// สร้าง Function คำสั่งบอกว่าถ้าเกิดเหตุการณ์นี้ ให้ทำอะไรบ้าง
// สร้างแท็ก HTML ขึ้นมาเองโดยอัตโนมัติตรง Milestones

(function buildMS() {
  const strip = document.getElementById("ms-strip");
  // loops ของ 7 milestones m = ข้อมูลในหน้านั้น เช่น "20", i = ลำดับกล่อง
  MILESTONES.forEach((m, i) => {
    const row = document.createElement("div");
    // ชี้ที่กล่อง <div id="ms-strip"> ใน HTML แล้วบอกว่าให้เตรียมพื้นที่ไว้ เตรียมรอของใหม่มาวาง
    row.className = "ms-row"; // ให้เป็นคลาส ms-row เพื่อทืี่จะได้จัดกล่องแนวนอน
    row.id = "ms" + i; // เอาคำว่า "ms" มาบวกกับลำดับที่ i --> id="ms0" id="ms1"

    /* เปลี่ยนวิธีสร้างไอคอนเป็นใช้ i tag ของ Lucide */

    row.innerHTML = `
      <div class="ms-icon-wrap">
        <i data-lucide="${m.lucide_name}"></i>
      </div>
      <div class="ms-glass"><div class="ms-fill" id="msf${i}"></div></div>
      <div class="ms-label" id="msl${i}">${m.label}</div>`;

    /* เอากล่องที่เราประกอบเสร็จเมื่อกี้ ไปไว้ข้างในสถานที่ก่อสร้าง (strip) ที่จองไว้
      พอคำสั่งนี้ทำงาน กล่องภารกิจกล่องที่ 1 จะ โผล่ขึ้นมาบนหน้าเว็บ
      ทั้งหมดถูกครอบด้วยคำสั่งวนลูป forEach อยู่ แปลว่ามันจะทำขั้นตอน
      สร้างกล่องเปล่า -> ยัดไส้ -> ยกขึ้นโชว์" แบบนี้ซ้ำๆ วนไป */

    strip.appendChild(row);
  });
})();

// 5. สั่งให้ Lucide แปลงแท็ก <i> ทั้งหมดให้กลายเป็นไอคอน
lucide.createIcons();

// จัด format รับค่า n เข้ามาแล้วแปลงโฉม ให้ดุเป็น ...k ในค่าที่จำนวนยาวๆ
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  //ถ้าไม่ถึง 1000 ตัดเศษทิ้ง โชว์แค่เลขกลมๆ
  return Math.floor(n) + "";
}

//ตัวยิง popu up แจ้งเตือน
function toast(msg) {
  const t = document.createElement("div"); //สร้างแทก div เปล่าๆขึ้นมา
  t.className = "toast"; // แปะ class css เอาไปไว้ตกแต่ง
  t.textContent = msg; // เอาช้อความที่ส่งมาไปยัดไว้ในกล่อง
  document.getElementById("toast-area").appendChild(t); // เอาไปแสดงผล
  setTimeout(() => t.remove(), 2700); // setTimeout) ไว้ว่าอีก 2.7 วินาทีให้ทำลายตัวเองทิ้ง
}

//ให้จอสว่างวาบตอน bun แปลงร่าง
function flashScreen() {
  const f = document.getElementById("flash");
  f.classList.remove("go"); // ถอดคลาส go ออกจากจอก่อน
  void f.offsetWidth;
  // ถ้าใส่ลงไปทื่อๆมันจะไม่เปลียนเพราะมีคลาสอยู่แล้ว ต้องหลอก browser ให้ reflow (ไปวัดขนาดหน้าจอ)
  f.classList.add("go"); // สวมรอยคลาส go เข้าไป อมก.เทคนิคอะไรนี่...
}

//เสกตัวเลขให้บินได้เวลาคลิก โดยรับค่าพิกัดเมาส์มา x, y และข้อความ txt เช่น +1
function spawnParticle(x, y, txt) {
  const p = document.createElement("div"); // เสกกล่อง
  p.className = "particle"; // บอก css ว่านี่คือเอฟเฟคตัวเลขให้ลอยขึ้นฟ้า
  p.style.setProperty("--r", Math.random() * 28 - 14 + "deg"); // แรนด้อมมุมตอนเอียงองศาไม่ซ้ำให้ดูธรรมชาติ
  p.style.left = x - 12 + "px"; // สั่งให้เลขไปโผล่พิกัดเมาส์ เหลื่อในิดหน่อยให้ไม่อยู่ตรงกลางแต่เป้นปลายเมาส์
  p.style.top = y - 18 + "px"; // แกน y ด้วย
  p.textContent = txt;
  gameEl.appendChild(p);
  setTimeout(() => p.remove(), 950); // ตั้งเวลาว่า 0.95s ให้หายไป
}

//ป้าย combo x2 x3
function spawnComboP(x, y, c) {
  const p = document.createElement("div");
  p.className = "combo-p"; // ตั้งคลาส css ไ้ให้ตัวหนังสือเปลี่ยนไป
  p.style.left = x - 24 + "px";
  p.style.top = y - 42 + "px";
  p.textContent = "x" + c + "!";
  gameEl.appendChild(p);
  setTimeout(() => p.remove(), 680); // ทำลายตัวเอง
}

//คำนวนหลอดวงกลม
function updateRing() {
  const nextIdx = MILESTONES.findIndex((m) => beans < m.n);
  //ค้นหาใน array ที่จด  milestones myh' 7 ด่านแล้วลไ่ดูว่าเป้าหมายไหนที่แต้มยังไม่ถึง beans < m.n
  // กรณีหากล่องที่แต้มสูงกว่าเราไม่ได้ คือตอตเล่นสุดท้ายแต้มมากว่า 10,000
  if (nextIdx === -1) {
    ringFill.style.strokeDashoffset = "0"; // ถ้าเป็นเงื่อนไขยี้ให้ fill วงกลม 100%
    ringDot.setAttribute("opacity", "1"); // แสดงจุดหัวเส้นขึ้นมา
    return; // แล้วเลิก แยกย้าย ไม่ต้องคำนวนต่อ
  }

  // คำนวนเส้น progress, และคำนวนว่า dot x y ต้องไปเกาะที่พิกัดไหนของวงกลม
  /* หาจุดเริ่มต้น prev / เป่้าหมาย next เช่น มี 40 แต้ม ด่านก่อนหน้าคือ 20 ต่อไปคือ 60
  แปลว่าระยะทางด่านนี้คือ 40 แต้ม
  */

  const prev = nextIdx === 0 ? 0 : MILESTONES[nextIdx - 1].n;
  const next = MILESTONES[nextIdx].n;
  const pct = Math.min((beans - prev) / (next - prev), 1);
  // สูตรหาเปอร์เซ็นต์ ว่าวิ่งมากี่ % ของด่านนี้แล้ว Math.min(..,1) ป้องกันไม่ให้ % ทะลุ 100% (1.0)
  const offset = CIRC * (1 - pct); // ยิ่ง % เยอะระยะที่โดนซ่อนก็น้อยลง
  ringFill.style.strokeDashoffset = offset.toFixed(2);
  ringDot.setAttribute("opacity", pct > 0.02 ? "1" : "0");

  // จุดวงกลมที่วิ่งตาม
  /* ในหน้าเว็บ คอมพิวเตอร์ไม่รู้จักวงกลม รู้จักแต่พิกัด X Y
  เราเลยต้องแปลง % ให้เป็นพิกัด
  */
  const angle = pct * 360 - 90; // เอา % ไปคูณ 360 องศา (1 วงกลม)
  /* 0 องศา จะเริ่มที่ "3 นาฬิกา แต่เราอยากให้หลอดเกมเราเริ่มวิ่งที่ 12 นาฬิกา
  เราเลยต้องจับมันหมุนถอยหลังไป 90 องศา */
  const rad = (angle * Math.PI) / 180;
  const cx = 120 + 108 * Math.cos(rad); // แปลงหน่วยองศาเป็รเรเดียนที่คอมเข้าใจ โอย.......
  const cy = 120 + 108 * Math.sin(rad);
  ringDot.setAttribute("cx", cx.toFixed(1));
  ringDot.setAttribute("cy", cy.toFixed(1));
}

//เข็ค logic ในการ upgrade shop
function updateUI() {
  hel.textContent = fmt(beans); // เอาแต้มกาแฟไปผ่าน fnc fmt ย่อเลขให้สวยๆ เช่น 1.5K แล้วแสดงกลางจอ hel
  idel.textContent = idleRate.toFixed(1) + "/s"; //เอาแต้มต่อวินาทีมาโชว์พร้อมตัว /s

  UPGRADES.forEach((u, i) => {
    // เช็คว่าสถานะตอนนี้เป็นยังไง
    const lv = lvs[i];
    const card = document.getElementById("uc" + i);
    const costEl = document.getElementById("uc" + i + "c");
    const lvEl = document.getElementById("ul" + i);
    const descEl = document.getElementById("ud" + i);
    lvEl.textContent = "lv " + lv;
    if (lv >= 3) {
      costEl.textContent = "MAX"; // ถ้าเลเวลตันแล้วจะเปลี่ยนเป็น MAX
      card.classList.add("locked"); // ให้กลายเป็นสีเทากดอัพเกรดไมไ่ด้
      descEl.textContent = u.descs[2];
    } else {
      const c = u.costs[lv];
      costEl.textContent = c + " jb"; // แต่ถ้ายังไม่ตันไปดึงราคาเลเวลปัจจุบันมาโชว์
      descEl.textContent = u.descs[lv];
      beans >= c
        ? card.classList.remove("locked")
        : card.classList.add("locked");
      /* การเขียน If else แบบ ternary operator
        เงินในกระเป๋าเรามากกว่ราคาอัพไหม? T -> ลบ class locked ออก กดซื้อได้ ถ้า F -> ใส่คลาส LOcked */
    }
  });

  //ไล่เช็คกล่อง Milestones ว่าหลอด BAR ยาวไปกี่ % เเล้ว
  MILESTONES.forEach((m, i) => {
    const row = document.getElementById("ms" + i);
    const fill = document.getElementById("msf" + i);
    if (!row || !fill) return;
    const prev = i === 0 ? 0 : MILESTONES[i - 1].n;
    if (beans >= m.n) {
      fill.style.width = "100%"; // ถ้าเเต้มเลยเป้าด่านนั้นไปแล้ว สั่งให้หลอดสีน้ำตาลเต็มหลอดทันที
      row.classList.add("done");
    } else {
      const pct = Math.max(
        0,
        Math.min(100, ((beans - prev) / (m.n - prev)) * 100),
        //ถ้าแต้มไม่ถึงด่านนั้น ห้าม % ติดลบ และห้ามเกิน 100%
      );
      fill.style.width = pct.toFixed(1) + "%";
    }
  });

  //พอเสร้จ จะเรียก Fnc ให้ไปวาดวงกลม + เปลี่ยนรูป Bun
  updateRing();
  updateBunStage();
}

/* Fnc ว่าเมื่อไหร่ bun จะ evolve + effect เปลี่ยนร่าง
 ฟังก์ชันนี้จะถูกเรียกใช้บ่อยๆ (มักจะพ่วงอยู่กับ updateUI) 
หน้าที่ของมันคือเอาคะแนนปัจจุบันไปเทียบกับตารางเกณฑ์คะแนน 
ว่าถึงเวลาต้องอัปเกรดร่างหรือยัง */

function updateBunStage() {
  let target = 0; // ตั้งค่าร่างเป้าหมายเริ่มต้นไว้ที่ 0 (ร่างแรกสุด)
  //วนลูปอ่านสมุดจด BUN_THRESHOLDS
  // (ที่เก็บเลข 0, 20, 60, 150...) ไปเรื่อยๆ ทีละข้อ
  for (let i = 0; i < BUN_THRESHOLDS.length; i++) {
    if (beans >= BUN_THRESHOLDS[i]) target = i;
  }
  /* ถ้าแต้มที่เรามีมากกว่าหรือเท่ากับ เกณฑ์คะแนนด่านนั้น
  ให้เปลี่ยนเป้าหมายร่าง (target) เป็นด่านนั้นเลย" */
  if (target !== currentStage && !gameWon) {
    currentStage = target; // จดจำว่าตอนนี้เราเปลี่ยนร่างแล้วนะ
    bunImg.src = BUN_STATES[currentStage]; // สั่งเปลี่ยนรูปหมา
    stageEl.textContent = STAGE_NAMES[currentStage];
    //ถ้าระบบจะเช็คว่าร่างเป้าหมาย ไม่เท่า CUrrent stage --> ต้องเปลี่ยนร่าง

    //สั่งยิงป๊อปอัปขนมปังปิ้งแจ้งเตือนว่า Bun evolved
    toast(
      currentStage === 11
        ? "FINAL FORM!"
        : "Bun evolved! " + STAGE_NAMES[currentStage],
    );

    //เรียกสวิตช์ไฟกะพริบจอวาบ 1 ที
    flashScreen();
    triggerAnim("milestone"); // สั่งให้หมาเต้นดุ๊กดิ๊ก 1 ที
    if (currentStage === 11) setTimeout(triggerWin, 600);
    // ถ้าเปลี่ยนร่างมาเป็นด่าน 11 ด่านสุดท้ายแล้ว ให้หน่วงเวลา 0.6 วินาที แล้วเรียกฉากจบเกม (triggerWin)
  }
}

// สั่งเล่นอนิเมชันของตัวน้องหมา
function triggerAnim(cls, dur = 700) {
  // ระยะเวลาที่จะเล่น หน่วยเป็นมิลลิวินาที ค่าเริ่มต้นคือ 700
  ringWrap.classList.remove(cls); // ถอดคลาสเก่าออกก่อน
  void ringWrap.offsetWidth; // หลอกให้ Browser ละสายตาไปวัดขนาด เพื่อให้มันยอมเล่นอนิเมชันซ้ำ อิอิอิอิอิ
  ringWrap.classList.add(cls); //  สวมคลาสกลับเข้าไปใหม่ สั่งเริ่มเล่นอนิเมชัน
  setTimeout(() => ringWrap.classList.remove(cls), dur);
  // พอเล่นอนิเมชันจนจบครบเวลาให้ถอดคลาสนั้นทิ้งไปเลย เพื่อเคลียร์พื้นที่ให้พร้อมเล่นอนิเมชันครั้งต่อไป
}

/* ===============================================
======= CORE FEATURES : 1.ระบบคลิกได้แต้ม ==============
================================================ */

function clickBun(e) {
  if (gameWon) return; // // ถ้าเกมจบแล้ว ห้ามคลิกต่อ
  totalClicks++; // จดสถิติไว้ว่าคลิกไปกี่รอบแล้ว (เอาไว้โชว์ตอนจบเกม)
  const now = Date.now(); // ขอดูเวลา ณ วินาทีนี้หน่อย
  if (now - lastClick < 400) {
    combo = Math.min(combo + 1, 8);
    // // ถ้าคลิกห่างจากรอบที่แล้วไม่เกิน 0.4 วินาที (400ms) เอาคอมโบไป +1 (แต่ตันที่ 8 นะ)
  } else {
    combo = Math.max(0, combo - 1);
    // // แต่ถ้าคลิกช้าไป คอมโบจะลดลง 1 (แต่ห้ามติดลบ)
  }
  lastClick = now; // จดเวลาคลิกรอบนี้เอาไว้ เพื่อไปเทียบกับรอบหน้า

  // -- ท่อนเคลียร์คอมโบถ้าหยุดคลิก
  clearTimeout(comboTimer); // ยกเลิกระเบิดเวลาลูกเก่า
  comboTimer = setTimeout(() => {
    combo = 0; // ถ้านิ้วหยุดคลิกเกิน 1.6 วินาที (1600ms) เซ็ตคอมโบกลับเป็น 0 ทันที!
    cbadge.classList.remove("show"); // ซ่อนป้ายคอมโบ
    updateUI();
  }, 1600);

  // สูตรคิดโบนัส: ถ้าคอมโบตั้งแต่ 2 ขึ้นไป ให้เอา (คอมโบ x 0.4) แล้วบวก 1
  // เช่น คอมโบ 3 -> (3 * 0.4) + 1 = คูณ 2.2 เท่า!
  // แต่ถ้าคอมโบไม่ถึง 2 ก็ให้คูณแค่ 1 เท่า (ได้แต้มปกติ)
  const mult = combo >= 2 ? 1 + combo * 0.4 : 1;
  const earned = clickPower * mult; // เอาพลังคลิกพื้นฐาน ไปคูณโบนัส
  beans += earned;

  // 1. สั่งให้ตัวเลขคะแนนเด้งดึ๋งๆ
  hel.classList.remove("pop");
  void hel.offsetWidth; // วิชาปราบมาร Reflow ให้มันเด้งซ้ำได้
  hel.classList.add("pop");

  // 2. หาพิกัด (X, Y) ของปลายเมาส์
  const rect = gameEl.getBoundingClientRect(); // ขอดูขอบเขตของกล่องเกมหน่อย
  const x = e.clientX - rect.left; // เอาตำแหน่งเมาส์ในจอ ลบด้วยระยะขอบซ้ายของเกม
  const y = e.clientY - rect.top;

  // 3. สั่งพนักงานเสกตัวเลข +แต้ม ให้ลอยขึ้นฟ้า (ตรงปลายเมาส์ x, y)
  spawnParticle(x, y, "+" + Math.ceil(earned));

  // 4. โชว์ป้ายคอมโบ (ถ้าคอมโบเกิน 3)
  if (combo >= 3) {
    const d = (Math.ceil(mult * 10) / 10).toFixed(1); // ปัดทศนิยมโบนัสให้สวยๆ เช่น 2.2
    cnum.textContent = d; // เอาเลขไปใส่ในป้ายคอมโบ
    cbadge.classList.add("show"); // สั่งโชว์ป้าย
    spawnComboP(x, y, d); // เสกตัวอักษรคอมโบลอยขึ้นฟ้า
  } else {
    cbadge.classList.remove("show"); // ถ้าคอมโบตก ก็ซ่อนป้าย
  }

  triggerAnim("click", 240);
  if (currentStage >= 5) triggerAnim("jitter", 320);

  updateUI(); // 2. สั่งอัปเดตหน้าจอทันที เพื่อให้ตัวเลขแต้มเปลี่ยนให้คนเล่นเห็น
}

/* ===============================================
======= CORE FEATURES : 2. ระบบซื้ออัพเกรด ==============
================================================ */

function buy(i) {
  if (gameWon) return; // เกมจบแล้วห้ามซื้อ
  const lv = lvs[i]; // เช็กว่ากล่องนี้เราอัปเกรดไปกี่เลเวลแล้ว
  if (lv >= 3) return; // ถ้าเวลตัน (3) แล้ว ซื้อไม่ได้
  const c = UPGRADES[i].costs[lv]; // ไปดูราคากล่องนี้ ในเลเวลนี้
  if (beans < c) return; // ถ้าเงินไม่พอ ซื้อไม่ได้!

  // --- ถ้าเงินพอ ทำ 3 บรรทัดนี้ ---
  beans -= c; // หักเงินออกจากกระเป๋า
  clickPower += UPGRADES[i].cb[lv]; // บวกพลังคลิก (ถ้าไอเท็มนั้นให้พลังคลิก)
  idleRate += UPGRADES[i].ib[lv]; // บวกพลัง Idle (ถ้าไอเท็มนั้นให้พลัง Idle)
  lvs[i]++; // ดันเลเวลของไอเท็มชิ้นนี้ขึ้น 1 เลเวล
  const card = document.getElementById("uc" + i);
  card.classList.add("bought");
  setTimeout(() => card.classList.remove("bought"), 450);
  toast(["Shot upgraded!", "Machine upgraded!", "Bean upgraded!"][i]);
  updateUI(); // อัปเดตหน้าจอโชว์พลังใหม่
}

// ฟังก์ชันนี้จะถูกเรียกใช้ตอนที่หมาเปลี่ยนร่างเป็นร่างสุดท้าย
function triggerWin() {
  if (gameWon) return; // เพื่อป้องกันไม่ให้ผู้เล่นกดคลิกเอาแต้มเพิ่ม
  gameWon = true;
  ringWrap.classList.add("balloon"); //css เล่นแนิเมชันลอยขึ้นฟ้า
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  // เอาเวลาปัจจุบัน ลบกับเวลาตอนเริ่มเกมจะได้หน่วยเป็นมิลลิวินาที แล้วหาร 1000 เพื่อให้กลายเป็นวินาทีรวม
  const mins = Math.floor(elapsed / 60),
    secs = elapsed % 60;
  // เอาวินาทีรวมมาหาร 60 เพื่อหาว่าเล่นไปกี่ นาที และเอาเศษที่เหลือมาเป็น วินาที

  // เอาสถิติทั้งหมด (จำนวนคลิกรวม, เวลาเล่น, พลัง Idle สูงสุด) ไปเขียนเตรียมไว้ในป้ายบนหน้าจอ
  document.getElementById("win-stats").textContent =
    totalClicks +
    " clicks · " +
    mins +
    "m " +
    secs +
    "s · " +
    idleRate.toFixed(1) +
    "/s peak";
  setTimeout(() => {
    document.getElementById("win-overlay").classList.add("show");
    startStars();
  }, 2800);

  // หน่วงเวลา 2.8 วินาที พราะต้องรอให้หมาลอยขึ้นฟ้าให้พ้นจอก่อน ค่อยสั่งเอาหน้าจอสรุปสถิติลงมาโชว์
}

//เอฟเฟคดาวฉลอง AI ช่วยเจนตกแต่งเฉยๆค่อยชมานั่งดูต่อ
function startStars() {
  const c = document.getElementById("stars-canvas");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: Math.random() * 2.5 + 0.5,
    speed: Math.random() * 1.8 + 0.4,
    color: ["#FFD889", "#BC7114", "#99CBE2", "#FFE5CC"][
      Math.floor(Math.random() * 4)
    ],
  }));
  (function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      s.y -= s.speed;
      if (s.y < 0) {
        s.y = c.height;
        s.x = Math.random() * c.width;
      }
    });
    requestAnimationFrame(frame);
  })();
}

// Func brew again ต้องล้างตัวแปรและหน้าตา DOM พอจบเกมฉลองแล้ว
// Set ค่าทุกอย่างเป็น 0
function resetGame() {
  beans = 0;
  clickPower = 1;
  idleRate = 0.1;
  lvs = [0, 0, 0];
  combo = 0;
  gameWon = false;
  currentStage = 0;
  totalClicks = 0;
  startTime = Date.now();
  bunImg.src = BUN_STATES[0]; // เอารูปหมากลับเป็นร่างแรกสุด
  stageEl.textContent = STAGE_NAMES[0];
  // ถอดเอฟเฟกต์ลอยฟ้า เอฟเฟกต์สั่น ออกจากตัวหมาให้หมด
  ringWrap.classList.remove("balloon", "milestone", "click", "jitter");
  ringFill.style.strokeDashoffset = CIRC + ""; // สั่งให้หลอดวงกลมซ่อนตัวไป (กลับไปที่ 0%)
  ringDot.setAttribute("opacity", "0");
  document.getElementById("win-overlay").classList.remove("show");
  const c = document.getElementById("stars-canvas");
  c.getContext("2d").clearRect(0, 0, c.width, c.height);
  cbadge.classList.remove("show");

  updateUI(); // เอาค่าที่เป็นศูนย์ทั้งหมด ไปเขียนทับลงบนหน้าเว็บ
}

/* ===============================================
======= CORE FEATURES : 3.ระบบมีแต้มขึ้นเองอัตโนมัติ (Idle) 
================================================ */

setInterval(() => {
  if (gameWon) return; // เกมจบแล้วหยุดทำงาน
  // เนื่องจากมันทำงานทุกๆ 0.1 วินาที (100ms)
  // เลยต้องเอา idleRate (แต้มต่อวินาที) มาหาร 10 ก่อนบวก
  beans += idleRate / 10;
  updateUI(); // อัปเดตหน้าจอโชว์แต้มใหม่
}, 100); // 100 คือระยะเวลา 100 มิลลิวินาที

let bobY = 0,
  bobDir = 1;
setInterval(() => {
  if (gameWon) return;
  bobY += bobDir * 0.3;
  if (Math.abs(bobY) > 3) bobDir *= -1;
  bunImg.style.transform = "translateY(" + bobY + "px)";
}, 75);

updateUI();

//ถ้าอยากทำให้เวฟได้คุณกันบอกใช้ local storage เก็บ data
