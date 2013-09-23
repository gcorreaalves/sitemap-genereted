var Crawler = require("simplecrawler").Crawler,
  xmlbuild  = require('xmlbuilder'),
  fs        = require('fs');

SitemapController = function () {
  var sort      = false,
    segmented = false,
    limited   = 100;
};
SitemapController.prototype.setup = function (config) {
  this.sort      = config.sort;
  this.segmented = config.segmented;
  this.limited   = config.limited;
};
SitemapController.prototype.generate = function (domain) {
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
  fs.writeFile("sitemap.xml", sitemapXML, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("The file was saved!");
    }
  });
};

exports.SitemapController = SitemapController;