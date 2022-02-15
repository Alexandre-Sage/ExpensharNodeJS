var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const {notfound}= req.query //on récupere la valeur de notfound
    res.render('index', { title: 'Expenshare', notfound: notfound }); //On envoie les données dans les fichier pug ici


      console.log(notfound)

  //const db=req.app.locals.db //Récuperation de la base de données déclarer dans wwww
   //db.query("SELECT * FROM expense ASC;", (error,expenses)=>{ //fetch de la base de données
      //if(error) throw error;
      //console.log(expenses);
      //res.render('index', { title: 'Express', expenses: expenses /*Transfert des données vers les autres page*/ });
   });

module.exports = router;


//npm install nodemon puis "start": "node ./node_modules/.bin/nodemon bin/www" dans le fichier package.json
