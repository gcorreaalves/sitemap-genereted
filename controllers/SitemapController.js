var Crawler    = require("simplecrawler").Crawler,
  xmlbuild     = require('xmlbuilder'),
  fs           = require('fs'),
  mkdirp       = require('mkdirp');

function mkdir_p(path, mode, callback, position) {
  mode     = mode || 0777;
  position = position || 0;
  parts    = require('path').normalize(path).split('/');

  if (position >= parts.length) {
    if (callback) {
      return callback();
    } else {
      return true;
    }
  }
  var directory = parts.slice(0, position + 1).join('/');
  fs.stat(directory, function (err) {
    if (err === null) {
      mkdir_p(path, mode, callback, position + 1);
    } else {
      fs.mkdir(directory, mode, function (err) {
        if (err) {
          if (callback) {
            return callback(err);
          } else {
            throw err;
          }
        } else {
          mkdir_p(path, mode, callback, position + 1);
        }
      });
    }
  });
}

SitemapController = function () {
  var sort    = false,
    segmented = false,
    limited   = 100,
    domain    = null;
};
SitemapController.prototype.setup = function (config) {
  this.sort      = config.sort;
  this.segmented = config.segmented;
  this.limited   = config.limited;
};
SitemapController.prototype.generate = function (domain) {

  this.domain = domain;

  var that    = this,
    crawler    = new Crawler(domain),
    urls       = [],
    sitemap    = [],
    siteMapXML = "";

  crawler.supportedMimeTypes = [
    /^text\//i
  ];
  crawler.scanSubdomains = false;
  crawler.ignoreWWWDomain = true;
  crawler.cache = true;
  crawler.initialProtocol = 'http';
  crawler.maxConcurrency = 20;
  crawler.interval = 1;

  crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
    if (queueItem.stateData.contentType.indexOf("text/html") != -1 && (queueItem.domain == crawler.domain)) {
      urls.push(queueItem.url);
      console.log(queueItem.url);
      //console.log(queueItem.path);
    }
  });
  crawler.start();

  crawler.on("complete", function () {
    console.log(urls.length + " urls found!");

    sitemap = that.sortURLs(urls);
    /*if (that.segmented) {
      sitemap = that.segmented(urls);
    }*/

    siteMapXML = that.BuildXML(sitemap);

    that.OutputSiteMap(siteMapXML);

  });
};
SitemapController.prototype.sortURLs = function (urlsVetor) {
  return urlsVetor.sort();
};
SitemapController.prototype.segmented = function (urlsVetor) {
  // TODO: segmentar vetor...
};
SitemapController.prototype.BuildXML = function (urlsVetor) {
  var xmlFileOutput = '<?xml version="1.0" encoding="UTF-8"?>\n',
    doc = xmlbuild.create(),
    node = doc.begin('urlset').att('xmlns', 'http://www.google.com/schemas/sitemap/0.90');

  var i  = null,
    size = 0;
  for (i = 0, size = urlsVetor.length; i < size; i++) {
    node.ele('url').ele('loc').txt(urlsVetor[i]);
  }

  xmlFileOutput += doc.toString({ pretty: true });
    return xmlFileOutput;

};
SitemapController.prototype.OutputSiteMap = function (sitemapXML) {

  var fullpath = "public/download/" + this.domain;

  mkdirp(fullpath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(fullpath + '/' + "sitemap.xml", sitemapXML, function (err) {
        if (err) {
         console.log(err);
        } else {
            console.log("The file was saved!");
        }
      });
    }
  });
};

exports.SitemapController = SitemapController;