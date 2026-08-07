const mongoose = require('mongoose');

// Replace AgriCare2026 with the exact password you set in Step 1
const uri = "mongodb+srv://abhijithrpillai12345_db_user:AgriCare2026@cluster0.vfh4vg1.mongodb.net/agricare?retryWrites=true&w=majority&appName=Cluster0";

console.log("Attempting to connect to MongoDB Atlas...");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ CONNECTION FAILED:");
    console.error(err.message);
    process.exit(1);
  });
  