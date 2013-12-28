'use strict';
var util = require('util'),
    path = require('path'),
    _ = require('lodash'),
    yeoman = require('yeoman-generator'),
    semver = require('semver'),
    request = require('superagent');


var ExpressTrainGenerator = module.exports = function ExpressTrainGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(ExpressTrainGenerator, yeoman.generators.Base);


ExpressTrainGenerator.prototype.askFor = function askFor() {
    var cb = this.async(),
        self = this;

    // have Yeoman greet the user.
    console.log(this.yeoman);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    request.get('https://registry.npmjs.org/express-train/latest', function (err, res) {
        var defaultVer = '';

        if (!err) {
            var latest = res.body.version,
                latest = latest.split('.');
            latest[2] = 'x'
            defaultVer = latest.join('.');
        }

        var prompts = [
            {
                type: 'input',
                name: 'version',
                message: 'What version of express train are you using?',
                default: defaultVer,
                validate: function (input) {
                    if (semver.valid(input) === null && semver.validRange(input) === null) {
                        return "Version must be a valid semver string."
                    } else {
                        //do not support versions of express train < 1.0.0
                        if (semver.outside('1.0.0', input, '>')) {
                            return "Sorry, this yeoman generator does not support versions of express train previous to 1.0.0"
                        }
                        return true;
                    }

                }
            }
        ];

        self.prompt(prompts, function (props) {
            self.version = props.version;
            if(semver.valid(self.version) != null) {
                //if we are dealing with a version
                self.gt21 = semver.gte('2.1.0', self.version)
            } else {
                //otherwise this is a range
                self.gt21 = semver.satisfies('2.1.0', self.version)
            }

            cb();
        })
    });
};

ExpressTrainGenerator.prototype.writeDirs = function writeDirs() {
    var self = this;

    var structure = {
        app: {
            controllers: true,
            lib: true,
            middleware: true,
            models: true,
            public: true,
            views: {
                partials: true,
                layouts: true
            }
        },
        bin: true,
        doc: true,
        config: true,
        test: true,
        log: true
    }

    function mkDirs(tree, pathParts) {
        _.each(tree, function (v, k) {
            var dirPath = path.join(pathParts, k);

            self.mkdir(dirPath)
            if (_.isObject(v)) {
                mkDirs(v, dirPath)
            }
        })
    }

    mkDirs(structure, '')
}

ExpressTrainGenerator.prototype.writeFiles = function writeFiles() {
    this.template('_index.js', 'app/index.js');
    this.template('_app.js', 'app.js');
    this.template('_package.json', 'package.json');

    /**
     * Config
     */
    this.template('_default.json', 'config/default.json')

    /**
     * Lib
     */
    this.template('lib/_middleware.js', 'app/lib/middleware.js');
    this.template('lib/_routes.js', 'app/lib/routes.js');
    this.template('lib/_server.js', 'app/lib/server.js');
    this.template('lib/_views.js', 'app/lib/views.js');

    /**
     * Controllers
     */
    this.template('controllers/_HomeController.js', 'app/controllers/HomeController.js');

    /**
     * Views
     */
    this.copy('views/index.hbs', 'app/views/index.hbs')
    this.copy('views/partials/css.hbs', 'app/views/partials/css.hbs')
    this.copy('views/partials/scripts.hbs', 'app/views/partials/scripts.hbs')
    this.copy('views/layouts/default.hbs', 'app/views/layouts/default.hbs')
}