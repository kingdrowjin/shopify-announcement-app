const connectDB = require("./lib/db");
const Announcement = require("./lib/Announcement");

module.exports = async function handler(req, res) {
  await connectDB();
  try {
    const latest = await Announcement.findOne().sort({ createdAt: -1 });
    res.json({ text: latest?.text || "" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch current announcement" });
  }
};
