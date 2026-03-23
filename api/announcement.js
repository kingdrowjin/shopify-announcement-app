const connectDB = require("../lib/db");
const Announcement = require("../lib/Announcement");

module.exports = async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(20);
      return res.json(announcements);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch announcements" });
    }
  }

  if (req.method === "POST") {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Announcement text is required" });

    try {
      const announcement = await Announcement.create({ text });

      // Sync to Shopify if credentials are configured
      if (process.env.SHOPIFY_STORE_URL && process.env.SHOPIFY_ACCESS_TOKEN && process.env.SHOPIFY_ACCESS_TOKEN !== "placeholder") {
        try {
          const shopifyUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/metafields.json`;
          const metafieldResponse = await fetch(shopifyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({
              metafield: {
                namespace: "my_app",
                key: "announcement",
                value: text,
                type: "single_line_text_field",
              },
            }),
          });

          if (metafieldResponse.ok) {
            announcement.syncedToShopify = true;
            await announcement.save();
          }
        } catch (e) {
          console.error("Shopify sync error:", e);
        }
      }

      return res.json({ message: "Announcement saved!", announcement });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
};
