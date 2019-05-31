/*
TODO: download more images by using more options from the documents
*/
const puppeteer = require('puppeteer');
const fs = require('fs');
const download = require('image-downloader');

const fullURL = 'https://www.instagram.com/vitaminn.eyes/';

async function getImgAttrs(page) {
    const fullAttrs = await page.evaluate(() => {
        // Convert Array
        let imgEls = Array.from(document.querySelectorAll(`img.FFVAD`));

        const fullAttrs = imgEls.map(el => (
            {   
                srcset: el.getAttribute('srcset'),
                alt: el.getAttribute('alt'),
                src: el.getAttribute('src'),
                sizes: el.getAttribute('sizes'),
                class: el.getAttribute('class'), 
            }
        ));
        return fullAttrs;
    })
    return fullAttrs;
}

function writeToFile(data, filename, expand) {
    fs.writeFile(__dirname + `/test/${filename}.${expand}`, data, 'utf8', (err) => {
        if(err) console.log(err)
    });
}

function downloadImg() {
    const urls = [...arguments];
    
    urls.forEach(url => {
        let options = {
            url: url,
            dest: __dirname + '/images'
        };

        download.image(options)
            .then(({ filename, image }) => {
                console.log('File saved to', filename)
            })
            .catch((err) => {
                console.error(err)
            })
    });
}

(async () => {
    try {        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(fullURL);

        page.screenshot({ path: __dirname + `/test/test.png` });
        page.pdf({ path: __dirname + `/test/test.pdf`, format: 'A4' });        

        // get data by using Promise.all
        const [DOMContent, fullAttrs] = await Promise.all([page.content(), getImgAttrs(page)]);

        fullAttrs.forEach(attr => {
            downloadImg(attr.src);
        })
        
        const JSONImgSrcsets = {
            data: fullAttrs.map(data => data)
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