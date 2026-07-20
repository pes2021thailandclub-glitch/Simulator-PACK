function combination(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - k + i);
    result /= i;
  }
  return result;
}

function probability(draws) {
  const total = 150;
  
  // 1. ปรับสัดส่วนจำนวนการ์ดตามโครงสร้างพูลใหม่
  const epicCount = 1;
  const stCount = 5;       // เพิ่มการ์ดระดับ Show Time
  const hlCount = 6;       // ปรับลดจำนวนการ์ด Highlight
  const normalCount = 138; // ปรับลดจำนวนการ์ด Standard ให้รวมได้ 150 ใบพอดี

  if (draws > 150) draws = 150;

  // 2. คำนวณความน่าจะเป็นที่จะได้การ์ดแต่ละประเภท "อย่างน้อย 1 ใบ" (Hypergeometric Distribution)
  const totalComb = combination(total, draws);

  // โอกาสสุ่มได้ Epic อย่างน้อย 1 ใบ
  const failEpic = combination(total - epicCount, draws) / totalComb;
  const epicChance = totalComb > 0 ? (1 - failEpic) * 100 : 0;

  // โอกาสสุ่มได้ Show Time อย่างน้อย 1 ใบ
  const failSt = combination(total - stCount, draws) / totalComb;
  const stChance = totalComb > 0 ? (1 - failSt) * 100 : 0;

  // โอกาสสุ่มได้ Highlight อย่างน้อย 1 ใบ
  const failHl = combination(total - hlCount, draws) / totalComb;
  const hlChance = totalComb > 0 ? (1 - failHl) * 100 : 0;

  // 3. คำนวณค่าคาดหมาย (Expected Value) ของการ์ดที่สุ่มได้ตามสัดส่วนคณิตศาสตร์
  const expectedEpic = Math.round(draws * (epicCount / total));
  const expectedSt = Math.round(draws * (stCount / total));
  const expectedHl = Math.round(draws * (hlCount / total));

  // 4. Return Object กลับออกไปให้ตรงกับคีย์ที่ app.js เรียกใช้
  return {
    epicChance: epicChance,
    stChance: stChance,         // คีย์ใหม่สำหรับนำไปพ่นลงกราฟหรือหลอดความก้าวหน้า
    hlChance: hlChance,
    expectedEpic: expectedEpic,
    expectedSt: expectedSt,     // คีย์ใหม่สำหรับนำไปนับจำนวนไฮไลต์การ์ดบนแคตตาล็อก
    expectedHl: expectedHl
  };
}
