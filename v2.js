/*
TODO: download images
*/
const puppeteer = require('puppeteer');
const fs = require('fs');

const fullURL = 'https://www.instagram.com/vitaminn.eyes/';

async function getImgSrcsets(page) {
    const imgSrcsets = await page.evaluate(() => {
        // Convert Array
        let imgEls = Array.from(document.querySelectorAll(`img.FFVAD`));

        const result = imgEls.map(el => ({
            srcset: el.getAttribute('srcset'),
            alt: el.getAttribute('alt'),
            src: el.getAttribute('src'),
            sizes: el.getAttribute('sizes'),
            class: el.getAttribute('class')
        }));

        return result;
    })
    return imgSrcsets
}

function writeToFile(data, filename, expand) {
    fs.writeFile(`${filename}.${expand}`, data, 'utf8', (err) => {
        if(err) console.log(err)
    });
}

(async () => {
    try {        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(fullURL);

        page.screenshot({ path: __dirname + `/test.png` });
        page.pdf({ path: __dirname + `/test.pdf`, format: 'A4' });

        // get data by using Promise.all
        const [DOMContent, imgSrcsets] = await Promise.all([page.content(), getImgSrcsets(page)]);
        
        const JSONImgSrcsets = {
            data: imgSrcsets.map(data => data)
        }
        const data = JSON.stringify(JSONImgSrcsets.data, null, '\t');

        // Write data to test files
        writeToFile(data, 'test', 'json');
        writeToFile(DOMContent, 'test', 'html');
                
        await page.waitFor(3000)
        await browser.close();
    } catch(err) {
        console.log(err);
    }    
})();