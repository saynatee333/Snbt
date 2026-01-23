// functions/api/auctions.js
// API สำหรับจัดการรายการประมูล (D1 Database)

// GET: ดึงรายการประมูลทั้งหมด
export async function onRequestGet(context) {
  const { DB } = context.env;  // DB คือชื่อ binding ที่เชื่อมกับ D1

  try {
    const { results } = await DB.prepare("SELECT * FROM auctions ORDER BY id DESC").all();
    return Response.json(results);
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST: เพิ่มรายการประมูลใหม่
export async function onRequestPost(context) {
  const { DB } = context.env;
  const body = await context.request.json();

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!body.item_name || !body.assessed_price) {
    return new Response(JSON.stringify({ error: "ขาดข้อมูลที่จำเป็น (item_name หรือ assessed_price)" }), { status: 400 });
  }

  try {
    await DB.prepare(
      `INSERT INTO auctions (item_name, description, assessed_price, increment, image_path, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        body.item_name,
        body.description || null,
        parseFloat(body.assessed_price),
        parseFloat(body.increment || 1000),
        body.image_path || null
      )
      .run();

    return new Response(JSON.stringify({ success: true, message: "เพิ่มรายการประมูลสำเร็จ" }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
