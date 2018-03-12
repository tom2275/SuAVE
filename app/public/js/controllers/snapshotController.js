function SnapshotController()
{
  // bind event listeners to button clicks //
  	var that = this;
    var graphPara;

    //load google chart
    google.charts.load("current", {packages:['corechart', 'geochart']});

    // bind event listeners to button clicks //
    	$('#retrieve-password-submit').click(function(){ $('#get-credentials-form').submit();});
    	$('#login-form #forgot-password').click(function(){
    		$('#cancel').html('Cancel');
    		$('#retrieve-password-submit').show();
    		$('#get-credentials').modal('show');
    	});

    // automatically toggle focus between the email modal window and the login form //
    	$('#get-credentials').on('shown', function(){ $('#email-tf').focus(); });
    	$('#get-credentials').on('hidden', function(){ $('#user-tf').focus(); });


    this.checkLogin = function(){
  		$("#login-row").html("");
      if(document.cookie.indexOf("pass") > 0 || remember == false){
        $("#login-row").append(
          '<div class="col-sm-6 col-sm-offset-2">'+
            '<div id="comment-part" class="form-group label-floating">'+
              '<label for="newComment" style="font-size:100%;" class="control-label">Add new comment:</label>'+
              '<textarea id="newComment" style="width:100%; font-size:100%" class="form-control"></textarea>'+
            '</div>'+
          '</div>'+
          '<div class="col-xs-1">'+
            '<button id="add-comments" type="button" class="btn btn-raised btn-info">Add</button>'+
          '</div>');
      }else{
        $("#login-row").append(
          '<div class="col-sm-6 col-sm-offset-2">'+
            '<div class="row">'+
              '<div class="col-xs-offset-2 col-sm-6 col-sm-offset-3 col-md-8 col-md-offset-4">'+
                '<button id="login" data-toggle="modal" data-target="#login-dialog" type="button" class="btn btn-raised btn-danger">Login to comment</button>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
    };

    that.checkLogin();


    $(document).on("click", "#add-comments", function(){
      var newComment = $("#newComment").val();
      if(newComment.length > 0){
        var replyUser;
        if(remember == false){
          replyUser = user;
        }else{
          replyUser = document.cookie.substring(document.cookie.indexOf("user=")+5,
      			document.cookie.indexOf('pass=')-2);
        }
        $.ajax({
          url: "/addCommentById",
          type: "POST",
          data: {"id" : snapshotPara._id,
            "user": replyUser,
            "owner": snapshotPara.user,
            "comment": newComment},
          success: function(output){
            $("#newComment").val("");
            $("#panel-comments").html("");
            that.displayComments(output);
          },
          error: function(jqXHR){
            console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
          }
        });
      }
    });

    $(document).on('click', '#toggle-filter', function(){
      $("#panel-comments").html("");
      if($('#toggle-filter').text() == 'See all comments'){
        $('#toggle-filter').text('Less')
        var para = {};
        para.file = snapshotPara.file;
        para.user = snapshotPara.user;
        para.view = snapshotPara.view;
        para.x_axis = snapshotPara.x_axis;
        para.y_axis = snapshotPara.y_axis;

        $.ajax({
          url: "/getCommentsByParametersWithoutFilters",
          type: "GET",
          data: {"para": para},
          success: function(output){
            that.displayPara("on");
            that.displayComments(output);
          },
          error: function(jqXHR){
            console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
          }
        });
      }else{
        $('#toggle-filter').text('See all comments');
        that.getComments(snapshotPara._id);
        that.displayPara();
      }
    });

    $("#copy-link").on("click", function(){
      document.querySelector('#share-link').select();
      document.execCommand('copy');
    });

    $("#share-snapshot").on("click", function(){
  		$("#share-link").append(location.href);
  	});

    $("#show-snapshot").on("click", function(){
      window.open(window.location+'/../../main/file='+snapshotPara.user+"_"+snapshotPara.file+'.csv'+
        "&views="+views+"&view="+graphPara.view+"&id="+snapshotPara._id);
    });

    $("#show-about").on("click", function(){
      window.open(window.location+'/../../surveys/'+snapshotPara.user+"_"+snapshotPara.file+'about.html');
    });


    //get view options for the survey
    this.getViews = function(){
      $.ajax({
        url: "/getViewOptionsByName",
        type: "GET",
        data: {"file" : snapshotPara.file, "user": snapshotPara.user},
        success: function(data){
          views = data;
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
      });
    };

    //get the comments associated with the survey
    this.getComments = function(id){
      $.ajax({
        url: "/getCommentsById",
        type: "GET",
        data: {"id" : id},
        success: function(data){
          comments = data;
          if(comments.length > 0) that.displayComments(comments);
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
      });
    };

    this.displayComments = function(comments){
      if(!$("#comments-table").length){
        $("#para-panel").after(
          '<div class="row">'+
          '<div class="col-sm-8 col-sm-offset-2">'+
          '<div class="panel panel-info">'+
          '<div id="comments-table" style="text-align: center;" class="panel-body table-responsive">'+
          '<table class="table table-striped table-hover" style="table-layout: fixed; width:100%;">'+
          '<tbody id="panel-comments"></tbody>'+
          '</table></div></div></div></div>'
        )
        $('#comments-table').css('max-height',$(window).height()*0.2);
      }

      for(var i = 0; i < comments.length; i++){
        var dateString = comments[i].date;
        $("#panel-comments").append("<tr>"+
                                  "<td class='comment-num'>"+(i+1)+"</td>"+
                                  "<td class='comment-user'>"+comments[i].user+"</td>"+
                                  "<td class='comment-content'>"+comments[i].content+"</td>"+
                                  "<td class='comment-date'>"+dateString+"</td>"+
                                  "</tr>");
      }
    };


    this.displayPara = function(filter){
      $('#para-table').css('max-height',$(window).height()*0.2);
      $("#panel-para").html("");
      if(snapshotPara.y_axis){
        $("#panel-para").append("<tr>");
        $("#panel-para").append("<td>X axis: "+snapshotPara.x_axis+"<br>Y axis: "+snapshotPara.y_axis+"</td>");
        $("#panel-para").append("</tr>");
      }else{
        $("#panel-para").append("<tr>");
        $("#panel-para").append("<td><h4>Category: </h4>"+snapshotPara.x_axis+"</td>");
        $("#panel-para").append("</tr>");
      }

      var text = (snapshotPara.selected != -1 && snapshotPara.selected)? 'selected item' : 'view';
      $("#panel-para").append("<tr><td><h4>Type: </h4>"+ text +"</td></tr>");

      if(snapshotPara.string_filters != "None" && !filter){
        $("#panel-para").append("<tr>");
        $("#panel-para").append("<h4>String filters:</h4>");
        for(var i = 0; i < snapshotPara.string_filters.length; i++){
          var filter = snapshotPara.string_filters[i];
          if(i>0){
            $("#panel-para").append("<br>"+filter.facet+"(");
          }else{
            $("#panel-para").append(filter.facet+"(");
          }

          $("#panel-para").append(filter.value[0]);
          for(var j =1; j < filter.value.length; j++){
            $("#panel-para").append(", "+filter.value[j]);
          }
          $("#panel-para").append(")");

        }
        $("#panel-para").append("</tr>");
      }

      if(snapshotPara.num_filters != "None" && !filter){
        $("#panel-para").append("<tr>");
        $("#panel-para").append("<h4>Numeric filters:</h4>");
        for(var i = 0; i < snapshotPara.num_filters.length; i++){
          var filter = snapshotPara.num_filters[i];
          if(i>0){
            $("#panel-para").append("<br>"+filter.facet+"(");
          }else{
            $("#panel-para").append(filter.facet+"(");
          }
          $("#panel-para").append(filter.selectedMin+" to "+filter.selectedMax);
          $("#panel-para").append(")");

        }
        $("#panel-para").append("</tr>");
      }
    };

    //get graphic paras by id
    this.getSnapshotPara = function(id){
      $.ajax({
        url: "/getSnapshotById",
        type: "GET",
        data: {"id" : id},
        success: function(data){
          snapshotPara = data;
          console.log(data);
          that.displayPara();
          that.getViews();
          that.getComments(id);
          google.charts.setOnLoadCallback(that.getGraph);
          $(".panel-title").append("File: "+data.file+" User: "+data.user);
          if(data.num_filters != "None" || data.string_filters != "None"){
            $('#switch-filter').append('<button id="toggle-filter" type="button" class="btn btn-info">See all comments</button>')
          }
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
      });
    };

    //show the google chart
    this.getGraph = function(data){
      var _width;
      if ($(window).width() <= 767) {
        _width = $('#comment-template').width()
      }else{
        _width = $('#comment-template').width()*5/6;
      }
      var _height = _width*2/3;

      graphPara = JSON.parse(snapshotPara.graph_para);

      //According to the PARA, draw charts
      if(snapshotPara.selected_id != -1) {
        $('#chart_div').html('<p align="center"> <img alt="Item Image" src="' + snapshotPara.selected_image + '"></p>');
      } else if(graphPara.view == "bucket"){
  			var chart = new google.visualization.ColumnChart(document.getElementById("chart_div"));
  			var dat = [];
  			dat.push([graphPara.x, "Count"]);

  			for(var i = 0; i <graphPara.xData.length; i++){
  				dat.push(graphPara.xData[i]);
  			}

  			function drawChart() {
  				var data = google.visualization.arrayToDataTable(dat);

  				var view = new google.visualization.DataView(data);
  				view.setColumns([0, 1,
  												 { calc: "stringify",
  													 sourceColumn: 1,
  													 type: "string",
  													 role: "annotation" }]);

  				var options = {
            width: _width,
            height: _height,
  					bar: {groupWidth: "95%"},
  					legend: { position: "none" },
  					hAxis: {
  	        	direction:1,
  	        	slantedText:true,
  	        	slantedTextAngle:30
  	    		},
            vAxis: {
              baseline: 0
            }
  				};
  				chart.draw(view, options);
  			}
        google.charts.setOnLoadCallback(drawChart);
  		}else if(graphPara.view == "crosstab"){
  			var chart = new google.visualization.BubbleChart(document.getElementById('chart_div'));

  			var dat = [];
  			dat.push(["ID", graphPara.x, graphPara.y, "Paras", "Count"]);
  			var xLabels = [];
  			var yLabels = [];
  			for(var i = 0; i < graphPara.xSize; i++){
  				for(var j = 0; j < graphPara.ySize; j++ ){
  					var cell = graphPara.yData[j+graphPara.ySize*i];
  					if(cell[2] != 0){
  						dat.push([cell[2].toString(), i+1, j+1, cell[0]+" vs "+cell[1], cell[2]])
  					}

  				}
  			}

  			for(var i = 0; i < graphPara.ySize; i++){
  				var temp = {};
  				temp.v = i+1;
  				temp.f = graphPara.yData[i][1];
  				yLabels.push(temp);
  			}

  			for(var i = 0; i < graphPara.xSize; i++){
  				var temp = {};
  				temp.v = i+1;
  				temp.f = graphPara.yData[i*graphPara.ySize][0];
  				xLabels.push(temp);
  			}


  			function drawSeriesChart() {

  	      var data = google.visualization.arrayToDataTable(dat);

  	      var options = {
            width: _width,
            height: _height,
  					sizeAxis: {minValue: 1, maxSize: 15},
  					bar: {groupWidth: "95%"},
  					legend: { position: "none"},
            //chartArea: {width: '70%', height: '70%', left: '10%', right: '10%'},
  	        //hAxis: {title: graphPara.x, maxValue: graphPara.xSize, format: '0'},
  	        //vAxis: {title: graphPara.y, maxValue: graphPara.ySize, format: '0'}
  					hAxis: {
  						viewWindow:{min:0, max:  graphPara.xSize+1},
  						ticks:  xLabels,
  						direction:1,
  						slantedText:true,
  						slantedTextAngle:30 },
  					vAxis: {
  						viewWindow:{min:0, max:  graphPara.ySize+1},
  						ticks:  yLabels}
  	      };

  				chart.draw(data, options);
      	}
        google.charts.setOnLoadCallback(drawSeriesChart);
  		}else if(graphPara.view == "grid"){
  			var chart = new google.visualization.Histogram(document.getElementById('chart_div'));

  			var dat = [];
  			dat.push(["-", "-"]);
  			var height = Math.floor(graphPara.gSize/10);
  			var left = graphPara.gSize%10;

  			for(var i = 0; i < height; i++){
  				for(var j = 0; j < 10; j++){
  					dat.push([(i*10+j).toString(), j+Math.random()]);
  				}
  			}

  			if(left > 0){
  				for(var i = 0; i < left; i++){
  					dat.push([(height*10+i).toString(), i+Math.random()]);
  				}
  			}

  			function drawChart() {
  				var data = google.visualization.arrayToDataTable(dat);

  				var options = {
            title: graphPara.x,
            width: _width,
            height: _height,
  					histogram: { bucketSize: 1},
            legend: 'none'
          };

  				chart.draw(data, options);
  			}
        google.charts.setOnLoadCallback(drawChart);
  		}else if(graphPara.view == "map") {
        var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
  			var dat = graphPara.mData;
  			if(dat[0][0] != "Latitude") dat.unshift(["Latitude", "Longitude"]);

        function drawRegionsMap() {

          var data = google.visualization.arrayToDataTable(dat);

          var options = {
            title: graphPara.x,
            width: _width,
            height: _height,
            legend: 'none',
            defaultColor: '#0074cc',
          };

          chart.draw(data, options);
        }

        google.charts.setOnLoadCallback(drawRegionsMap);
  		}else{
  			var chart = new google.visualization.PieChart(document.getElementById('chart_div'));

        function drawChart() {

          var data = google.visualization.arrayToDataTable([
            ['SuAVE', 'Version'],
            ['SuAVE',     1]
          ]);

          var options = {
            width: _width,
            height: _height,
            title: graphPara.x
          };

          chart.draw(data, options);
  			}
        google.charts.setOnLoadCallback(drawChart);
  		}
    };

    if ($(window).width() <= 767) $('.btn-info').addClass('btn-sm');

}
