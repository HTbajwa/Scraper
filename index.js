import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
const app = express();
app.use(cors());

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

  
    await page.goto("https://savings.gov.pk/download-draws/", { waitUntil: "domcontentloaded" });

   
      const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h2 > a[href]"))
   
      .map((a) => a.href )
      .filter((href) => href.startsWith("http"));
  });
  console.log(` Found ${links} links`);

    console.log(links)
    await browser.close();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }


app.listen(5000, () => console.log("Server is running "));
