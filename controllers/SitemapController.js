var Crawler    = require("simplecrawler").Crawler,
  xmlbuild     = require('xmlbuilder'),
  fs           = require('fs'),
  mkdirp       = require('mkdirp');

SitemapController = function (seg, lim) {
  this.segmented = seg || false;
  this.limited   = lim || 100;
  this.domain    = null;
};
SitemapController.prototype.verifyURL = function (url) {  
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(url)) {
    return false;
  } else {
    return true;
  }
}
SitemapController.prototype.generate = function (domain, segmented, sort, callback) {

  this.domain     = domain,
  this.segmented  = segmented || false,
  this.sort       = sort || false;

  var result = {};

  if(this.verifyURL(this.domain)){

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
      }
    });
    crawler.start();

    crawler.on("complete", function () {
      sitemap = that.sortURLs(urls);
      if (that.segmented) {
        var objSeg = that.segmental(sitemap), objRoot = [], objSiteMap = [];
        console.log(objSeg);   
        for (var key in objSeg){
          if (objSeg[key].length >= 2) {
            siteMapXML = that.BuildXML(objSeg[key]); 
            that.OutputSiteMap(siteMapXML, key);
            objSiteMap.push("sitemap-" + key + ".xml");
          }else{
            objRoot.push(objSeg[key][0]);
          }                
        }
        siteMapXML = that.BuildXML(objRoot);  
        that.OutputSiteMap(siteMapXML, null);
        objSiteMap.push("sitemap.xml");

        siteMapXML = that.BuildXML(objSiteMap); 
        that.OutputSiteMap(siteMapXML, "index");      
      } else {
        siteMapXML = that.BuildXML(sitemap);
        that.OutputSiteMap(siteMapXML, null);
      }      
      result.class = "alert-success";
      result.msg = urls.length + " urls encontrada!";
      if(this.segmented){
        result.url = "download/" + that.domain + "/sitemap.zip";
      }else{
        result.url = "download/" + that.domain + "/sitemap.xml";
      }
      callback(result);
    });
  }else{
    result.class = "alert-danger";
    result.msg = "URL inválida";
    callback(result);
  }
};
SitemapController.prototype.sortURLs = function (urlsVetor) {
  if(this.sort){
    return urlsVetor.sort();
  }else{
    return urlsVetor;
  }
};
SitemapController.prototype.segmental = function (urlsVetor) {
  var directory      = "",
    urlSplited       = [],
    objSegemented    = {},
    currentDirectory = '',
    subVetorURLS     = [],
    hasExtension     = false;
  for (var i = 0, size = urlsVetor.length; i < size; i++) {
    urlSplited = urlsVetor[i].split('/');    
    hasExtension = /[.]/g.test(urlSplited[3]);
    if (urlSplited.length > 4 || !(hasExtension)) {
      directory = urlSplited[3];
    } else {
      directory = 'root';
    }
    if (currentDirectory !== directory){
     subVetorURLS = [];       
    }
    
    currentDirectory = directory;
    subVetorURLS.push(urlsVetor[i]);
    objSegemented[currentDirectory] = subVetorURLS;
  }

  return objSegemented;

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
SitemapController.prototype.OutputSiteMap = function (sitemapXML, fileName) {

  var fullpath    = "public/download/" + this.domain,
    finalFileName = (fileName) ? "-" + fileName : '';

  mkdirp(fullpath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(fullpath + '/' + "sitemap" + finalFileName + ".xml", sitemapXML, function (err) {
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