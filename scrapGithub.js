const puppeteer = require('puppeteer')
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
const BASE_URL = 'https://www.github.com/login'
const username = 'elbaroudimohamedali@gmail.com'
const password = 'Alilobaroudi0912'
// const doubleAuth = '902c3-24aa4'

const github = async () => {
    const browser = await puppeteer.launch({headless:false})
    const page =  await browser.newPage()
    await page.setViewport({width:1700, height:1080});
    await page.goto(`${BASE_URL}`, {waitUntil:'networkidle2'})
    await page.type('input[name="login"]', username, {delay:50})
    await page.type('input[name="password"]', password, {delay:50})
    await page.click('input[name="commit"]')
    await page.waitFor(1000);

    // await page.type('input[type="tel"]', doubleAuth, {delay:100})
    // await page.click('button[type="submit"]')
    
    await page.waitFor(1000);
    let errorDoubleAuth = await page.evaluate(() => {
        let error = document.querySelector('.flash-error .container-lg') ? document.querySelector('.flash-error .container-lg').innerText : null
        return error
    }) 
    if(errorDoubleAuth){
        console.error(errorDoubleAuth)
        browser.close();
    } else {
        await page.type('input[name="q"]', "john", {delay : 100})
        await page.type('input[name="q"]', String.fromCharCode(13));
        await page.waitFor(1000);    
        await page.click('.menu-item:last-of-type')
        await page.waitFor(1000);
        let infos = await page.evaluate(() => {
            let results = []
            let items = document.querySelectorAll('.user-list-item')
            for(let i=0; i< items.length-1; i++){
                let name = items[i].querySelector('a.mr-1').innerText
                let mail = items[i].querySelector('a.muted-link') ? items[i].querySelector('a.muted-link').innerText : null
                results.push({
                    name: name,
                    mail: mail
                })
            }
            return results
        })
        console.log(infos)
        mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, client) => {
          if (err) {
            console.error(err)
            return
          }
          //...
          console.log('hello world')
    
          const db = client.db('test')
          const collection = db.collection('scrapingtest')    
          collection.insertMany(infos, (err, result) => {
              if(err){
                  console.log(err)
              } console.log('Data have been saved succesfully in DataBase')
          })
        //Finding Data

        /*collection.find().toArray((err, items) => {
           console.log(items)
        })*/

        //Deleting Data

        /*collection.deleteMany(infos, (err, item) => {
              console.log(item)
        })*/

        })
    
        browser.close();
    }
}

github()