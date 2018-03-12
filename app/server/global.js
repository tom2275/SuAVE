var exports = module.exports;
var aboutOne = '<html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <title>About</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="stylesheet" href="/style/bootstrap.min.css"> <link rel="stylesheet" href="/vendor/bootstrap-material-design.min.css"> <link rel="stylesheet" href="/vendor/ripples.min.css"> <script src="/lib/jquery/jquery-2.1.3.min.js"></script> <script src="/vendor/bootstrap.min.js"></script> </head> <body> <div class="container"> <div class="row"> <div class="col-md-8 col-md-offset-2" style="margin-top:5%;"> <div class="panel panel-info"> <div class="panel-heading"> <h1 class="panel-title" style="text-align:center;font-size:30px;">About</h1> <div id="about-title" style="text-align:right;">';
var aboutTwo = '</div></div><div class="panel-body" style="word-wrap: break-word;">';
var aboutThree = '<!-- starting tag-->';
var aboutFour = '                <h3 style="text-align: left;"><span class="s1">This survey was conducted by ...</span></h3> <h3 style="text-align: left;"><span class="s1"><br></span><span class="s1">Survey methodology (time and location, sampling, etc):...</span></h3> <h3 style="text-align: left;"><span class="s1"><br></span><span class="s1">Link to survey codebook: ...</span></h3> <h3 style="text-align: left;"><span class="s1"><br></span><span class="s1">Suggested citation: ...</span></h3> <h3 style="text-align: left;"><span class="s1"><br></span><span class="s1">Point of contact: ... &nbsp;</span></h3> <h3 style="text-align: left;"><span class="s1"><br></span><span class="s1">Additional information URL: ...</span></h3>';
var aboutEnd = '<!-- closing tag--></div> </div> </div> </div> </div> </body> </html>';
var collections = ["default"];
var defaultCol = 0;

exports.getAbout = function(num){
  if(num == 1) {
    return aboutOne;
  }
  else if (num == 2) {
    return aboutTwo;
  }else if (num == 3) {
    return aboutThree;
  }else if (num == 4) {
    return aboutFour;
  }else if (num == 5) {
    return aboutEnd;
  }
};

exports.getDefaultCollect = function(){
  return collections[0];
};

exports.getDefaultCol = function(){
  return defaultCol;
}

exports.getCollections = function(){
  return collections;
};
