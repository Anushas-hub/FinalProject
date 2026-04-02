const fs = require("fs");
const path = require("path");

const emojiRegex = /[\u{1F300}-\u{1FAFF}]/gu;

const cleanFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const cleaned = data.replace(emojiRegex, "");

    if (data !== cleaned) {
      fs.writeFileSync(filePath, cleaned, "utf8");
      console.log("Cleaned:", filePath);
    }
  } catch (err) {
    console.error("Error:", filePath);
  }
};

const walkDir = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (
      fullPath.endsWith(".js") ||
      fullPath.endsWith(".jsx") ||
      fullPath.endsWith(".ts") ||
      fullPath.endsWith(".tsx") ||
      fullPath.endsWith(".py") ||
      fullPath.endsWith(".html") ||
      fullPath.endsWith(".css")
    ) {
      cleanFile(fullPath);
    }
  });
};

//  Change this if needed
walkDir("./");

console.log("✅ Emoji cleanup done!");