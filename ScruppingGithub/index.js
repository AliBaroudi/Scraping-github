const puppeteer = require('puppeteer');
const CREDS = require ('./creds');
const mongoose = require('mongoose');
const User = require('./models/user');

/*
Recuperer mongoose
Récuperer le model 'user'
*/

async function run(){
    const browser = await puppeteer.launch({
        headless : false
    });

    const page = await browser.newPage();

    await page.goto('https://github.com/login');

    // Definir les differents selecteurs du DOM
    const USERNAME_SELECTOR = "#login_field";
    const PASSWORD_SELECTOR = "#password";
    const BUTTON_SELECTOR = "#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block";
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.password);
    
    await page.click(BUTTON_SELECTOR);
    await page.waitFor('body');

    const userToSearch = "john";
    const searchURL = `https://github.com/search?q=${userToSearch}&type=Users&utf8=✓`;

    await page.goto(searchURL);
    await page.waitFor(2 * 1000);

    const LIST_USERNAME_SELECTOR = "#user_search_results > div.user-list > div:nth-child(INDEX) > .text-normal";

    const LIST_EMAIL_SELECTOR = "#user_search_results > div.user-list > div:nth-child(INDEX) > .muted-link";

    const LENGTH_SELECTOR_CLASS = "user-list-item";

    const numPages = await getNumPages(page);
    for(let i =0; i<=numPages; i++){
        let pageUrl = searchURL + '&p='+ i ;
        await page.goto(pageUrl);

        let listLength = await page.evaluate((sel) =>{
            return document.getElementsByClassName(sel).length;
        }, LENGTH_SELECTOR_CLASS);

        for (let j = 1; j<=listLength; j++){
            let usernameSelector = LIST_USERNAME_SELECTOR.replace('INDEX', j);
            let emailSelector = LIST_EMAIL_SELECTOR.replace('INDEX', j);

            let username = await page.evaluate((sel)=>{
                return document.querySelector(sel).getAttribute('href').Replace('/', '');
            }, usernameSelector);

            let email = await page.evaluate((sel) =>{
                let element = document.querySelector(sel);
                return element ? element.innerHTML:null;
            }, emailSelector);

            if(!email)
            continue;
            
            console.log(username, '->', email);

            upsertUser({
                username : username,
                email : email,
                date: new Date()
            })
        }
    }

    browser.close();


    
    async function getNumPages(page){
        const NUM_USER_SELECTOR ="#js-pjax-container .d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative h3";

        let inner = await page.evaluate((sel) => {
            let html = document.querySelector(sel).innerHTML;

            return html.replace(',','').replace('users', '').trim();
        }, NUM_USER_SELECTOR);

        const numUsers = parseInt(inner);
        console.log('numUsers', numUsers);

        return Math.ceil(numUsers/10);
    }





    function upsertUser(userObj){
        const DB_URL = "mongodb://localhost/github_user";
        if (mongoose.connect(DB_URL)){
            mongoose.connect(DB_URL);
        }
        // Si l'email existe, mettre a jour plutot que l'inserer
        const conditions = {email:userObj.email};
        const options = {upsert:true, new : true, setDefaultOnInsert:true};

        User.findOneAndUpdate(conditions, userObj, options, (err, result) =>{
            if(err){
                return err;
            }
        });
    }


}

run();