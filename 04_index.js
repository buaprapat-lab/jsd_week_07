const addBtn = document.querySelector("#addPokemon");
const removeBtn = document.querySelector("#removeBtn");
const container = document.querySelector("#pokemonList");

// =====เมื่อกดปุ่มเพิ่มโปเกม่อน=====
addBtn.addEventListener("click", () => {
  // 1.สร้างตัวแปรสุ่ม ID ของ pokemon 1-151 ตัวแรก แนะนำเท่านี้เพราะมักมีรูปครบ / + 1 เพราะโปเกม่อนเริ่มที่ตัว 1 ไม่ใช่ 0
  const randomID = Math.floor(Math.random() * 151) + 1;

  // 2.fetch data from API
  fetch(`https://pokeapi.co/api/v2/pokemon/${randomID}`)
    .then((response) => response.json()) // แปลงข้อมูลเป็น json
    // เริ่มกระบวนการ DOM
    .then((data) => {
      //console.log(data); // <--- เพื่อแอบดูหน้าตาของ data > Inspect > console > ดูตรง Object{....}

      /* ตัวอย่าง data ที่เราจะสร้าง path ไป
            {
                "name": "pikachu",
                "weight": 60,
                "sprites": {
                "back_default": "https://...",
                "front_default": "https://raw.githubusercontent.com/.../25.png",
                "back_shiny": "https://...",
                "front_shiny": "https://..."
        }} */

      // 3.สร้าง card (element ใหม่)
      const card = document.createElement("div"); // เสกกล่องเปล่าขึ้นมา div = division
      card.classList.add("Pokemon-card"); //สร้าง class ขึ้นมาให้กับตัวแปร card เพื่อตกแต่ง

      //  style ของสี bg ที่แตกต่างกันแบบสุ่ม
      const colors = ["#e1f7e7", "#e2eaff", "#ffe1e1", "#f1e1f8", "#f9f1d0"]; //สร้างตัวแปรสีพื้นหลัง
      const randomColor = colors[Math.floor(Math.random() * colors.length)]; //ตััวแรก randomColor bg ที่ให้แรนด้อมทุกสีที่เรากำหนดไว้
      card.style.backgroundColor = randomColor;

      //4.ใส่เนื้อหาข้างในภาพคือมี รูปภาพ + ชื่อ
      card.innerHTML = `<img src="${data.sprites.front_default}" alt="${data.name}">
        <p style="text-transform: capitalize; font-weight: bold; margin: 0px;">${data.name}</p>`;

      // logic สำหรับการเลือก (Select)
      card.addEventListener("click", () => {
        // ลบ class selected ออกจากตัวอื่นก่อน (เลือกได้ทีละตัว)
        const prevSelected = document.querySelector(".selected");
        // ถ้ามีตัวที่ถูกเลือกอยู่ และตัวนั้นไม่ใช่ตัวที่เราเพิ่งจิ้ม ให้เอาคลาสออก
        if (prevSelected && prevSelected !== card) {
          prevSelected.classList.remove("selected");
        }

        // ใส่ class selected ให้กับตัวที่เราจิ้ม
        card.classList.toggle("selected");
      });

      //  5.  นำไปแปะบนหน้าเว็ป Append child
      container.appendChild(card);
    })
    //กรณีมี error เกิดขึ้น
    .catch((err) => console.log("Something is wrong!:", err));
});

//ุ6. เพิ่ม event เพื่อลบ (สั่งได้หลังจากสร้าง card แล้วเท่านั้น) ให้ปุ่ม remove หดลบตัวโปเกม่อนที่เลือก
removeBtn.addEventListener("click", () => {
  // 1. ไปหาว่าตัวไหนที่มีคลาส selected อยู่
  const selectedPokemon = document.querySelector(".selected");

  // 2. ถ้าเจอ ให้ลบทิ้ง
  if (selectedPokemon) {
    selectedPokemon.remove();
  } else {
    alert("Please select a Pokemon first!");
  }
});
