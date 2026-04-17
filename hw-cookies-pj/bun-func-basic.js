// ==========================================
// 1. สมุดจดข้อมูลพื้นฐาน
// ==========================================
const UPGRADES = [
  { costs: [30, 100, 300], cb: [1, 2, 4], ib: [0, 0, 0] }, // กล่อง 1: เพิ่มพลังคลิก
  { costs: [80, 250, 700], cb: [0, 0, 0], ib: [0.4, 1.2, 3] }, // กล่อง 2: เพิ่มแต้ม Idle
  { costs: [200, 600, 1600], cb: [2, 4, 8], ib: [0.8, 2, 5] }, // กล่อง 3: เพิ่มทั้งคู่
];

// ตัวแปรที่ต้องจำ (เดี๋ยวเราจะเอาพวกนี้ไปเซฟลง Local Storage)
let beans = 0;
let clickPower = 1;
let idleRate = 0;
let lvs = [0, 0, 0];

// จับ HTML Elements ที่ใช้แสดงตัวเลข
const hel = document.getElementById("hcount");
const idel = document.getElementById("idle-disp");

// ==========================================
// 2. CORE: ระบบคลิก
// ==========================================
function clickBun() {
  beans += clickPower; // บวกแต้ม
  updateUI(); // อัปเดตหน้าจอ
  saveGame(); // เซฟเกมอัตโนมัติ!
}

// ==========================================
// 3. CORE: ระบบอัปเกรด
// ==========================================
function buy(i) {
  const lv = lvs[i];
  if (lv >= 3) return; // ถ้าเวลตัน ซื้อไม่ได้

  const cost = UPGRADES[i].costs[lv];
  if (beans < cost) return; // ถ้าเงินไม่พอ ซื้อไม่ได้

  // จ่ายเงินและรับพลัง
  beans -= cost;
  clickPower += UPGRADES[i].cb[lv];
  idleRate += UPGRADES[i].ib[lv];
  lvs[i]++; // อัปเลเวล

  updateUI();
  saveGame(); // เซฟเกมอัตโนมัติ!
}

// ==========================================
// 4. CORE: ระบบอัปเดตหน้าจอ (เอาเฉพาะป้ายคะแนนและปุ่ม)
// ==========================================
function updateUI() {
  // เปลี่ยนป้ายคะแนน
  hel.textContent = Math.floor(beans);
  idel.textContent = idleRate.toFixed(1) + "/s";

  // อัปเดตปุ่มอัปเกรด (ให้เป็นสีเทาถ้าเงินไม่พอ)
  UPGRADES.forEach((u, i) => {
    const card = document.getElementById("uc" + i);
    const costEl = document.getElementById("uc" + i + "c");
    const lvEl = document.getElementById("ul" + i);

    lvEl.textContent = "lv " + lvs[i];

    if (lvs[i] >= 3) {
      costEl.textContent = "MAX";
      card.classList.add("locked");
    } else {
      const cost = u.costs[lvs[i]];
      costEl.textContent = cost + " jb";
      // ถ้าเงินพอให้ปลดล็อก ถ้าน้อยกว่าให้ล็อก
      beans >= cost
        ? card.classList.remove("locked")
        : card.classList.add("locked");
    }
  });
}

// ==========================================
// 5. CORE: ระบบ Idle (ขึ้นเองทุก 0.1 วิ)
// ==========================================
setInterval(() => {
  beans += idleRate / 10;
  updateUI();
}, 100);

// ==========================================
// NEW: ระบบ Save & Load ด้วย Local Storage
// ==========================================

// ฟังก์ชันแพ็คของใส่กล่องเก็บไว้ในเครื่อง
function saveGame() {
  const saveData = {
    save_beans: beans,
    save_clickPower: clickPower,
    save_idleRate: idleRate,
    save_lvs: lvs,
  };
  // แปลงข้อมูลเป็นข้อความ (String) แล้วยัดลง Local Storage ชื่อ "bunSave"
  localStorage.setItem("bunSave", JSON.stringify(saveData));
}

// ฟังก์ชันแกะกล่องเอาข้อมูลเดิมมาเล่นต่อ
function loadGame() {
  const savedData = localStorage.getItem("bunSave");

  // ถ้าเคยมีเซฟอยู่แล้ว ให้เอาของในเซฟมาทับตัวแปรเริ่มต้น
  if (savedData !== null) {
    const data = JSON.parse(savedData); // แปลงข้อความกลับมาเป็นข้อมูล
    beans = data.save_beans;
    clickPower = data.save_clickPower;
    idleRate = data.save_idleRate;
    lvs = data.save_lvs;
  }
  updateUI(); // โหลดเสร็จก็สั่งอัปเดตหน้าจอ 1 ที
}

// ตอนเปิดเว็บมาปุ๊บ สั่งโหลดเกมทันที!
loadGame();
