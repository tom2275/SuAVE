//load google chart
google.charts.load("current", {packages:['corechart', 'geochart']});
var snapshotId;

function CommentsController()
{
  var that = this;


  $(function () {
      $('#toolbar').find('select').change(function () {
          $("#comments-table").bootstrapTable('destroy').bootstrapTable({
              exportDataType: $(this).val()
          });
      });
  })

  // handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });
	$('#btn-update').click(function(){ window.open('/update', "_self"); });

  $("#copy-link").on("click", function(){
    document.querySelector('#share-link').select();
    document.execCommand('copy');
  });

  window.actionEvents = {
    'click .share': function (e, value, row, index) {
      $("#share-link").html("");
      $("#share-dialog").modal('toggle');
      var pathArray = location.href.split( '/' );
  		$("#share-link").append("http://"+pathArray[2]+"/snapshot/"+row.para_id);
    },
    'click .remove': function (e, value, row, index) {
      $('#comments-table').bootstrapTable('remove', {field: "comment_id", values: [row.comment_id]});
      $.ajax({
        url: "/deleteCommentsById",
        type: "POST",
        data: {"id" : [row.comment_id]},
        success: function(output){
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
      });
    }
  };

  $(document).on("click", "#add-comments", function(){
    var newComment = $("#newComment").val();
    if(newComment.length > 0){
      $.ajax({
        url: "/addCommentById",
        type: "POST",
        data: {"id" : snapshotId,
          "user": user,
          "owner": user,
          "comment": newComment},
        success: function(output){
          $("#newComment").val("");
          $.ajax({
            url: "/getCommentsByUSer",
            type: "GET",
            data: {"user": user},
            success: function(output){
              $('#comments-table').bootstrapTable('load', output);
            },
            error: function(jqXHR){
              console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
            }
          });
        },
        error: function(jqXHR){
          console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
        }
      });
    }
  });

  $('#para-toggle').click(function(){
    if($('#para-toggle').text() == "Detailed"){
      $('#comments-table').bootstrapTable('showColumn', "view");
      $('#comments-table').bootstrapTable('showColumn', "category");
      $('#comments-table').bootstrapTable('showColumn', "filters");
      $('#comments-table').bootstrapTable('showColumn', "content");
      $('#comments-table').bootstrapTable('showColumn', "commenter");
      $('#comments-table').bootstrapTable('showColumn', "files");
      $('#comments-table').bootstrapTable('showColumn', "date");
      $('#comments-table').bootstrapTable('showColumn', "user");
      $('#para-toggle').text("Less");
    }else{
      $('#comments-table').bootstrapTable('hideColumn', "view");
      $('#comments-table').bootstrapTable('hideColumn', "category");
      $('#comments-table').bootstrapTable('hideColumn', "filters");
      $('#comments-table').bootstrapTable('showColumn', "content");
      $('#comments-table').bootstrapTable('showColumn', "commenter");
      $('#comments-table').bootstrapTable('showColumn', "files");
      $('#comments-table').bootstrapTable('showColumn', "date");
      $('#comments-table').bootstrapTable('showColumn', "user");
      $('#para-toggle').text("Detailed");
    }
  });

  $('#delete-comments').click(function(){
    var rows = $('#comments-table').bootstrapTable('getSelections');
    var ids = [];
    for(var i = 0; i < rows.length; i++){
      ids.push(rows[i].comment_id);
    }

    $('#comments-table').bootstrapTable('remove', {field: "comment_id", values: ids});

    $.ajax({
      url: "/deleteCommentsById",
      type: "POST",
      data: {"id" : ids},
      success: function(output){
      },
      error: function(jqXHR){
        console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
      }
    });
  });


  this.getGraphPara = function(para_id, row){
    $.ajax({
      url: "/getSnapshotById",
      type: "GET",
      data: {"id" : para_id},
      success: function(data){
        snapshotId = data._id;
        that.getGraph(data, row);
      },
      error: function(jqXHR){
        console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
      }
    });
  }

  //show the google chart
  this.getGraph = function(data, row){
    var graphPara = JSON.parse(data.graph_para);
    var _width = $('.chart_container').width()*0.7;
    var _height = _width*2/3;

    console.log(data.selected_image);
    //According to the PARA, draw charts
    if(data.selected_id != -1) {
      $('#chart_div_'+row.comment_id).html('<p style="margin-top: 20%;" align="center"> <img alt="Item Image" src="' + data.selected_image + '"></p>');
    } else if(graphPara.view == "bucket"){
      var chart = new google.visualization.ColumnChart(document.getElementById("chart_div_"+row.comment_id));
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
      var chart = new google.visualization.BubbleChart(document.getElementById('chart_div_'+row.comment_id));

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
      var chart = new google.visualization.Histogram(document.getElementById('chart_div_'+row.comment_id));

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
      var chart = new google.visualization.GeoChart(document.getElementById('chart_div_'+row.comment_id));
      var dat = graphPara.mData;
      if(dat[0][0] != "Latitude") dat.unshift(["Latitude", "Longitude"]);

      function drawRegionsMap() {

        var data = google.visualization.arrayToDataTable(dat);

        var options = {
          width: _width,
          height: _height,
          defaultColor: '#0074cc',
        };

        chart.draw(data, options);
      }

      google.charts.setOnLoadCallback(drawRegionsMap);
    }else{
      var chart = new google.visualization.PieChart(document.getElementById('chart_div_'+row.comment_id));

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
	};

  this.showLockedAlert = function(msg){
    $('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
    $('.modal-alert .modal-header h3').text('Success!');
    $('.modal-alert .modal-body p').html(msg);
    $('.modal-alert').modal('show');
    $('.modal-alert button').click(function(){window.location.href = '/';})
    setTimeout(function(){window.location.href = '/';}, 3000);
  }
}
