var surveys;

$(document).ready(function(){
	$('.navbar-brand').append("  "+name);
	var hc = new HomeController();

	$('#new-survey').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			// check if uploaded file is of type text/csv
			// console.log(formData[0].value)
			if (formData[0].value.name.split('.').pop() != 'csv') {
			// if (formData[0].value.type != 'text/csv') {
				$('.modal-alert').modal('toggle');
				// $('.modal-alert .modal-header h3').text('Warning!');
				$('.modal-alert p').html("Please upload a csv file!");
				return false;
			} else {
				var name = document.getElementById('new-file-name').value + ".csv";
				$('.modal-loading').modal({ show : false, keyboard : false, backdrop : 'static' });
				$('.modal-loading .modal-body h3').html('Loading....');
				$('.modal-loading').modal('show');
				return true;
			}

		},
		success	: function(responseText, status, xhr, $form){
			setTimeout(function(){window.location.href = '/';}, 300);
		},
		error : function(e){
			$('.modal-loading').modal('hide');
			if(e.responseText == "Name is taken"){
				$("#error-text").text("The name is used!");
			}
		}
	});

	surveys = hc.getSurveys(function(e){
		if(e == "error") {
			console.log(e);
		}else {
			surveys = e;
			hc.displaySurveys(surveys);

			$('.page-subheader').append("Num of surveys: " + surveys.length);
		}
	});
});
