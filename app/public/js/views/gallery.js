var surveys;
var user = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
$(document).ready(function(){
	var gc = new GalleryController();

	surveys = gc.getSurveys(function(e){
		if(e == "error") {
			console.log(e);
		}else {
			surveys = e;
			gc.displaySurveys(surveys);
			$('.page-subheader').append("Num of surveys: " + surveys.length);
		}
	});

});
