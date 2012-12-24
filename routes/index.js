
/*
 * GET home page.
 */

exports.index = function(req, res){
    req.session.regenerate(function(err) {
        res.render('index', { title: 'Express' });
    });
};