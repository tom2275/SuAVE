function GalleryController() {
    // bind event listeners to button clicks //
    var that = this;
    $(".page-header").append(" by " + user);

    //set listener on buttons

    $(document).on('click', '.surveys-click', function() {
        var id = $(this).attr('id');
        var index = id.split('-').pop();
        var survey = surveys[index];
        var file = survey.name;
        var view;

        if (survey.view.slice(-1) == "-") {
            view = survey.view.substring(0, survey.view.length - 1);
        } else {
            view = survey.view
        }

        //Grid, bucket, crosstab, QGA, map
        window.open(window.location + '/../../main/file=' + user + "_" + file + '.csv' +
            "&views=" + survey.views + "&view=" + view);
    });

    $(document).on('click', '#contact-author', function() {
        $('.modal-contact').modal('toggle');
    });


    $(document).on('submit', '#contact-form', function() {
        // prevent default form submit action
        event.preventDefault();


        // post application to server
        $.ajax({
            url: "/sendMessage",
            type: 'POST',
            data: {
                'name': $('#name').val(),
                'email': $('#email').val(),
                'message': $('#message').val(),
								'username': user
            },
            success: function(data) {
                $('.modal-contact').modal('toggle');
                $('#alert-content').html('Congratulations! You have sent the message!');
								$('.modal-alert').modal('toggle');
                setTimeout(function() {
                    $('.modal-alert').modal('toggle');
                }, 3000);
            },
            error: function(jqXHR) {
                $('.modal-contact').modal('toggle');
                $('#alert-content').html('Sorry, there is something wrong! Please try again');
                $('.modal-alert').modal('toggle');
                setTimeout(function() {
                    $('.modal-alert').modal('toggle');
                }, 3000);
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });

        return false;
    });



    this.getSurveys = function(callback) {
        var that = this;
        $.ajax({
            url: "/getPublicSurveys",
            type: "POST",
            data: {
                "user": user
            },
            success: function(data) {
                callback(data);
            },
            error: function(jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
                callback("error");
            }
        });
    }

    $(document).on('click', '.file-source', function() {

        var id = $(this).attr("id");
        var index = id.split('-').pop();
        var survey = surveys[index];


        window.open("/getSurveys/" + survey.user + "_" + survey.name + ".csv", "_blank");

    });

    this.displaySurveys = function(survey) {
        var surveys = survey.sort(function(a, b) {
            return Date.parse(b.date) - Date.parse(a.date);
        });

        for (i = 0; i < surveys.length; i++) {
            $('#display-surveys').append('<div class="col-md-4"> <div class="panel panel-default">  <div class="tab-content"> <div class="tab-pane fade in active" id="tab1-' + i + '"> </div> ' +
                '<div class="tab-pane fade" id="tab2-' + i + '"> </div> ' +
                '<div class="tab-pane fade" id="tab3-' + i + '" style="width:100%;"> </div> ' +
                '</div></div><!--/.panel--> </div>');

            var date = new Date(surveys[i].date);

            $('#tab1-' + i).append('<div class="row survey-title"> ' +
                '<div class="col-xs-6"><div id="icon-img">' +
                '<button id="survey-' + i + '" type="button" class="btn btn-primary btn-circle surveys-click" style="width:100%;"> show</button> </div></div>' +
                '<div class="col-xs-6 survey-info"><h4 style="text-align:center;" class="truncate">' + surveys[i].fullname + '</h4>' +
                '<p style="text-align:center;">Created from: </p>' +
                '<a id="source-' + i + '" class="file-source truncate" style="text-align:center;display:block;">' + surveys[i].originalname + '</a>' +
                '<p style="text-align:center;">' + date.toLocaleString() + '</p>' +
                '</div>' +
                ' </div>');

            var width = $('.tab-content').width() / 2 - 30;
            $('.btn-circle').css("width", width);
            $('.btn-circle').css("height", width);
            $('.btn-circle').css("border-radius", width / 6);
            $('.btn-circle').css("font-size", width / 4);

            var cw = $('.tab-content').width();
            $('.tab-content').css({
                'height': 0.65 * cw + 'px'
            });

        }

        $(window).on('resize', function() {
            var cw = $('.tab-content').width();
            $('.tab-content').css({
                'height': 0.6 * cw + 'px'
            });
            var width = $('.tab-content').width() / 2 - 30;
            $('.btn-circle').css("width", width);
            $('.btn-circle').css("height", width);
            $('.btn-circle').css("border-radius", width / 6);
            $('.btn-circle').css("font-size", width / 4);
        });

    }
}
