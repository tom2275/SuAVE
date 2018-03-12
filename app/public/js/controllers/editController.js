function EditController()
{
	var that = this;

  var table = document.getElementById('edit-table'),
    availableWidth = $('.breadcrumb').width() + 30,
    availableHeight = $(document).height() - $('.container-fluid').height() - $('.breadcrumb').height() - 20,
    hot;

  $.ajax({
    url: "/getSurveyByFilename",
    type: "GET",
    data: {"filename" : user + '_' + name + '.csv'},
    success: function(data){
      hot = new Handsontable(table,{
        data: data,
        rowHeaders: true,
        colHeaders: true,
        width: availableWidth,
        height: availableHeight,
        stretchH: 'all'
      });
      bindDumpButton();
    },
    error: function(jqXHR){
      console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
    }
  });

  function calculateSize() {
    availableWidth = $('.breadcrumb').width() + 30;
    availableHeight = $(document).height() - $('.container-fluid').height() - $('.breadcrumb').height() - 20;

    table.style.width = availableWidth + 'px';
    table.style.height = availableHeight + 'px';
  }

  Handsontable.Dom.addEvent(window, 'resize', calculateSize);

  function bindDumpButton() {
    if (typeof Handsontable === "undefined") {
      return;
    }

    Handsontable.Dom.addEvent(document.body, 'click', function (e) {
      var element = e.target || e.srcElement;

      if (element.nodeName == "BUTTON" && element.name == 'dump') {
        var name = element.getAttribute('data-dump');
        var instance = element.getAttribute('data-instance');
        var hot = window[instance];
        console.log('data of ' + name, hot.getData());
      }
    });
  }

  $('#btn-save').click(function(){

    $.ajax({
      url: "/changeSurveyByFilename",
      type: "POST",
      data: {"name": name, "user": user, "data": JSON.stringify(hot.getData())},
      success: function(code){
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html('Successfully saved the survey.');
        $('.modal-alert').modal('show');
        setTimeout(function(){if($('model-alert').is(':visible')) {$('.modal-alert').modal('toggle');}}, 3000);
      },
      error: function(jqXHR){
        $('.modal-alert .modal-header h3').text('Failure!');
        $('.modal-alert .modal-body p').html('Failed to save the survey. <br> Please try to login again');
        $('.modal-alert').modal('show');
        setTimeout(function(){if($('model-alert').is(':visible')) {$('.modal-alert').modal('toggle');}}, 3000);
      }
    });
  });


}
