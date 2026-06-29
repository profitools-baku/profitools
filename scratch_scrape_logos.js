import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import https from "https";

const brands = [
  { name: "proxxon", query: "proxxon logo png transparent" },
  { name: "pica", query: "pica marker logo png transparent" },
  { name: "hardy", query: "hardy working tools logo png" },
  { name: "jokari", query: "jokari logo png transparent" },
  { name: "stabila", query: "stabila logo png transparent" }
];

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

async function scrape() {
  const destDir = "public/images/brands";
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const b of brands) {
    console.log(`\nSearching for ${b.name} logo...`);
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(b.query)}`;
      const html = await fetchHtml(searchUrl);
      const $ = cheerio.load(html);
      
      const imageUrls = [];
      // DuckDuckGo HTML search results contain links to image pages or external URLs
      // Let's find links that look like images or images in the results
      $("a").each((i, el) => {
        const href = $(el).attr("href") || "";
        if (href.includes("uddg=")) {
          // Extract the actual URL from the redirect link
          const parts = href.split("uddg=");
          if (parts[1]) {
            const decoded = decodeURIComponent(parts[1].split("&")[0]);
            if (
              (decoded.endsWith(".png") || decoded.endsWith(".jpg") || decoded.endsWith(".svg") || decoded.endsWith(".gif")) &&
              !decoded.includes("wikimedia.org/wiki/File:")
            ) {
              imageUrls.push(decoded);
            }
          }
        }
      });

      console.log(`Found ${imageUrls.length} image URLs for ${b.name}:`);
      for (const url of imageUrls.slice(0, 5)) {
        console.log(`  - ${url}`);
      }

      // Try downloading the first one that succeeds
      let success = false;
      for (const url of imageUrls) {
        console.log(`Trying to download: ${url}`);
        const ext = path.extname(url).split("?")[0] || ".png";
        const filename = `${b.name}_new${ext}`;
        const destPath = path.join(destDir, filename);
        
        try {
          await downloadFile(url, destPath);
          console.log(`Successfully downloaded ${b.name} logo to ${destPath}`);
          success = true;
          break;
        } catch (err) {
          console.error(`Failed to download ${url}: ${err.message}`);
        }
      }

      if (!success) {
        console.error(`Could not download any logo for ${b.name}`);
      }
    } catch (err) {
      console.error(`Error searching for ${b.name}: ${err.message}`);
    }
  }
}

scrape();
