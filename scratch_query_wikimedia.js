import fs from "fs";
import path from "path";
import https from "https";

const queries = {
  stabila: "Stabila logo",
  jokari: "Jokari logo",
  pica: "Pica marker logo",
  hardy: "Hardy tools logo"
};

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

async function searchWikimedia(brandName, queryText) {
  console.log(`Searching Wikimedia Commons for "${queryText}"...`);
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryText)}&format=json&origin=*`;
  
  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!res.ok) {
    throw new Error(`Wikimedia Search failed: ${res.status}`);
  }
  const data = await res.json();
  const results = data.query?.search || [];
  
  if (results.length === 0) {
    console.log(`No Wikimedia Commons results for ${brandName}`);
    return null;
  }
  
  // Find the first result that is a File:
  const fileResult = results.find(r => r.title.startsWith("File:"));
  if (!fileResult) {
    console.log(`No File results for ${brandName}`);
    return null;
  }
  
  const title = fileResult.title;
  console.log(`Found file: ${title}`);
  
  // Now get the direct file URL
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const infoRes = await fetch(infoUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!infoRes.ok) {
    throw new Error(`Wikimedia Info failed: ${infoRes.status}`);
  }
  const infoData = await infoRes.json();
  const pages = infoData.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  const imageinfo = pages[pageId]?.imageinfo?.[0];
  
  if (!imageinfo) {
    console.log(`No imageinfo found for ${title}`);
    return null;
  }
  
  return imageinfo.url;
}

async function run() {
  const destDir = "public/images/brands";
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // First download Proxxon directly from working URL
  console.log("Downloading Proxxon logo...");
  try {
    await downloadFile("https://www.proxxon.com/images/logo.gif", path.join(destDir, "proxxon.gif"));
    console.log("Downloaded Proxxon logo successfully.");
  } catch (err) {
    console.error(`Failed to download Proxxon logo: ${err.message}`);
  }

  // Now search Wikimedia for others
  for (const [brand, query] of Object.entries(queries)) {
    try {
      const url = await searchWikimedia(brand, query);
      if (url) {
        console.log(`Resolved URL for ${brand}: ${url}`);
        const ext = path.extname(url).split("?")[0] || ".png";
        const destPath = path.join(destDir, `${brand}${ext}`);
        await downloadFile(url, destPath);
        console.log(`Successfully downloaded ${brand} logo to ${destPath}`);
      }
    } catch (err) {
      console.error(`Error for ${brand}: ${err.message}`);
    }
  }
}

run();
