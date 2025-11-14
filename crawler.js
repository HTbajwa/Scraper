import puppeteer from "puppeteer";

async function getVisual() {
	try {
		const URL = 'http://quotes.toscrape.com/page/2/'
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto(URL)

		await page.screenshot({ path: 'screenshot4.png' })
		await page.pdf({ path: 'page4.pdf' })
        const jsonData=JSON.stringify(page,null,2)
        console.log(jsonData)

		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

getVisual()