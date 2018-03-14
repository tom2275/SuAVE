
function HomeController()
{
// bind event listeners to button clicks //
	var that = this;
	var DLength;
	var collection = {};
	var shapeData=[];
	var colorData=[];
	var colVal = {};
	var columns; //tags memory
	var oldText; //tag name
	var SID;

//memory settings
var cMemory = false;
var sMemory = false;

// handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });
	$('#btn-update').click(function(){ window.open('/update', "_self"); });

//handle new survey
	$('#btn-addNew').click(function(){$('#modal-new-survey').modal('show'); });

//set listener on buttons
	$(document).on('click', '#select-about-submit', function(){
		document.getElementById('editorFrame').contentWindow.getCode(function(data){

			$.ajax({
				url: "/changeAboutFileByID",
				type: "POST",
				data: {"name" : surveys[SID].name, "fullname": surveys[SID].fullname,
				 "user": user, "data": data},
				success: function(code){
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		});

	});

	$(document).on('click', '#select-icons', function(){
		$('#edit-'+SID).click();
	});

	$(document).on('click', '#select-about', function(){
		$('.modal-select-collection').empty();
		//$('.modal-select-collection').css("width", "800px");
		$('.modal-select-collection').append(
			'<div class="modal-dialog"><div class="modal-content">'+
			'<div class="modal-header"> <button data-dismiss="modal" class="close">x</button>'+
			' <div class="container" style="width:100%;"> <div  class="row"> '+
			'<div class="btn-group" role="group" style="width:100%;">'+
			'<button id="select-icons"  class="btn btn btn-default col-md-3 col-xs-6">View Options</button> '+
			'<button id="select-tags"  class="btn btn btn-default col-md-3 col-xs-6">Edit Variables</button>'+
			'<button id="select-about"  class="btn btn btn-default col-md-3 col-xs-6">Describe Survey</button>  '+
			'<button id="select-reupload"  class="btn btn btn-default col-md-3 col-xs-6">Reupload Data</button>'+
			'</div></div> </div> </div> <div class="modal-body"> <iframe height="450px" width="100%" src="/editor.html" id="editorFrame">'+
		'</iframe><button id="select-about-submit" data-dismiss="modal" class="btn btn-primary">submit</button></div></div></div></div>');

		$('#select-about').button('toggle');
	});

	$(document).on('click', '#edit-button', function(){
		var newWindow = window.open('/edit/' + surveys[SID].user + '/' + surveys[SID].name);
	});

	$(document).on('click', '#select-tags', function(){
		$('.modal-select-collection').empty();
		//$('.modal-select-collection').css("width", "800px");
		$('.modal-select-collection').append(
			'<div class="modal-dialog"><div class="modal-content">'+
			'<div class="modal-header"> <button data-dismiss="modal" class="close">x</button>'+
			' <div class="container" style="width:100%;"> <div  class="row"> '+
			'<div class="btn-group" role="group" style="width:100%;">'+
			'<button id="select-icons"  class="btn btn btn-default col-md-3 col-xs-6">View Options</button> '+
			'<button id="select-tags"  class="btn btn btn-default col-md-3 col-xs-6">Edit Variables</button>'+
			'<button id="select-about"  class="btn btn btn-default col-md-3 col-xs-6">Describe Survey</button>  '+
			'<button id="select-reupload"  class="btn btn btn-default col-md-3 col-xs-6">Reupload Data</button>'+
			'</div></div> </div> </div> <div class="modal-body">'+
			'<button id="select-tags-submit" data-dismiss="modal" class="btn btn-primary">submit</button></div></div></div></div>');

		$('#select-tags').button('toggle');


		$.ajax({
			url: "/getColumnsAndTags",
			type: "GET",
			data: {"name" : surveys[SID].name, "user": user},
			success: function(result){
				columns = result.columns;
				var tags = result.tags;
				var tagNames = [];

				$('.modal-select-collection .modal-dialog .modal-body').prepend(
					'<div class="panel panel-primary">'+
						'<div class="panel-heading" id="tags-heading">'+
							'Tags: number, date, long, link, ordinal, multi, textlocation, info, hiddenmore, hidden'+
						'</div>'+
					'</div>'+
					'<div class="dropdown">'+
						'<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'+
							'Add item'+
							'<span class="caret"></span>'+
						'</button>'+
						'<ul id="tag-item-select" class="dropdown-menu" aria-labelledby="dropdownMenu1">'+
						'</ul>'+
						'<button class="btn btn-danger" type="button" id = "edit-button" style="float: right;"> Advanced </button>' +
					'</div>'+
					'<br>'+
					'<div id="tag-list" class="list-group">'+
					'</div>'
				);


				for(var i = 0; i < tags.length; i++){
					/*
					$('#tag-list').append(
						'<a class="list-group-item">'+
						'<button class="close close-tag">x</button>'+
						'<h4 class="list-group-item-heading">'+tags[i].name+'</h4>'+
						'<input type="text" value="'+tags[i].values.join()+'"data-role="tagsinput">'+
						'</a>'
					);
					tagNames.push(tags[i].name);*/
					$('#tag-list').append(
						'<a class="list-group-item">'+
							'<button class="close close-tag">x</button>'+
							'<h4 id="tag-header-'+i+'" class="list-group-item-heading">'+tags[i].name+'</h4>'+
							'<select id="tag-'+i+'" class="selectpicker" data-width="100%" multiple>'+
							  '<optgroup label="Column Data Type" data-max-options="1">'+
							    '<option data-subtext="will be shown as a histogram and a slider in the filter panel">#number</option>'+
							    '<option data-subtext="will be shown to support filtering by dates, in the filter panel">#date</option>'+
							    '<option data-subtext="the filter panel will include a search box for such variables at the top of the panel">#long</option>'+
									'<option data-subtext="will be shown as a link to an external resource in the information panel">#link</option>'+
									'<option data-subtext="will be shown as a special type of histogram in the filter panel.">#ordinal</option>'+
									'<option data-subtext="will be shown as multiple tiles given values for each variable">#multi</option>'+
									'<option data-subtext="expects a well-formatted address that will be geocoded on the fly">#textlocation</option>'+
									'<option data-subtext="will be shown as a short description for the row">#info</option>'+
							  '</optgroup>'+
							  '<optgroup label="Hidden in Filter Panel" data-max-options="1">'+
								'<option data-subtext="won’t appear in the filter panel or in the sorting dropdown list">#hidden</option>'+
								'<option data-subtext="Same as hidden and the right info panel">#hiddenmore</option>'+
							  '</optgroup>'+
							'</select>'+
						'</a>'
					);
					$('#tag-'+i).selectpicker('show');
					tagNames.push(tags[i].name);
					//select options
					$('#tag-'+i).selectpicker('val', tags[i].values);
					$('#tag-header-'+i).editable();
				}

				//listeners on column name changes
				$('.list-group-item-heading').on('save', function(e, params) {
					var index = columns.indexOf(oldText);
					columns[index] = params.newValue;
				});

				for(var i = 0; i < columns.length; i++){
					if(tagNames.indexOf(columns[i]) == -1 &&
						columns[i] != '#img' && columns[i] != '#name' && columns[i] != '#href'){
						$('#tag-item-select').append(
							'<li><a>'+columns[i]+'</a></li>'
						);
					}
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});



	});


//tags listeners
$(document).on('click', '.list-group-item-heading', function(){
	oldText = $(this).text();
});


$(document).on('click', '#tag-item-select li', function(){
	var text = $('a', this).html();
	$('#tag-list').prepend(
		'<a class="list-group-item">'+
			'<button class="close close-tag">x</button>'+
			'<h4 id="tag'+cleanName(text)+'" class="list-group-item-heading">'+text+'</h4>'+
			'<select id="'+cleanName(text)+'" class="selectpicker" data-width="100%" multiple>'+
				'<optgroup label="Column Data Type" data-max-options="1">'+
					'<option data-subtext="will be shown as a histogram and a slider in the filter panel">#number</option>'+
					'<option data-subtext="will be shown to support filtering by dates, in the filter panel">#date</option>'+
					'<option data-subtext="the filter panel will include a search box for such variables at the top of the panel">#long</option>'+
					'<option data-subtext="will be shown as a link to an external resource in the information panel">#link</option>'+
					'<option data-subtext="will be shown as a special type of histogram in the filter panel.">#ordinal</option>'+
					'<option data-subtext="will be shown as multiple tiles given values for each variable">#multi</option>'+
					'<option data-subtext="expects a well-formatted address that will be geocoded on the fly">#textlocation</option>'+
					'<option data-subtext="URL to be invoked as user clicks on the title">#href</option>'+
					'<option data-subtext="will be shown as a short description for the row">#info</option>'+
				'</optgroup>'+
				'<optgroup label="Hidden in Filter Panel" data-max-options="1">'+
					'<option data-subtext="won’t appear in the filter panel or in the sorting dropdown list">#hidden</option>'+
					'<option data-subtext="Same as hidden and the right info panel">#hiddenmore</option>'+
				'</optgroup>'+
			'</select>'+
		'</a>'
	);

	$('#tag'+cleanName(text)).editable();
	$('#'+cleanName(text)).selectpicker('show');
	//listeners on column name changes
	$('#tag'+cleanName(text)).on('save', function(e, params) {
		var index = columns.indexOf(oldText);
		columns[index] = params.newValue;
	});

	$(this).remove();
});

$(document).on('click', '.close-tag', function(){
	var parent = $(this).parent();

	$('#tag-item-select').append(
		'<li><a>'+$('h4', parent).html()+'</a></li>'
	);

	parent.remove();

});


$(document).on('click', '#select-tags-submit',  function(){
	$("#tag-list").children('.list-group-item').each(function() {
			var index = columns.indexOf($('h4', this).html());
			var text = $('.dropdown-toggle', this).children('.filter-option').text().replace(',','');
			if(text != 'Nothing selected') columns[index] += text;
	});

	$.ajax({
		url: "/changeTagsForSurvey",
		type: "POST",
		data: {"name" : surveys[SID].name, "user": user, "columns": columns},
		success: function(code){
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});

});


	$(document).on('click', '#select-reupload', function(){
		$('.modal-select-collection').modal('show');
		//$('.modal-select-collection').css("width", "560px");
		$('.modal-select-collection').empty();
		//upload file
		$('.modal-select-collection').append(
			'<div class="modal-dialog"><div class="modal-content">'+
			'<div class="modal-header"> <button data-dismiss="modal" class="close">x</button>'+
			' <div class="container" style="width:100%;"> <div  class="row"> '+
			'<div class="btn-group" role="group" style="width:100%;">'+
			'<button id="select-icons"  class="btn btn btn-default col-md-3 col-xs-6">View Options</button> '+
			'<button id="select-tags"  class="btn btn btn-default col-md-3 col-xs-6">Edit Variables</button>'+
			'<button id="select-about"  class="btn btn btn-default col-md-3 col-xs-6">Describe Survey</button>  '+
			'<button id="select-reupload"  class="btn btn btn-default col-md-3 col-xs-6">Reupload Data</button>'+
			'</div></div> </div> </div> <div class="modal-body"> <h3>Select a new csv file to upload:</h3> '+
		'<form id="replace-survey" action="/replaceCSV" method="POST" enctype="multipart/form-data"> '+
		'<hr/> <fieldset> <div class="control-group"> <input type="file" name="file" required="required"/> </div>'+
		'<div class="form-buttons"> <hr><button id="replace-survey-submit" type="submit" class="btn btn-primary">'+
		'submit</button> </div> </fieldset> </form> </div></div></div>');

		$('#select-reupload').button('toggle');

		$('#replace-survey').ajaxForm({
			data: surveys[SID],
			beforeSubmit : function(formData, jqForm, options){
				$('.modal-loading').modal({ show : false, keyboard : false, backdrop : 'static' });
				$('.modal-loading .modal-body h3').html('Loading....');
				$('.modal-loading').modal('show');
				return true;
			},
			success	: function(responseText, status, xhr, $form){
				setTimeout(function(){window.location.href = '/';}, 300);
			},
			error : function(e){

			}
		});
	});

	window.editorFrameLoaded = function (){
		$.ajax({
			url: "/getAboutFileByID",
			type: "GET",
			data: {"name" : surveys[SID].name, "user": user},
			success: function(code){
				document.getElementById('editorFrame').contentWindow.setCode(code);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	var prepSetting = function(survey){
		var c = JSON.parse(survey.collection);
		if( c.sColumn != undefined && c.sColumn != '|^'){
			sMemory = true;
			$('#column-select-1 option[value='+c.sColumn+']').prop('selected', true);
			$('#collect-select option[value='+c.name+']').prop('selected', true);
			collection['sColumn'] = parseInt($('#column-select-1').find(':selected').val());
			that.fetchColVal($('#column-select-1').find(':selected').text(),
					$('#collect-select').find(':selected').val());
		}
		if( c.cColumn != undefined && c.cColumn != '|^'){
			cMemory = true;
			$('#column-select-2 option[value='+c.cColumn+']').prop('selected', true);
			collection['cColumn'] = parseInt($('#column-select-2').find(':selected').val());
			that.fetchColVal($('#column-select-2').find(':selected').text(), "");
		}
	};


	$(document).on('click', '.surveys-edit', function(){
		$('.modal-select-collection').modal('show');
		$('.modal-select-collection').empty();
		var id = $(this).attr("id");
		var i = id.split('-').pop();
		SID = i;
		var survey = surveys[i];

		if(survey.dzc){
			$('.modal-select-collection').append(
				'<div class="modal-dialog"><div class="modal-content">'+
				'<div class="modal-header"> <button data-dismiss="modal" class="close">x</button>'+
				' <div class="container" style="width:100%;"> <div  class="row"> '+
				'<div class="btn-group" role="group" style="width:100%;">'+
				'<button id="select-icons"  class="btn btn btn-default col-md-3 col-xs-6">View Options</button> '+
				'<button id="select-tags"  class="btn btn btn-default col-md-3 col-xs-6">Edit Variables</button>'+
				'<button id="select-about"  class="btn btn btn-default col-md-3 col-xs-6">Describe Survey</button>  '+
				'<button id="select-reupload"  class="btn btn btn-default col-md-3 col-xs-6">Reupload Data</button>'+
				'</div></div> </div> </div> <div class="modal-body"> <p style="margin-left:20px;">Public View Options:</p> <div id="pv-views" class="container" style="width:100%;"></div> '+
				' <div class="form-buttons"> '+
				'<button id="select-collection-submit-dzc" data-dismiss="modal" class="btn btn-raised btn-primary">submit</button> </div> </div></div></div>');
		}else{
			//insert collection selections
			$('.modal-select-collection').append(
				'<div class="modal-dialog"><div class="modal-content">'+
				'<div class="modal-header"> <button data-dismiss="modal" class="close">x</button>'+
				' <div class="container" style="width:100%;"> <div  class="row"> '+
				'<div class="btn-group" role="group" style="width:100%;">'+
				'<button id="select-icons"  class="btn btn btn-default col-md-3 col-xs-6">View Options</button> '+
				'<button id="select-tags"  class="btn btn btn-default col-md-3 col-xs-6">Edit Variables</button>'+
				'<button id="select-about"  class="btn btn btn-default col-md-3 col-xs-6">Describe Survey</button>  '+
				'<button id="select-reupload"  class="btn btn btn-default col-md-3 col-xs-6">Reupload Data</button>'+
				'</div></div> </div> </div> <div class="modal-body"> <p style="margin-left:20px;">Public View Options:</p> <div id="pv-views" class="container" style="width:100%;"></div> '+
				'<div class="container" style="width:100%;"> <div class="row"> '+
				'<div class="col-xs-6">'+
				'<p class="subheading">Select a field to associate with shapes:</p> <select id="column-select-1" class="form-control"></select> </div> '+
				'<div class="col-xs-6"> <p class="subheading">Select a shape collection:</p> '+
				'<select id="collect-select" class="form-control"> <option selected="" disabled="" hidden=""></option> <option value="gender">Gender</option>'+
				'<option value="object">Object</option> </select> </div> '+
				'</div></div> '+
				'<div id="column-collect-shape" class="container" style="width:100%;"></div> <hr/> <div class="container" style="width:100%;"> <div class="row"> '+
				'<div class="col-xs-6"> <p class="subheading">Select a field to associate with colors:</p> <select class="form-control" id="column-select-2">'+
				'</select> </div> </div> </div> <div id="column-collect-color" class="container" style="width:100%;"> </div>'+
				'<hr/> <div class="container" style="width:100%;"> <div class="row"> '+
				'<div class="col-xs-6"> <p class="subheading">Select a field to associate with item names:</p> <select class="form-control" id="column-select-3">'+
				'</select> </div>'+
				'<div class="col-xs-6"> <p class="subheading">Select a field to associate with the href link:</p> <select class="form-control" id="column-select-4">'+
				'</select> </div>'+
				' </div> </div>'+
				' <div class="form-buttons"> '+
				'<button id="select-collection-submit" data-dismiss="modal" class="btn btn-raised btn-primary">submit</button> </div> </div></div></div>');
		}
		$('#select-icons').button('toggle');

		collection = {};
		//insert views checkboxes
		$('#pv-views').empty();
		$('#pv-views').append(
			'<div class="row" ><div class="col-xs-4"><input id="pv-grid" class="checkbox-custom"  type="checkbox">'+
			'<label for="pv-grid" class="checkbox-custom-label">Grid</label></div>'+
			'<div class="col-xs-4"><input id="pv-bucket" class="checkbox-custom" type="checkbox">'+
			'<label for="pv-bucket" class="checkbox-custom-label">Bucket</label></div>'+
			'<div class="col-xs-4"> <input id="pv-crosstab" class="checkbox-custom" type="checkbox">'+
			'<label for="pv-crosstab" class="checkbox-custom-label">Crosstab</label></div></div><div class="row">'+
			'<div class="col-xs-4"> <input id="pv-qca" class="checkbox-custom" type="checkbox">'+
			'<label for="pv-qca" class="checkbox-custom-label">QCA</label></div>'+
			'<div class="col-xs-4"> <input id="pv-map" class="checkbox-custom" type="checkbox">'+
			'<label for="pv-map" class="checkbox-custom-label">Map</label> </div>'+
			'<div class="col-xs-4"><input id="pv-r" class="checkbox-custom" type="checkbox">'+
			'<label for="pv-r" class="checkbox-custom-label">R</label></div></div>'
		);
		var views = survey.views.toString();
		if(views[0] == '1') $("#pv-grid").prop("checked", true);
    if(views[1] == '1') $("#pv-bucket").prop("checked", true);
    if(views[2] == '1') $("#pv-crosstab").prop("checked", true);
    if(views[3] == '1') $("#pv-qca").prop("checked", true);
    if(views[4] == '1') $("#pv-map").prop("checked", true);
		if(views[5] == '1') $("#pv-r").prop("checked", true);

		if(!survey.dzc){
			$('#column-select-1').empty();
			$('#column-select-2').empty();
			$('#column-select-3').empty();
			$('#collect-select').prop("selected", false);
			$('#column-collect-shape').empty();
			//get Columns
			$.ajax({
				url: "/getSurveyColumnsNCollection",
				type: "POST",
				data: {"name" : survey.name, "user": user},
				success: function(data){
					var column = data;
					$("#column-select-1").append($("<option selected disabled hidden></option>").html(""));
					$("#column-select-2").append($("<option selected disabled hidden></option>").html(""));
					$("#column-select-3").append($("<option selected disabled hidden></option>").html(""));
					$("#column-select-4").append($("<option selected disabled hidden></option>").html(""));
					for(var i = 0; i < column.length; i++){
						$("#column-select-1").append($("<option></option>").val(i).html(column[i]));
						$("#column-select-2").append($("<option></option>").val(i).html(column[i]));
						if(column[i] != "#name") $("#column-select-3").append($("<option></option>").val(i).html(column[i]));
						if(column[i] != "#href") $("#column-select-4").append($("<option></option>").val(i).html(column[i]));
					}
					if (survey.collection.name != 'default') {
						prepSetting(survey);
					}
					if (survey.iName && survey.iName.name){
						$('#column-select-3 option[value='+survey.iName.name+']').prop('selected', true);
					}
					if (survey.iName && survey.iName.href){
						$('#column-select-4 option[value='+survey.iName.href+']').prop('selected', true);
					}

				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else{
			$('#pv-views').after('<br><div class="container" style="width:100%">'+
			'<div class="row" style="margin-left:5px;"><p >Image definition link:</p></div>'+
			'<div class="row" style="margin-left:5px;"><textarea style="width:90%" id="dzc-link">'+survey.dzc+'</textarea>'+
			'</div></div><br>');
		}

	});

	$(document).on('change', '#collect-select', function(){
    var collectVal = $(this).find(':selected').val();
    var columnVal = $('#column-select-1').find(':selected').text();

    if(columnVal.length > 0){
			collection['sColumn'] = parseInt($('#column-select-1').find(':selected').val());
      that.fetchColVal(columnVal, collectVal);
    }

	});

	$(document).on('change', "#column-select-1", function(){
    var columnVal = $(this).find(':selected').text();
    var collectVal = $('#collect-select').find(':selected').val();

    if(collectVal.length > 0){
			collection['sColumn'] = parseInt($('#column-select-1').find(':selected').val());
    	that.fetchColVal(columnVal, collectVal);
    }
	});

	$(document).on('change', "#column-select-2", function(){
		var columnVal = $(this).find(':selected').text();
		collection['cColumn'] = parseInt($('#column-select-2').find(':selected').val());
		that.fetchColVal(columnVal, "");
	});

	$(document).on('click', '#select-collection-submit-dzc', function(){
		changeViewOptions({});
		console.log($('#dzc-link').val());
		$.ajax({
			url: "/changeSurveyDzc",
			type: "POST",
			data: {"name" : surveys[SID].name, "user": user, "dzc": $('#dzc-link').val()},
			success: function(data){
				setTimeout(function(){window.location.href = '/';}, 500);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});

	$(document).on('click', '#select-collection-submit', function(){

		if($('#collect-select').find(':selected').val() != '' &&
	 				$('#column-select-1').find(':selected').val() != ''){
			for(var i = 0; i < shapeData.length; i++){
				var shape = $('#collect-drop-'+i+' .dd-selected-value').val();
				shapeData[i] = shapeData[i].toLowerCase();
				if(shapeData[i] == ''){
					shapeData[i] = '|^';
				}
				if(shape == '0'){
						collection.sValues[shapeData[i]] = '';
				}else{
						collection.sValues[shapeData[i]] = shape;
				}
			}
		}else{
			collection["sColumn"] = "|^";
		}

		if($('#column-select-2').find(':selected').val() != ''){
			for(var i = 0; i < colorData.length; i++){
				var color = $('#color-drop-'+i+' .dd-selected-value').val();
				colorData[i] = colorData[i].toLowerCase();
				if(colorData[i] == ''){
					colorData[i] = '|^';
				}
				if(color == '0') {
					collection.cValues[colorData[i]] = '';
				}else{
					collection.cValues[colorData[i]] = color;
				}
			}
		}else{
			collection["cColumn"] = "|^";
		}

		var iName = {};
		iName.name = $('#column-select-3').find(':selected').val();
		iName.href = $('#column-select-4').find(':selected').val();
		collection.iName = iName;

		if(collection["cColumn"] != "|^" || collection["sColumn"] != "|^"){
			$.ajax({
				url: "/changeCollection",
				type: "POST",
				data: {"name" : surveys[SID].name, "user": user, "collection": JSON.stringify(collection)},
				success: function(data){
					if(iName.name != '' || iName.href != ''){
						changeIname();
					}
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
			});
		}else if(iName.name != '' || iName.href != ''){
			changeIname();
		}

		changeViewOptions(iName);

		$('.modal-loading').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-loading .modal-body h3').html('Loading....');
		$('.modal-loading').modal('show');

	});

	var changeViewOptions = function(iName){
		var views = "";
		//change view options
		if($("#pv-grid").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}
		if($("#pv-bucket").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}
		if($("#pv-crosstab").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}
		if($("#pv-qca").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}
		if($("#pv-map").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}
		if($("#pv-r").is(':checked')){
			views += 1;
		}else{
			views += 0;
		}

		$.ajax({
			url: "/changeViewOptions",
			type: "POST",
			data: {"name" : surveys[SID].name, "user": user, "views": parseInt(views)},
			success: function(data){
				surveys[SID].views = parseInt(views);
				if(iName.name == '' && iName.href == '') setTimeout(function(){window.location.href = '/';}, 500);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	};

	//deal with asynchronized problem.
	//if two API calls both request write into csv file
	var changeIname = function(){
		var iName = {};
		iName.name = $('#column-select-3').find(':selected').val();
		iName.href = $('#column-select-4').find(':selected').val();
		$.ajax({
			url: "/changeCollectionItemName",
			type: "POST",
			data: {"name" : surveys[SID].name, "iName": iName},
			success: function(data){
				setTimeout(function(){window.location.href = '/';}, 500);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	};

	$(document).on('click', '.toggle', function() {
		var id = $(this).attr("id");
		var index = id.split('-').pop();
    var survey = surveys[index];
		$.ajax({
			url: "/hideSurveyByNameID",
			type: "POST",
			data: {"name" : survey.name, "user": user},
			success: function(data){
				//setTimeout(function(){window.location.href = '/';}, 3000);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});

	$(document).on('click', '.file-source', function() {

		var id = $(this).attr("id");
		var index = id.split('-').pop();
    var survey = surveys[index];

		window.open("/getSurveys/"+survey.user+"_"+survey.name+".csv", "_blank");

	});

	$(document).on('click', '.view-button', function() {
		var id = $(this).attr("id");
		var index = id.split('-').pop();
    var survey = surveys[index];
		var view = id.substring(0, id.length-2);

		if(view == survey.view) return;
		surveys[id.slice(-1)].view = view;

		$.ajax({
			url: "/changeViewByNameID",
			type: "POST",
			data: {"name" : survey.name, "user": user, "view": view},
			success: function(data){
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});

	});

	//when "show" button is clicked
	$(document).on('click', '.surveys-click', function(){
	var id = $(this).attr('id');
		var index = id.split('-').pop();
    var survey = surveys[index];
		var file = survey.name;
		var view;

		if(survey.view.lastIndexOf("-") > survey.view.lastIndexOf("grid")){
			view = survey.view.substring(0, survey.view.lastIndexOf("-"));
		}else{
			view = survey.view
		}
		
//		if(survey.view.slice(-1) == "-"){
//			view = survey.view.substring(0, survey.view.length-1);
//		}else{
//			view = survey.view
//		}

		//Grid, bucket, crosstab, QGA, map
		window.open(window.location+'/../main/file='+user+"_"+file+'.csv'+
			"&views="+survey.views+"&view="+view);


	});

	$(document).on('click', '.surveys-delete', function(){
		var id = $(this).attr('id');
		var file = surveys[id.slice(-1)].name;

		var that = this;
		$('.modal-confirm').modal('toggle');
		$('.modal-confirm .modal-header h3').text('Warning!');
		$('.modal-confirm p').append("Are you sure to delete this survey along with all its annotations?");
		$('.confirm-delete').attr('id', file);
	});

	$(document).on('click', '.confirm-delete', function(){
		var file = $(this).attr('id');
		$('.modal-confirm').modal('toggle');
		$.ajax({
			url: "/deleteSurvey",
			type: "POST",
			data: {"name" : file, "user": user},
			success: function(data){
				$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
				$('.modal-alert .modal-header h3').text('Success!');
				$('.modal-alert .modal-body p').html('Successfully deleted the survey.<br>Redirecting you back to the homepage.');
				$('.modal-alert').modal('show');
				$('.modal-alert button').click(function(){window.location.href = '/';})
				setTimeout(function(){window.location.href = '/';}, 3000);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});

	$(document).on('click', '.confirm-warning', function(){
		$('.modal-warning').modal('toggle');
		that.confirmColVal();
	});

	$(document).on('click', '.cancel-warning', function(){
		console.log(colVal.collectVal);
		if (colVal.collectVal != ''){
			$('#collect-select').val('');
			$('#column-select-1').val('');
		}else{
			$('#column-select-2').val('');
		}

	});

	this.confirmColVal = function(){
		var columnImg = colVal.columnImg;
		var collect = colVal.collect;
		var columnVal = colVal.columnVal;
		var collectVal = colVal.collectVal;
		var data = colVal.data;

		if(collectVal == ""){
			colorData = data;

			//generate initial collect json
			collection['cValues'] = {};

			columnImg = generateImgJson(data);
			Dlength = data.length;
			$('#column-collect-color').append('<p>Please assign a color to each value:</p>');

			for(var i = 0; i < data.length; i++){
				$('#column-collect-color').append(
					'<div class="row"><div class="col-xs-6"><div id="column-drop2-'+i+'"></div></div>'+
					'<div class="col-xs-6"><div id="color-drop-'+i+'"></div></div></div><p style="line-height: 50%;"></p>');
			}

			var count = 0;
			var defaultIndex = 33;
			var values;
			if (surveys[SID].collection.name != "default"){
				values = JSON.parse(surveys[SID].collection).cValues;
			}
			for(var i = 0; i < data.length; i++){
				//inflate collection dropdown
				$('#column-drop2-'+i).append('<div style="width: 250px;background: '+
				'#eee;position: relative;height: 50px;border: solid 1px #ccc;"> '+
				'<a class="dd-selected"><label class="dd-selected-text" '+
				'style="line-height: 47px;">'+columnImg[i].value+'</label></a> </div>');
				if(values && cMemory){
					var v = [];
					for(var key in values) {
							v.push(values[key]);
					}
					defaultIndex = colorIndex[v[i]];
				}
				else if (count > 31){
					count = 0;
					defaultIndex = 33;
				}else if(data.length <= 10){
					defaultIndex = brightColorSet[i];
				}

				$('#color-drop-'+i).ddslick({
					data:colorImg,
					defaultSelectedIndex: defaultIndex,
					width:250,
					background: '#ffffff',
					imagePosition:"right"
				});
				defaultIndex--;
				count++;
			}
			cMemory = false;
		}else{
			shapeData = data;
			//generate initial collect json
			collection['sValues'] = {};
			/*
			for(var i = 0; i < data.length; i++){
				collection.sValues[data[i]] = '';
			}*/

			columnImg = generateImgJson(data);
			Dlength = data.length;
			$('#column-collect-shape').append('<p>Please assign a shape to each value:</p>');

			for(var i = 0; i < data.length; i++){
				$('#column-collect-shape').append(
					'<div class="row">'+
					'<div class="col-xs-6"><div id="column-drop-'+i+'"></div></div>'+
					'<div class="col-xs-6"><div id="collect-drop-'+i+'"></div></div></div><p style="line-height: 50%;"></p>');
			}

			var count = 0;
			var defaultIndex = 1;
			var survey;
			var values;
			if (surveys[SID].collection.name != "default"){
				survey = JSON.parse(surveys[SID].collection);
				values = survey.sValues;
			}

			for(var i = 0; i < data.length; i++){

				//inflate collection dropdown
				$('#column-drop-'+i).append('<div style="width: 250px;background: '+
				'#eee;position: relative;height: 50px;border: solid 1px #ccc;"> '+
				'<a class="dd-selected"><label class="dd-selected-text" '+
				'style="line-height: 47px;">'+columnImg[i].value+'</label></a> </div>');
				if(values && sMemory){
					var v = [];
					for(var key in values) {
							v.push(values[key]);
					}
					if(collectVal == "object"){
						defaultIndex = objectIndex[v[i]];
					}else{
						defaultIndex = genderIndex[v[i]];
					}
				}
				else if (count > 8 && collectVal == "object"){
					count = 0;
					defaultIndex = 1;
				}else if (count > 2 && collectVal == "gender"){
					count = 0;
					defaultIndex = 1;
				}

				$('#collect-drop-'+i).ddslick({
					data:collect,
					defaultSelectedIndex: defaultIndex,
					width:250,
					background: '#ffffff',
					imagePosition:"right"
				});

				defaultIndex++;
				count++;
			}
			sMemory = false;
		}
	};

	this.fetchColVal = function(columnVal, collectVal){
		var columnImg;
		var collect;

		if(collectVal == ""){
			$('#column-collect-color').empty();
			collect = colorImg;
		}else{
			$('#column-collect-shape').empty();
			collection['name'] = collectVal;
			if(collectVal == "default" ){
				collect = defaultImg;
			}else if(collectVal == "gender"){
				collect = genderImg;
			}else if(collectVal == "object"){
				collect = objectImg;
			}
		}

		$.ajax({
			url: "/getColumnsOptions",
			type: "POST",
			data: {"name" : surveys[SID].name, "user": user, "column": columnVal},
			success: function(data){
				colVal.columnImg = columnImg;
				colVal.collect =  collect;
				colVal.columnVal = columnVal;
				colVal.collectVal = collectVal;
				colVal.data = data;
				if(data.length > 50){
					$('.modal-warning').modal('toggle');
					$('.modal-warning .modal-header h3').text('Warning!');
					$('.modal-warning p').html("Too many entries. Are you sure to proceed?");
				}else{
					that.confirmColVal();
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: "/logout",
			type: "POST",
			data: {logout : true},
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}


	this.getSurveys = function(callback)
	{
		var that = this;
		$.ajax({
			url: "/getSurveys",
			type: "POST",
			data: {"user" : user},
			success: function(data){
				callback(data);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				callback("error");
			}
		});
	}

	this.displaySurveys = function(survey){
		var surveys = survey.sort(function(a,b){
      return Date.parse(b.date)-Date.parse(a.date);
    });

		for(i = 0; i < surveys.length; i++){
			$('#display-surveys').append('<div class="col-md-4"> <div class="panel panel-default">  <div class="tab-content"> <div class="tab-pane fade in active" id="tab1-'+i+'"> </div> '+
			'<div class="tab-pane fade" id="tab2-'+i+'"> </div> '+
			'<div class="tab-pane fade" id="tab3-'+i+'" style="width:100%;"> </div> '+
			'</div> <div class="panel-body tabs"> '+
			'<ul class="nav nav-pills"> <li class="active">'+
			'<a href="#tab1-'+i+'" data-toggle="tab">Info</a></li> '+
			'<li><a href="#tab2-'+i+'" data-toggle="tab">Views</a></li> '+
			'<li><a href="#tab3-'+i+'" data-toggle="tab">Edit</a></li> '+
			'</ul></div> </div><!--/.panel--> </div>');

			var date = new Date(surveys[i].date);

			$('#tab1-'+i).append('<div class="row survey-title"> '+
			'<div class="col-xs-6"><div class="icon-img">'+
			'<button id="survey-'+i+'" type="button" class="btn btn-primary btn-circle surveys-click" style="width:100%;"> show</button> </div></div>'+
			'<div class="col-xs-6 survey-info"><h4 style="text-align:center;" class="truncate">'+surveys[i].fullname+'</h4>'+
			'<p style="text-align:center;">Created from: </p>'+
			'<a id="source-'+i+'" class="file-source truncate" style="text-align:center;display:block;">'+surveys[i].originalname+'</a>'+
			'<p style="text-align:center;">'+ date.toLocaleString() +'</p>'+
			'</div>'+
			' </div>');

			var views = surveys[i].views.toString();
			if(views[0] == '1') $('#tab2-'+i).append(
				'<div class="col-xs-6 col-lg-4" ><input type="radio" name="radio-'+i+'" id="grid-button-'+i+'" class="radio"/>'+
				'<label id="grid-'+i+'" class="view-button" for="grid-button-'+i+'">Grid</label></div>');
			if(views[1] == '1') $('#tab2-'+i).append('<div class="col-xs-6 col-lg-4">'+
				'<input type="radio" name="radio-'+i+'" id="bucket-button-'+i+'" class="radio"/><label id="bucket-'+
				i+'" class="view-button" for="bucket-button-'+i+'">Bucket</label></div>');
			if(views[2] == '1') $('#tab2-'+i).append('<div class="col-xs-6 col-lg-4"> <input type="radio" name="radio-'
			+i+'" id="crosstab-button-'+i+'" class="radio"/>'+
			'<label id="crosstab-'+i+'" class="view-button" for="crosstab-button-'+i+'">Crosstab</label></div>');
			if(views[4] == '1') $('#tab2-'+i).append(
				'<div class="col-xs-6 col-lg-4"><input type="radio" name="radio-'+i+'" id="map-button-'+i+'" class="radio"/>'+
				'<label id="map-'+i+'" class="view-button" for="map-button-'+i+'">Map</label></div>');


			$('#tab3-'+i).append(
				'<div class="row" >'+
				'<div class="col-xs-12">'+
				'<div class="list-group">'+
				//'<a class="list-group-item"><div class="toggle-button" id="public-'+i+'"><button ></button></div></a>'+
				'<button id="public-'+i+'" style="text-align:center;" type="button" data-toggle="button" class="btn list-group-item toggle">Public</button>'+
				/*'<button type="button" id="survey-'+i+'" class="btn  surveys-click list-group-item">Show</button>'+*/
				'<button type="button" style="text-align:center;" id="edit-'+i+'" class="btn surveys-edit list-group-item list-group-item-success">Settings</button>'+
				'<button type="button" style="text-align:center;" id="delete-'+i+'" class="btn  surveys-delete list-group-item list-group-item-danger"> Delete</button>'+
				/*
				'<div class="col-xs-4"><button id="survey-'+i+'" class="btn btn-sm btn-raised  btn-primary surveys-click"><i class="fa fa-fw fa-eye"></i> Show</button></div>'+
				'<div class="col-xs-4"><button id="edit-'+i+'" class="btn btn-raised btn-sm btn-primary surveys-edit"><i class="fa fa-map-o"></i>CSV</button></div>'+
				'<div class="col-xs-4"><button id="delete-'+i+'" class="btn btn-raised btn-sm btn-primary surveys-delete"><i class="fa fa-fw fa-warning"></i> Delete</button></div>'+
				*/
				'</div></div></div>'
			);

			var width = $('.tab-content').width()/2-30;
			$('.btn-circle').css("width", width);
			$('.btn-circle').css("height", width);
			$('.btn-circle').css("border-radius", width/6);
			$('.btn-circle').css("font-size", width/4);

			var cw = $('.tab-content').width();
			$('.tab-content').css({'height':0.65*cw+'px'});

			if($('#'+surveys[i].view+'-'+i).length == 0){
				$('#'+'grid-'+i).trigger('click');
			}else{
				$('#'+surveys[i].view+'-'+i).trigger("click");
			}
			if(parseInt(surveys[i].hidden) == 0) {
				$("#public-"+i).button('toggle');
			}
		}
	}

	$(window).on('resize', function () {
		var cw = $('.tab-content').width();
		$('.tab-content').css({'height':0.6*cw+'px'});
		var width = $('.tab-content').width()/2-30;
		$('.btn-circle').css("width", width);
		$('.btn-circle').css("height", width);
		$('.btn-circle').css("border-radius", width/6);
		$('.btn-circle').css("font-size", width/4);
	});
	// redirect to homepage on new survey creation
		$('#help-button').click(function(){window.open("https://docs.google.com/document/d/1f4ABDP1YrEU3vRxYkIPHl9dyGTT4w3pqfRNI2Kn97Ic/edit#heading=h.vcpylem4gnc7")});


}
