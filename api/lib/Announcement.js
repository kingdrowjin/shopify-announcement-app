const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    syncedToShopify: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
