import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";


// *************************** ScrapeData of Prize Bond Draw pages Year and Page Content********************************

const scrapeData = async (page, link) => {
  await page.goto(link, {
    waitUntil: "domcontentloaded",
  });
    const Year = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h2"))
      .map((a) => a.innerText.trim() );
  });


  const PageContent = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h2 > a[href]"))
      .map((a)=>{
        return {
        href:a.href,
        text:a.innerText.trim(),
        year:a.innerHTML.slice(6)
      }} ).filter((item) => item.href.startsWith("https") && item.href.endsWith(".txt"));
  });

  console.log(`Found its link: ${link} its pageContent: ${PageContent.href} text`);
  return { url: link, PageContent,Year};
};




const getQuotes = async () => {
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

//Main Page site
  await page.goto("https://savings.gov.pk/download-draws/", {
    waitUntil: "domcontentloaded",
  });

// Get page data
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h2 > a[href]"))
   
      .map((a) => a.href )
      .filter((href) => href.startsWith("http"));
  });
  console.log(` Found ${links} links`);

//Results is the array where are all data is
  const results = [];

  for (const link of links) {
    try {
      const data = await scrapeData(page, link);
      // console.log("data is here",data)
      //   console.log("link is here",link)
      results.push(data);
    } catch (error) {
      console.log("error:", error);
    }
  }
  
// **************************Creating Folders of Years and Dates acc to links*********************************
// Setting Year give All folders data and setting year give specific like 100

  const saveJSON = (series,year, filename, data) => {
  const dataDir = path.resolve(`./prizeBonds/${series}`);
  const yearDir = path.join(dataDir, year);
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir);
  }


  const filePath = path.join(yearDir, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved: ${filePath}`);
};





  const dataResults=[];
  const dataResults1=[];
  const dataResults2=[];
  const dataResults3=[];
  const dataResults4=[];
  const dataResults5=[];


// *******************For All data without Switch case****************************

//   for (let i = 0; i < results.length; i++) {
//   const result = results[i];

//   // Open the main page
//   console.log("Opening main URL:", result.url);
//   await page.goto(result.url, { waitUntil: "domcontentloaded", timeout: 60000 });

//   // Loop through each content link in this result
//   for (const contentLink of result.PageContent) {
//     const fullLink = contentLink.href.startsWith("http")
//       ? contentLink.href
//       : ``; 

//     // Go to each bond text link
//     await page.goto(fullLink, { waitUntil: "domcontentloaded", timeout: 60000 });

//     // Extract text content from <pre> tags
//     const pageData = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll("pre")).map((a) =>
//         a.innerText.trim()
//       );
//     });
//     const singleResult = {
//       mainurl: result.url,
//       contentLink: fullLink,
//       year: contentLink.year,
//       text: contentLink.text,
//       data: pageData,
//     };

//     
//     dataResults.push(singleResult);

//    
//     const year = contentLink.year || "unknown";
//     const filename = contentLink.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

//     saveJSON(year, filename, singleResult); 
//   }
// }

  
 for (let i =0; i<results.length; i++) {
  const result=results[i] 
   switch (i) {
      case 0:{
        const series='100'
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    console.log("Trying to open url:", result.url);

    for (const contentLink of result.PageContent) {

      console.log("Prize Bond Numbers:", contentLink);
   const fullLink = contentLink.href.startsWith("http")
      ? contentLink.href
      : ``; 
      await page.goto(contentLink.href, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
console.log("Trying to open:", contentLink);

      const pageData = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });

      // console.log("pageData:", pageData);
      const singleResult = {
      mainurl: result.url,
      contentLink: fullLink,
      year: contentLink.year,
      text: contentLink.text,
      data: pageData,
    };

    
    // dataResults.push(singleResult);
dataResults.push({
        mainurl:result.url,
        contentLink:contentLink,
        data:pageData
      });

   
      // after scraping all pages

  const text = pageData[0] || ""; // get full text from <pre>

const cleanText = text
  .replace(/\u00A0/g, " ") 
  .replace(/\s+/g, " ")    
  .trim();

const drawNo =
  cleanText.match(/DRAW\s*NO[\.:]?\s*:?[\s]*([0-9]{1,3})(?:ST|ND|RD|TH)?/i)?.[1] ||
  cleanText.match(/(\d{1,3})(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||
  "Unknown";

console.log("Draw No:", drawNo);

const drawCity =
  cleanText.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() || 
  cleanText.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount =
  cleanText.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || "Unknown";
  const secondPrizeAmount =
  cleanText.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || "Unknown";
  const thirdPrizeAmount =
cleanText.match(/Third\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
cleanText.match(/Third\s+Prize?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  cleanText.match(/660\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
   cleanText.match(/\(660\s+Prizes?\s+of\s*Rs\.?([\d,]+)/i)?.[1] || "Unknown";

  const firstPrize = text.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() || "Not found";
  
  const secondPrizeRaw = text.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] || "";
  const secondPrizes = secondPrizeRaw.split(/\s+/).filter(n => /^\d+$/.test(n));

  const thirdPrizeNumbers = text
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult= {
         mainurl: result.url,
      contentLink: fullLink,
      year: contentLink.year,
      text: contentLink.text,
      data: pageData,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity,
      firstPrizeAmount:firstPrizeAmount,
      secondPrizeAmount:secondPrizeAmount,
      thirdPrizeAmount:thirdPrizeAmount,
      firstPrize:firstPrize,
      secondPrizes:secondPrizes,
      otherBondNumbers: thirdPrizeNumbers
    }
  };


    const year = contentLink.year || "unknown";
    const filename = contentLink.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

    saveJSON(series,year,filename,MainResult);
      
// const filename = path.basename(contentLink.href, path.extname(contentLink.href));
//       saveJSON(results.Year, filename, dataResults);

  }
}
        break;
     
         case 1:
          {
          const series='200';
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    for (const contentLink1 of result.PageContent) {
          console.log("Prize Bond Numbers:", contentLink1);
const fullLink1 = contentLink1.href.startsWith("http")
      ? contentLink1.href
      : ``; 
      await page.goto(fullLink1, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const pageData1 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });
      console.log("pageData:", pageData1);
      dataResults1.push(pageData1);
      const singleResult1 = {
      mainurl: result.url,
      contentLink: fullLink1,
      year: contentLink1.year,
      text: contentLink1.text,
      data: pageData1,
    };

    
  const text1 = pageData1[0] || ""; // get full text from <pre>
const drawNo =
  // For "Draw No.: 86TH", "DRAW NO. 86", "Draw No 81st"
  text1.match(/DRAW\s*NO[\.:]*\s*([0-9]{1,3})\s*(?:ST|ND|RD|TH)?/im)?.[1] ||

  // For Prize Bond 102 Draw"
  text1.match(/PRIZE\s*BOND\s*(\d{1,3})\s*DRAW/i)?.[1] ||

  // For "102nd Draw" / "102 Draw" / "83RD Draw"
  text1.match(/(\d{1,3})\s*(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||

  "Unknown";

console.log("Draw No:", drawNo);

const drawCity1 =
  text1.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() || 
  text1.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount1 =
  text1.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || "Unknown";
  const secondPrizeAmount1 =
  text1.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || 
  text1.match(/Second\s+Prize\s+of\s+Rs\.+Rs\.?\s*([\d,]+)/i)?.[1] || 
  "Unknown";
  const thirdPrizeAmount1 =
  text1.match(/Third\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
text1.match(/Third\s+Prize?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text1.match(/2394\s+Prize(?:\(s\)|s)?\s+of\s*([\d,]+)/i)?.[1] ||
   text1.match(/\(2,394\s+Prizes?\s+of\s*Rs\.\s+?([\d,]+)/i)?.[1] || "Unknown";





  const firstPrize1 = text1.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() || "Not found";
  
  const secondPrizeRaw1 = text1.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] || "";
  const secondPrizes1 = secondPrizeRaw1.split(/\s+/).filter(n => /^\d+$/.test(n));

const thirdPrizeNumbers1 = text1
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult1= {
         mainurl: result.url,
      contentLink: fullLink1,
      year: contentLink1.year,
      text: contentLink1.text,
      data: pageData1,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity1,
      firstPrizeAmount:firstPrizeAmount1,
      secondPrizeAmount:secondPrizeAmount1,
      thirdPrizeAmount:thirdPrizeAmount1,
      firstPrize:firstPrize1,
      secondPrizes:secondPrizes1,
      otherBondNumbers: thirdPrizeNumbers1
    }
  };


   
    const year1 = contentLink1.year || "unknown";
    const filename1 = contentLink1.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

     saveJSON(series,year1,filename1,MainResult1);
    
    }
  }
        break;

           case 2:
          {
          const series='750';
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    for (const contentLink2 of result.PageContent) {
          console.log("Prize Bond Numbers:", contentLink2);
const fullLink2 = contentLink2.href.startsWith("http")
      ? contentLink2.href
      : ``; 
      await page.goto(fullLink2, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const pageData2 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });
      console.log("pageData:", pageData2);
      dataResults2.push(pageData2);
      const singleResult2 = {
      mainurl: result.url,
      contentLink: fullLink2,
      year: contentLink2.year,
      text: contentLink2.text,
      data: pageData2,
    };

    
     const text2 = pageData2[0] || ""; // get full text from <pre>
const cleanText2 = text2
  .replace(/\u00A0/g, " ") 
  .replace(/\s+/g, " ")    
  .trim();

const drawNo =
  cleanText2.match(/DRAW\s*NO[\.:]?\s*:?[\s]*([0-9]{1,3})(?:ST|ND|RD|TH)?/i)?.[1] ||
  cleanText2.match(/(\d{1,3})(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||
  "Unknown";


const drawCity2 =
  text2.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() ||
  text2.match(/HELD\s+ON\s+(\w+)/i)?.[1]?.trim() || 
  text2.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
   text2.match(/HELD\s+AT\s*"?\s*(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount2 =
  text2.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text2.match(/\bFirst\s+Price\s+([\d,]+)/i)?.[1] ||
   "Unknown";
  const secondPrizeAmount2 =
  text2.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || 
  text2.match(/Second\s+Prize\s+of\s+Rs\.+Rs\.?\s*([\d,]+)/i)?.[1] || 
   text2.match(/\bSecond\s+Price\s+([\d,]+)/i)?.[1] ||
  "Unknown";
  const thirdPrizeAmount2 =
  text2.match(/1696\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text2.match(/1696\s+Prize\(s\)\s+of\s*([\d,]+)/i)?.[1] ||
  
  "Unknown";




  const firstPrize2 = text2.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() || 
  text2.match(/(\d+)\s+First\s+Price/i) ||
  "Not found";
  
  const secondPrizeRaw2 = text2.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] ||
  text2.match(/(\d+)\s+Second\s+(?:Prize|Price)/i)?.[1] ||
  "";
  const secondPrizes2 = secondPrizeRaw2?.split(/\s+/).filter(n => /^\d+$/.test(n));

const thirdPrizeNumbers2 = text2
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult2= {
         mainurl: result.url,
      contentLink: fullLink2,
      year: contentLink2.year,
      text: contentLink2.text,
      data: pageData2,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity2,
      firstPrizeAmount:firstPrizeAmount2,
      secondPrizeAmount:secondPrizeAmount2,
      thirdPrizeAmount:thirdPrizeAmount2,
      firstPrize2,
      secondPrizes2,
      otherBondNumbers: thirdPrizeNumbers2
    }
  };


   
    const year2 = contentLink2.year || "unknown";
    const filename2 = contentLink2.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

     saveJSON(series,year2,filename2,MainResult2);
    }
  }
        break;
    
           case 3:
          {
          const series='1500';
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    for (const contentLink3 of result.PageContent) {
          console.log("Prize Bond Numbers:", contentLink3);
const fullLink3 = contentLink3.href.startsWith("http")
      ? contentLink3.href
      : ``; 
      await page.goto(fullLink3, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const pageData3 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });
      console.log("pageData:", pageData3);
      dataResults3.push(pageData3);
      const singleResult3 = {
      mainurl: result.url,
      contentLink: fullLink3,
      year: contentLink3.year,
      text: contentLink3.text,
      data: pageData3,
    };

    
   const text3 = pageData3[0] || ""; // get full text from <pre>
const cleanText3 = text3
  .replace(/\u00A0/g, " ") 
  .replace(/\s+/g, " ")    
  .trim();

const drawNo =
  cleanText3.match(/DRAW\s*NO[\.:]?\s*:?[\s]*([0-9]{1,3})(?:ST|ND|RD|TH)?/i)?.[1] ||
  cleanText3.match(/(\d{1,3})(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||
  "Unknown";

const drawCity3 =text3.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() ||

  text3.match(/HELD\s+ON\s+(\w+)/i)?.[1]?.trim() || 
  text3.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
   text3.match(/HELD\s+AT\s*"?\s*(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount3 =
  text3.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text3.match(/\bFirst\s+Price\s+([\d,]+)/i)?.[1] ||
   "Unknown";
  const secondPrizeAmount3 =
  text3.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || 
  text3.match(/Second\s+Prize\s+of\s+Rs\.+Rs\.?\s*([\d,]+)/i)?.[1] || 
   text3.match(/\bSecond\s+Price\s+([\d,]+)/i)?.[1] ||
  "Unknown";
  const thirdPrizeAmount3 =
  text3.match(/Third\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text3.match(/1696\s+Prize\(s\)\s+of\s*([\d,]+)/i)?.[1] ||
   text3.match(/\{1696\s+Prizes?\s+of\s*Rs\.?([\d,]+)/i)?.[1] ||
  
  "Unknown";








  const firstPrize3= text3.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() ||
  text3.match(/First\s+Prize.*?[\r\n\s]+(\d+)/i)?.[1] ||
  "Not found";
  
  const secondPrizeRaw3 = text3.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] || "";
  const secondPrizes3 = secondPrizeRaw3.split(/\s+/).filter(n => /^\d+$/.test(n));

const thirdPrizeNumbers3 = text3
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult3= {
         mainurl: result.url,
      contentLink: fullLink3,
      year: contentLink3.year,
      text: contentLink3.text,
      data: pageData3,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity3,
      firstPrizeAmount:firstPrizeAmount3,
      secondPrizeAmount:secondPrizeAmount3,
      thirdPrizeAmount:thirdPrizeAmount3,
      firstPrize:firstPrize3,
      secondPrizes:secondPrizes3,
      otherBondNumbers: thirdPrizeNumbers3
    }
  };


   
    const year3 = contentLink3.year || "unknown";
    const filename3 = contentLink3.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

     saveJSON(series,year3,filename3,MainResult3);
    
    }
  }
        break;

           case 4:
          {
          const series='25000';
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    for (const contentLink4 of result.PageContent) {
          console.log("Prize Bond Numbers:", contentLink4);
const fullLink4 = contentLink4.href.startsWith("http")
      ? contentLink4.href
      : ``; 
      await page.goto(fullLink4, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const pageData4 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });
      console.log("pageData:", pageData4);
      dataResults4.push(pageData4);
      const singleResult4= {
      mainurl: result.url,
      contentLink: fullLink4,
      year: contentLink4.year,
      text: contentLink4.text,
      data: pageData4,
    };

  const text4 = pageData4[0] || ""; // get full text from <pre>
const cleanText4 = text4
  .replace(/\u00A0/g, " ") 
  .replace(/\s+/g, " ")    
  .trim();

const drawNo =
  cleanText4.match(/DRAW\s*NO[\.:]?\s*:?[\s]*([0-9]{1,3})(?:ST|ND|RD|TH)?/i)?.[1] ||
  cleanText4.match(/(\d{1,3})(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||
  "Unknown";

const drawCity4 =text4.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() ||

  text4.match(/HELD\s+ON\s+(\w+)/i)?.[1]?.trim() || 
  text4.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
   text4.match(/HELD\s+AT\s*"?\s*(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount4 =
  text4.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text4.match(/\bFirst\s+Price\s+([\d,]+)/i)?.[1] ||
   "Unknown";
  const secondPrizeAmount4 =
  text4.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || 
  text4.match(/Second\s+Prize\s+of\s+Rs\.+Rs\.?\s*([\d,]+)/i)?.[1] || 
   text4.match(/\bSecond\s+Price\s+([\d,]+)/i)?.[1] ||
  "Unknown";
  const thirdPrizeAmount4 =
  text4.match(/Third\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text4.match(/700\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
   text4.match(/\(700\s+Prizes?\s+of\s*Rs\.?([\d,]+)/i)?.[1] ||
  
  "Unknown";





  const firstPrize4= text4.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() || "Not found";
  
  const secondPrizeRaw4= text4.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] || "";
  const secondPrizes4 = secondPrizeRaw4.split(/\s+/).filter(n => /^\d+$/.test(n));

const thirdPrizeNumbers4 = text4
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult4= {
         mainurl: result.url,
      contentLink: fullLink4,
      year: contentLink4.year,
      text: contentLink4.text,
      data: pageData4,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity4,
      firstPrizeAmount:firstPrizeAmount4,
      secondPrizeAmount:secondPrizeAmount4,
      thirdPrizeAmount:thirdPrizeAmount4,
     firstPrize:firstPrize4,
      secondPrizes:secondPrizes4,
      otherBondNumbers: thirdPrizeNumbers4
    }
  };


   
    const year4 = contentLink4.year || "unknown";
    const filename4 = contentLink4.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

     saveJSON(series,year4,filename4,MainResult4);
    
    }
  }
        break;

   case 5:
          {
          const series='40000';
       await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });   
    for (const contentLink5 of result.PageContent) {
          console.log("Prize Bond Numbers:", contentLink5);
const fullLink5 = contentLink5.href.startsWith("http")
      ? contentLink5.href
      : ``; 
      await page.goto(fullLink5, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const pageData5 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("pre")).map((a) =>
          a.innerText.trim()
        );
      });
      console.log("pageData:", pageData5);
      dataResults5.push(pageData5);
      const singleResult5 = {
      mainurl: result.url,
      contentLink: fullLink5,
      year: contentLink5.year,
      text: contentLink5.text,
      data: pageData5,
    };

    
    dataResults5.push(singleResult5);

   
   const text5 = pageData5[0] || ""; 

 const cleanText5 = text5
  .replace(/\u00A0/g, " ") 
  .replace(/\s+/g, " ")    
  .trim();

const drawNo =
  cleanText5.match(/DRAW\s*NO[\.:]?\s*:?[\s]*([0-9]{1,3})(?:ST|ND|RD|TH)?/i)?.[1] ||
  cleanText5.match(/(\d{1,3})(?:ST|ND|RD|TH)?\s*DRAW/i)?.[1] ||
  "Unknown";

const drawCity5 =text5.match(/HELD\s+AT\s+(\w+)/i)?.[1]?.trim() ||

  text5.match(/HELD\s+ON\s+(\w+)/i)?.[1]?.trim() || 
  text5.match(/SBP\s+BSC\s+(\w+)/i)?.[1]?.trim() || 
   text5.match(/HELD\s+AT\s*"?\s*(\w+)/i)?.[1]?.trim() || 
  "Unknown";
  const firstPrizeAmount5 =
  text5.match(/First\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text5.match(/\bFirst\s+Price\s+([\d,]+)/i)?.[1] ||
   "Unknown";
  const secondPrizeAmount5 =
  text5.match(/Second\s+Prize\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] || 
  text5.match(/Second\s+Prize\s+of\s+Rs\.+Rs\.?\s*([\d,]+)/i)?.[1] || 
   text5.match(/\bSecond\s+Price\s+([\d,]+)/i)?.[1] ||
  "Unknown";
  const thirdPrizeAmount5 =
  text5.match(/Third\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
  text5.match(/660\s+Prizes?\s+of\s+Rs\.?\s*([\d,]+)/i)?.[1] ||
   text5.match(/\(660\s+Prizes?\s+of\s*Rs\.?([\d,]+)/i)?.[1] ||
  
  "Unknown";






  const firstPrize5 = text5.match(/First Prize.*?\n+(\d+)/i)?.[1]?.trim() || "Not found";
  
  const secondPrizeRaw5 = text5.match(/Second Prize.*?\n+([\d\s]+)/i)?.[1] || "";
  const secondPrizes5 = secondPrizeRaw5.split(/\s+/).filter(n => /^\d+$/.test(n));

const thirdPrizeNumbers5 = text5
  .match(/\d+/g)
  ?.filter(num => num.length >= 5) || [];

  // return formatted structure
  const MainResult5= {
         mainurl: result.url,
      contentLink: fullLink5,
      year: contentLink5.year,
      text: contentLink5.text,
      data: pageData5,
    formatted: {
      drawNumber: drawNo,
      drawCity:drawCity5,
      firstPrizeAmount:firstPrizeAmount5,
      secondPrizeAmount:secondPrizeAmount5,
      thirdPrizeAmount:thirdPrizeAmount5,
      firstPrize:firstPrize5,
      secondPrizes:secondPrizes5,
      otherBondNumbers: thirdPrizeNumbers5
    }
  };


   
    const year5 = contentLink5.year || "unknown";
    const filename5 = contentLink5.text?.replace(/[\\/:*?"<>|]/g, "_") || `file_${Date.now()}`;

     saveJSON(series,year5,filename5,MainResult5);
    
    }
  }
        break;




      default:
        break;
     }
  
 }






//  this is previous code
//   const dataResults = [];

//   for (const result of results) {
//     console.log("Visiting:", result[0].url);

//     await page.goto(result.url, {
//       waitUntil: "domcontentloaded",
//       timeout: 60000,
//     });

//     // for (const contentLink of result.PageContent) {
//     //   console.log("Prize Bond Numbers:", contentLink);

//     //   await page.goto(contentLink, {
//     //     waitUntil: "domcontentloaded",
//     //     timeout: 60000,
//     //   });

//     //   const pageData = await page.evaluate(() => {
//     //     return Array.from(document.querySelectorAll("pre")).map((a) =>
//     //       a.innerText.trim()
//     //     );
//     //   });
//     //   console.log("pageData:", pageData);
//     //   dataResults.push(pageData);
//     // }
//   }


  fs.writeFileSync("quotes.json", JSON.stringify(results, null, 2));
  console.log("Saved to quotes.json url and page-content");

  //  fs.writeFileSync("./prizeBonds/100/fristlist.json", JSON.stringify(dataResults, null, 2));
  // console.log("Saved to firstlist");

  //  fs.writeFileSync("./prizeBonds/200/secondlist.json", JSON.stringify(dataResults1, null, 2));
  // console.log("Saved to secondlist");

  //  fs.writeFileSync("./prizeBonds/750/thirdlist.json", JSON.stringify(dataResults2, null, 2));
  // console.log("Saved to thirdlist");

  //  fs.writeFileSync("./prizeBonds/1500/fourthlist.json", JSON.stringify(dataResults3, null, 2));
  // console.log("Saved to fourthlist");

  //  fs.writeFileSync("./prizeBonds/25000/fifthlist.json", JSON.stringify(dataResults4, null, 2));
  // console.log("Saved to fifthlist");

  //   fs.writeFileSync("./prizeBonds/40000/sixthlist.json", JSON.stringify(dataResults5, null, 2));
  // console.log("Saved to sixthlist");


//   fs.writeFileSync("prizeNumbers.txt", JSON.stringify(dataResults,null,2));
//   console.log("Saved to prizeNumbers.json");



  await browser.close();
};

getQuotes();
