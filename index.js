const ig = require('./instagram');
const creds = require('./creds');

( async () => {

    await ig.initialize();

    await ig.login(username, password);

    await LikeTagsProcess(['city', 'cars']);

    //Ne pas utiliser pour autre chose qu'un entrainement
    //Les CGUs d'innstagram interdise
})()