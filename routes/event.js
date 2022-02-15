var express = require('express');
var router = express.Router();
var slugify= require("slugify");
/*Redirection vers la bonne page lors de la recherche*/
router.post ("/", async function(req,res){

    const db = req.app.locals.db.promise();
    let newEvent=req.body;
    newEvent.slug=slugify(newEvent.name,{
        replacement:"-",
        strict:"true",
        lower:"true"
    });
    let sucess= false;
    let number= 0;
    do{ //Verifie si le slug existe déja puis créer un slug avec un identifiant
        try{
            await db.query(`INSERT INTO event
                 (name, slug)
                 VALUES(?, ?)`,
                 [newEvent.name, newEvent.slug+"-"+number]);
                 sucess=true;
            }catch(err){
                if (err.code==="ER_DUP_ENTRY"){
                    number++;

                }else {
                    throw err;
            }
        }
    }while(!sucess)
            res.redirect(`/event/${newEvent.slug}-${number}/`)


    //Enregistrer en BDD le nouvel evenement, et rediriger vers le dashboard de l'événement
})

//Recupere l'id de l'évenement du formulaire présent dans index.pug dans l'url (query pour la methode req et body pour res)
router.get("/open", function(req, res){
    const {id}=req.query;



    //Requete SQL a la base de données
    const db=req.app.locals.db;
    db.query(`SELECT * FROM event WHERE slug=?;`,[id], function(err, events){
        if (err) throw err; //Traite les erreur
        console.log(events);

        //Vérifie si l'event éxiste dans la BDD
        if(events.length>0){

            res.redirect("/event/"+id); //envoie des données vers dashboard
        } else { //redirection en cas d'érreur
            res.redirect(`/?notfound=${id}`);
        }
        //Dans le javsript dans la route home recupérer ce qu'il y a dans l'url puis envoyer au pug

    });
});
    //Ajoute des élément a l'url
    router.get("/:slug", function(req, res, next) {
        const {slug} = req.params;
        const db = req.app.locals.db;
        db.query(`SELECT * FROM event WHERE slug = ?;`, [slug], function(err, events) {
            if (err) throw err;
            // Vérifier si l'évènement a été trouvé en BDD
            if (events.length > 0) {
                res.render('event/dashboard', { dataEvent: events[0] });
            } else {
                next(); //passe au middleware suivant
            }
        });
});
//Création route dépense
router.get("/:slug/expenses", function(req, res, next){
    const {slug} = req.params;
    const db = req.app.locals.db;
    db.query(`SELECT * FROM event WHERE slug = ?;`, [slug], function(err, events) {
        if (err) throw err;
        // Vérifier si l'évènement a été trouvé en BDD
        if (events.length > 0) {
            const event=events[0]
            db.query(
                `SELECT expense.*, category.name AS category
                FROM expense
                INNER JOIN category ON category_id=category.id
                WHERE event_id=?
                ORDER BY created_at DESC;` //Permet de récuperer les données des 2 table et de les afficher et de récupérer l'id de la catégorie de chaque données
                , [event.id], function(err, expenses){
                if(err) throw err;
                console.log(expenses);
                res.render('event/expenses', {dataEvent: event, expenses:expenses });
            });

        } else {
            next( ); //passe au middleware suivant
        }
    });
});
//Ajout d'un formulaire pour ajouter une dépense
router.get("/:slug/expenses/add", function(req, res){
    const {slug} = req.params;
    const db = req.app.locals.db;
    db.query(`SELECT * FROM event WHERE slug = ?;`, [slug], function(err, events) {
        if (err) throw err;

        if (events.length > 0) {
            const event=events[0]
            db.query("SELECT * FROM category",[], function(err, categories){
                if(err) throw err;
                console.log(categories);
                res.render("event/ajouter", {dataEvent: event, categories: categories });
            });

        } else {
            next(); //passe au middleware suivant
        }
    });
});

router.post("/:slug/expenses/add", function(req, res){ //router.post permet de récuperer els info envoyer par le formulaire
    const {slug} = req.params;
    const db = req.app.locals.db;
    db.query(`SELECT * FROM event WHERE slug = ?;`, [slug], function(err, events) {
        if (err) throw err;

        if (events.length > 0) {
            const event=events[0]
        //Enregistre la nouvelle dépense en BDD, puis redirige l'internaute vers la liste des dépenses
        let newExpense=req.body; //On récupère ici un objet dans lequel on aura des clées et des valeur les clées sont affecter en fonction du name des options du formulaire

        db.query(`INSERT INTO expense
            (title, amount, user, paid, created_at, category_id, event_id)
            VALUES(?, ?, ?, 0, NOW(), ?, ?)`, [newExpense.title, newExpense.amount, newExpense.user, newExpense.category, event.id], function(err){
                if (err) throw err;
                res.redirect(`/event/${event.slug}/expenses`);
            })//ajoute des données a la BDD on renseigne les colonnes entre parenthèse puis le nombre de paramètre souhaiter avec les point d'intérogation si on veux des paramètres dynamique ou renseigner un paramètre fixe puis on renseigne dans le tableau les paramretre que vont prendre les point d'interogation lors de l'ajout dans la BDD.

        } else {
            next(); //passe au middleware suivant
        }
    });
});

router.get("/:slug/chart/categories", function(req, res){
    const {slug} = req.params;
    const db = req.app.locals.db;
    db.query(`
            SELECT
            category.*,
            COUNT(*) AS nb_expenses,
            SUM(expense.amount) AS total
            FROM category
            INNER JOIN expense ON expense.category_id = category.id
            INNER JOIN event ON event.id = expense.event_id
            WHERE event.slug = ?
            GROUP BY category.id;
            `, [slug], function(err, categories){
            res.json(categories)
            });

});
module.exports = router;

/*Il faut modifier le fichier app.js pour pouvoir valider la route*/

/*req est la requete et res la response*/

/*Installation du package body parser pour lire les formulaire*/


    //console.log(req.body);
    //console.log(req.query);
