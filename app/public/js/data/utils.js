var colorIndex = {
  "default":1,
  "ivory": 2,
  "beige":3,
  "wheat":4,
  "tan":5,
  "khaki":6,
  "silver":7,
  "gray":8,
  "charcoal":9,
  "navy_blue":10,
  "royal_blue":11,
  "medium_blue":12,
  "azure":13,
  "cyan":14,
  "aquamarine":15,
  "teal":16,
  "forest_green":17,
  "olive":18,
  "chartreuse":19,
  "lime":20,
  "golden":21,
  "goldenrod":22,
  "coral":23,
  "salmon":24,
  "hot_pink":25,
  "fuchsia":26,
  "puce":27,
  "mauve":28,
  "lavender":29,
  "plum":30,
  "indigo":31,
  "crimson":32,
  "maroon":33
};

var brightColorSet = [32, 28, 24, 21, 20, 15, 13, 9, 7, 3];

var genderIndex = {
  "male":1,
  "female":2,
  "agender":3
};


var objectIndex = {
  "atom":1,
  "battery":2,
  "car":3,
  "cloud":4,
  "plane":5,
  "spider":6,
  "sun":7,
  "tree":8,
  "water":9
};

var colorImg = [
    {
        text: "Please select a color",
        value: 0,
        selected: false,
        imageSrc: "/../../img/default.jpg"
    },
    {
        text: "Default",
        value: "default",
        selected: false,
        imageSrc: "/../../img/default.jpg"
    },
    {
        text: "Ivory",
        value: "ivory",
        selected: false,
        imageSrc: "/../../img/color/ivory.jpg"
    },
    {
        text: "Beige",
        value: "beige",
        selected: false,
        imageSrc: "/../../img/color/beige.jpg"
    },
    {
        text: "Wheat",
        value: "wheat",
        selected: false,
        imageSrc: "/../../img/color/wheat.jpg"
    },
    {
        text: "Tan",
        value: "tan",
        selected: false,
        imageSrc: "/../../img/color/tan.jpg"
    },
    {
        text: "Khaki",
        value: "khaki",
        selected: false,
        imageSrc: "/../../img/color/khaki.jpg"
    },
    {
        text: "Silver",
        value: "silver",
        selected: false,
        imageSrc: "/../../img/color/silver.jpg"
    },
    {
        text: "Gray",
        value: "gray",
        selected: false,
        imageSrc: "/../../img/color/gray.jpg"
    },
    {
        text: "Charcoal",
        value: "charcoal",
        selected: false,
        imageSrc: "/../../img/color/charcoal.jpg"
    },
    {
        text: "Navy Blue",
        value: "navy_blue",
        selected: false,
        imageSrc: "/../../img/color/navy_blue.jpg"
    },
    {
        text: "Royal Blue",
        value: "royal_blue",
        selected: false,
        imageSrc: "/../../img/color/royal_blue.jpg"
    },
    {
        text: "Medium Blue",
        value: "medium_blue",
        selected: false,
        imageSrc: "/../../img/color/medium_blue.jpg"
    },
    {
        text: "Azure",
        value: "azure",
        selected: false,
        imageSrc: "/../../img/color/azure.jpg"
    },
    {
        text: "Cyan",
        value: "cyan",
        selected: false,
        imageSrc: "/../../img/color/cyan.jpg"
    },
    {
        text: "Aquamarine",
        value: "aquamarine",
        selected: false,
        imageSrc: "/../../img/color/aquamarine.jpg"
    },
    {
        text: "Teal",
        value: "teal",
        selected: false,
        imageSrc: "/../../img/color/teal.jpg"
    },
    {
        text: "Forest Green",
        value: "forest_green",
        selected: false,
        imageSrc: "/../../img/color/forest_green.jpg"
    },
    {
        text: "Olive",
        value: "olive",
        selected: false,
        imageSrc: "/../../img/color/olive.jpg"
    },
    {
        text: "Chartreuse",
        value: "chartreuse",
        selected: false,
        imageSrc: "/../../img/color/chartreuse.jpg"
    },
    {
        text: "Lime",
        value: "lime",
        selected: false,
        imageSrc: "/../../img/color/lime.jpg"
    },
    {
        text: "Golden",
        value: "golden",
        selected: false,
        imageSrc: "/../../img/color/golden.jpg"
    },
    {
        text: "Goldenrod",
        value: "goldenrod",
        selected: false,
        imageSrc: "/../../img/color/goldenrod.jpg"
    },
    {
        text: "Coral",
        value: "coral",
        selected: false,
        imageSrc: "/../../img/color/coral.jpg"
    },
    {
        text: "Salmon",
        value: "salmon",
        selected: false,
        imageSrc: "/../../img/color/salmon.jpg"
    },
    {
        text: "Hot Pink",
        value: "hot_pink",
        selected: false,
        imageSrc: "/../../img/color/hot_pink.jpg"
    },
    {
        text: "Fuchsia",
        value: "fuchsia",
        selected: false,
        imageSrc: "/../../img/color/fuchsia.jpg"
    },
    {
        text: "Puce",
        value: "puce",
        selected: false,
        imageSrc: "/../../img/color/puce.jpg"
    },
    {
        text: "Mauve",
        value: "mauve",
        selected: false,
        imageSrc: "/../../img/color/mauve.jpg"
    },
    {
        text: "Lavender",
        value: "lavender",
        selected: false,
        imageSrc: "/../../img/color/lavender.jpg"
    },
    {
        text: "Plum",
        value: "plum",
        selected: false,
        imageSrc: "/../../img/color/plum.jpg"
    },
    {
        text: "Indigo",
        value: "indigo",
        selected: false,
        imageSrc: "/../../img/color/indigo.jpg"
    },
    {
        text: "Crimson",
        value: "crimson",
        selected: false,
        imageSrc: "/../../img/color/crimson.jpg"
    },
    {
        text: "Maroon",
        value: "maroon",
        selected: false,
        imageSrc: "/../../img/color/maroon.jpg"
    }
];

var defaultImg = [
  {
      text: "Default",
      value: "default",
      selected: true,
      imageSrc: "/../../img/default.jpg"
  }
];

var genderImg = [
  {
      text: "Please select a shape",
      value: 0,
      selected: false,
      imageSrc: "/../../img/default.jpg"
  },
  {
      text: "Male",
      value: "male",
      selected: false,
      imageSrc: "/../../img/gender/male.jpg"
  },
  {
      text: "Female",
      value: "female",
      selected: false,
      imageSrc: "/../../img/gender/female.jpg"
  },
  {
      text: "Agender",
      value: "agender",
      selected: false,
      imageSrc: "/../../img/gender/agender.jpg"
  }

];


var objectImg = [
  {
      text: "Please select a shape",
      value: 0,
      selected: false,
      imageSrc: "/../../img/default.jpg"
  },
  {
      text: "Atom",
      value: "atom",
      selected: false,
      imageSrc: "/../../img/object/atom.jpg"
  },
  {
      text: "Battery",
      value: "battery",
      selected: false,
      imageSrc: "/../../img/object/battery.jpg"
  },
  {
      text: "Car",
      value: "car",
      selected: false,
      imageSrc: "/../../img/object/car.jpg"
  },
  {
      text: "Cloud",
      value: "cloud",
      selected: false,
      imageSrc: "/../../img/object/cloud.jpg"
  },
  {
      text: "Plane",
      value: "plane",
      selected: false,
      imageSrc: "/../../img/object/plane.jpg"
  },
  {
      text: "Spider",
      value: "spider",
      selected: false,
      imageSrc: "/../../img/object/spider.jpg"
  },
  {
      text: "Sun",
      value: "sun",
      selected: false,
      imageSrc: "/../../img/object/sun.jpg"
  },
  {
      text: "Tree",
      value: "tree",
      selected: false,
      imageSrc: "/../../img/object/tree.jpg"
  },
  {
      text: "Water",
      value: "water",
      selected: false,
      imageSrc: "/../../img/object/water.jpg"
  }
];

function generateImgJson(options){
  var result = [];
  for(var i = 0; i < options.length; i++){
    data = options[i];
    if(data.length == 0) data = "Null";
    result.push({'text': data,
                  'value': data,
                  'selected': false,
                  'imageSrc': "/../../img/default/blue.jpg"}
    );
  }
  return result;
}

/*
function turnOnTag(element){
  $(element).tagsinput({
    typeahead: {
      source: ['#number', '#date', '#long', '#link', '#ordinal', '#textlocation', '#hidden', '#href']
    },
    freeInput:false,
    onTagExists: function(item, $tag) {
      $tag.hide().fadeIn();
      setTimeout(function(){
        $('.bootstrap-tagsinput > input').val('');
      }, 10);
    },
    cancelConfirmKeysOnEmpty: true,
    trimValue: true
  });

  $(element).on('beforeItemAdd', function(event) {
    setTimeout(function(){
      $('.bootstrap-tagsinput > input').val('');
    }, 10);
  });
}*/

function cleanName(uncleanName){
  var name = uncleanName.replace(/[^\w]/gi, '_');
  return name;
}
