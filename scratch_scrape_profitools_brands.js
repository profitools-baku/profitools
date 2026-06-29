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
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function run() {
  const destDir = "public/images/brands";
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const brandLogos = {
    stabila: "https://www.profitools.by/upload/resize_cache/iblock/d48/150_120_1/d484515f9d528153c0dff07a875b776b.png",
    jokari: "https://www.profitools.by/upload/resize_cache/iblock/2c4/150_120_1/2c473b29c520c0239938a79ca282545c.jpg",
    pica: "https://www.profitools.by/upload/resize_cache/iblock/9e2/150_120_1/9e23345b4fd2eddd9e9f0092dfd1b0dc.jpg",
    proxxon: "https://www.profitools.by/upload/resize_cache/iblock/401/150_120_1/4011510ff0db1d03163e232854f248f2.jpg",
    hardy: "https://www.profitools.by/upload/resize_cache/iblock/582/150_120_1/r0s8g6ofvrj9x9kavxe4qaeigar5dkt0.jpg"
  };

  for (const [brand, url] of Object.entries(brandLogos)) {
    const ext = path.extname(url).split("?")[0] || ".png";
    const destPath = path.join(destDir, `${brand}${ext}`);
    console.log(`Downloading ${brand} logo from ${url} to ${destPath}...`);
    try {
      await downloadFile(url, destPath);
      console.log(`Successfully downloaded ${brand} logo!`);
    } catch (err) {
      console.error(`Failed to download ${brand} logo: ${err.message}`);
    }
  }
}

run();
