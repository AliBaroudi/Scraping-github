const puppeteer = require('puppeteer');

const BASE_URL = 'https://instagram.com/';
const TAG_URL = (tag) => `https://instagram.com/explore/tags/${tag}/`;

/*Les accent grave servent à concaténé */

const instagram = {
    
    browser: null,
    page: null,

    initialize: async() =>{
        instagram.browser = await puppeteer.launch({
            headless:false
        });
        instagram.page =  await instagram.browser.newPage();
    },

    login: async (username,password) =>{

        await instagram.page.goto(BASE_URL, {waitUntil:'networkidle2'});

        /*Va chercher le bouton connecter */
        let loginButton = await instagram.page.$x('//a[contains(text(), "Log in")]');

        /*Clic sur le bouton connecter */
        await loginButton[0].click();

        await instagram.page.waitFor(1000);

        /* Les username et password*/
        await instagram.page.type('input[name="username"]',username, {delay:50});
        await instagram.page.type('input[name="password"]',password, {delay:50});

        await page.click('button[type="submit"]');
        await page.waitFor(1000);

        for ( let tag of tags){
            await page.goto(TAG_URL(tag),{ waitUntil:'networkidle2' });
            await page.waitFor(1000);

            let posts = await page.$$('article > div:nth-child(3) img[decoding="auto"]');
            for (let i=0 ;i <3 ; i++){
                let post = posts[i];
                await post.click();
                await page.waitFor('span[id="react-root"]');
                await page.waitFor(1000);

                await post.click('span[aria-label=“Like”]');
                await page.waitFor(3000);

                let closeModalButton =  await page.$x('//button[contains(text(),"Close")]');
                await closeModalButton[0].click();
                await page.waitFor(1000);
            }
            await page.waitFor(60000);
        }
    },
    LikeTagsProcess: async (tags = [])=> {
        for(let tag of tags){
            await instagram.page.goto(TAG_URL, {waitUntil : 'networkidle2'});
            await instagram.page.wiatFor(1000);

            //récuperation des postes
            let posts = await instagram.page.$$('article > div:nth-child(3) img[decoding="auto"]');

            for(let i = 0; i<3; i++){
                let post = posts[i];

                await post.click();
                
                await instagram.page.waitFor('#react-root');
                await instagram.page.waitFor(1000);

                let isLikable = await instagram.page.$(`span[aria-label="Like"]`);

                if(isLikable){
                    await instagram.page.click(`span[aria-label="Like"]`);
                }

                await instagram.page.waitFor(3000);

                let closeModalButton = await instagram.page.$x('//button[contains(text(),"Close")]');
                await closeModalButton[0].click();
                await instagram.page.waitFor(1000);
            }

            await instagram.page.waitFor(15000);
        }
        instagram.browser.close();
    }
}
module.exports=instagram;