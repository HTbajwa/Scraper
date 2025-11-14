// generateIndex.js
import fs from "fs";
import path from "path";

const root = "./prizeBonds";
const index = {};

fs.readdirSync(root).forEach(denomination => {
  const denomPath = path.join(root, denomination);
  if (fs.statSync(denomPath).isDirectory()) {
    index[denomination] = {};
    fs.readdirSync(denomPath).forEach(year => {
      const yearPath = path.join(denomPath, year);
      if (fs.statSync(yearPath).isDirectory()) {
        index[denomination][year] = fs
          .readdirSync(yearPath)
          .filter(f => f.endsWith(".json"));
      }
    });
  }
});

fs.writeFileSync(
  path.join(root, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log("✅ index.json generated!");
