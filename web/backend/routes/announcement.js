const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

router.post("/announcement", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Announcement text is required" });

    // 1. Save to MongoDB (audit history)
    const announcement = await Announcement.create({ text });

    // 2. Sync to Shopify via Admin API (REST - Metafield)
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

    const shopifyData = await metafieldResponse.json();

    if (!metafieldResponse.ok) {
      console.error("Shopify API error:", shopifyData);
      return res.status(500).json({
        error: "Saved to DB but failed to sync to Shopify",
        details: shopifyData,
      });
    }

    // Update MongoDB record
    announcement.syncedToShopify = true;
    await announcement.save();

    res.json({
      message: "Announcement saved and synced to Shopify!",
      announcement,
      metafield: shopifyData.metafield,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(20);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/current-announcement", async (req, res) => {
  try {
    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/metafields.json?namespace=my_app&key=announcement`;
    const response = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });
    const data = await response.json();
    const metafield = data.metafields?.[0];
    res.json({ text: metafield?.value || "" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch current announcement" });
  }
});

module.exports = router;
