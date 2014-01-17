var Sitemap = require('./controllers/sitemapcontroller').SitemapController;
/**
 * Module dependencies.
 */
var express   = require('express'),
  routes    = require('./routes'),
  user      = require('./routes/user'),
  http      = require('http'),
  path      = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(__dirname + '/components'));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/',  function (req, res) {

  var domain  = req.param('domain'),
    segmented = req.param('segmented'),
    sort      = req.param('sort'),
    sitemap = new Sitemap(true),
    result;

  result = sitemap.generate(domain, segmented, sort, function(result){
    console.log(result);
    res.render('index.jade', {
      title       : domain,
      finalResult : result
    });  
  });

  
});

app.get('/download/:domain/sitemap.xml', function (req, res) {
  var url = req.url;
  var file = __dirname + '/public' + url;
  res.download(file);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});