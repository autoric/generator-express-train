module.exports = function () {
    return {

        // Landing page
        index: function (req, res, next) {
            res.render('index');
        }

    };
};