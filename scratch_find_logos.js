import * as cheerio from "cheerio";

const sites = {
  proxxon: "https://www.proxxon.com/",
  pica: "https://www.pica-marker.com/en",
  jokari: "https://jokari.de/en/",
  stabila: "https://www.stabila.com/en-US/",
  hardy: "https://kaem.pl/en/"
};

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

async function findLogos() {
  const sitesToScan = {
    jokari: "https://jokari.de/en/",
    stabila: "https://www.stabila.com/en-US/",
    hardy: "https://kaem.pl/"
  };
  
  for (const [name, url] of Object.entries(sitesToScan)) {
    console.log(`\nFetching ${name} from ${url}...`);
    try {
      const html = await fetchHtml(url);
      const $ = cheerio.load(html);
      const images = [];
      
      $("img").each((i, el) => {
        const src = $(el).attr("src") || "";
        const alt = $(el).attr("alt") || "";
        images.push({ src, alt });
      });
      
      console.log(`Found ${images.length} images for ${name}:`);
      images.forEach((img, idx) => {
        let fullSrc = img.src;
        if (img.src.startsWith("//")) {
          fullSrc = "https:" + img.src;
        } else if (img.src.startsWith("/")) {
          const parsed = new URL(url);
          fullSrc = parsed.origin + img.src;
        } else if (!img.src.startsWith("http")) {
          const parsed = new URL(url);
          fullSrc = parsed.origin + "/" + img.src;
        }
        console.log(`  [${idx}] Src: ${img.src} -> Resolved: ${fullSrc} (Alt: "${img.alt}")`);
      });
    } catch (err) {
      console.error(`Error fetching ${name}: ${err.message}`);
    }
  }
}

findLogos();
