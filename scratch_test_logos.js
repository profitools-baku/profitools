import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import https from "https";

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }
  return res.text();
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      rejectUnauthorized: false
    };
    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const testUrls = {
  proxxon: [
    "https://www.proxxon.com/images/logo.gif",
    "https://www.proxxon.com/images/proxxon_logo.gif"
  ],
  stabila: [
    "https://www.stabila.com/files/default/images/header/logo.png",
    "https://www.stabila.com/files/default/images/header/logo.svg"
  ],
  jokari: [
    "https://jokari.de/assets/images/logo.png",
    "https://jokari.de/assets/templates/jokari/images/logo.png"
  ],
  pica: [
    "https://www.pica-marker.com/assets/images/logo.png",
    "https://www.pica-marker.com/assets/logo.png"
  ]
};

async function test() {
  for (const [brand, urls] of Object.entries(testUrls)) {
    console.log(`Testing ${brand} URLs...`);
    for (const url of urls) {
      try {
        console.log(`  Trying ${url}`);
        const res = await fetch(url, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        console.log(`  Response status: ${res.status}`);
        if (res.ok) {
          console.log(`  SUCCESS! URL works: ${url}`);
        }
      } catch (err) {
        console.log(`  Failed: ${err.message}`);
      }
    }
  }
}

test();
