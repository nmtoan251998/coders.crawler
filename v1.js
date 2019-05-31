/*
TODO: Cleancode - Functionalize source code
*/

const puppeteer = require('puppeteer');
const fs = require('fs');

const fullURL = 'https://www.instagram.com/vitaminn.eyes/';

(async () => {
    try {        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(fullURL);

        page.screenshot({ path: __dirname + `/test.png` });
        page.pdf({ path: __dirname + `/test.pdf`, format: 'A4' });

        const DOMContent = await page.content();
        fs.writeFile(__dirname + `/test.html`, DOMContent, function(err) {
            if(err) return console.log(err);
        }); 

        let imgSrcsets = await page.evaluate(() => {
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
        
        const JSONImgSrcsets = {
            data: imgSrcsets.map(data => data)
        }
        const data = JSON.stringify(JSONImgSrcsets.data, null, '\t');

        fs.writeFile('test.json', data, 'utf8', (err) => {
            if(err) console.log(err)
        });
                
        await page.waitFor(3000)
        await browser.close();
    } catch(err) {
        console.log(err);
    }    
})();