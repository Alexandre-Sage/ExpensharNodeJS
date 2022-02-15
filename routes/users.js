var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
   const usersList=["Jean-Luc", "Eric", "Emmanuel"];
  res.render("users/usersList", {sendUsersList: usersList}); //On envoie les données de usersList avec l'objet JavaScript (entre crochet) senUserList
  //res.json(usersList); //Permet de renvoyer des données en json
});

module.exports = router;
