var PARA;
var user;
var file;
var remember = true;
var replyUser;

$(document).ready(function(){
  $("#fullscreen").click(function(e){
    var docElm = document.getElementById("pivot_window");
    if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    } else {
        docElm.requestFullscreen();
    }

  });

  var mc = new MainController();
  var lv = new LoginValidator();
  var query = URI.parseQuery(querys);

  /*set up iframe to load SuAVE*/

  var suave_ifr = document.createElement('iframe');
  suave_ifr.id = 'pivot_window';
  suave_ifr.src = '/loading.html?'+querys;
  suave_ifr.style.width="100%";
  suave_ifr.style.height="95%";
  suave_ifr.style.margin="0";
  suave_ifr.style.padding="0";
  suave_ifr.style.border="0";
  suave_ifr.frameborder ='0';
  document.body.appendChild(suave_ifr);
  //$('.embed-responsive').append(suave_ifr);
  $('#pivot_window').addClass('embed-responsive-item');
  /*initialize banner*/

  var aboutTitle;
  var aboutPath = "../surveys/";
  var index = query.file.indexOf("_");
  var id = query.id;

  if(query.id){
    $.ajax({
      url: "/getSnapshotById",
      type: "GET",
      data: {"id" : query.id},
      success: function(data){
        PARA = data;
        if(PARA.string_filters == "None") PARA.string_filters = null;
        if(PARA.num_filters == "None") PARA.num_filters = null;
      },
      error: function(jqXHR){
        console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
      }
    });
  }

  user= query.file.substring(0, index);
  file = query.file.substring(index+1);
  file = file.replace(".csv", "");

  if(query.file.endsWith(".csv")){
    aboutPath = aboutPath + (query.file).replace('.csv', '')+ "about.html";
  }else if(query.file.endsWith(".zip")){
    aboutPath = aboutPath + (query.file).replace('.zip', '')+ "about.html";
  }else if(query.file.endsWith(".cxml")){
    aboutPath = aboutPath + (query.file).replace('.cxml', '')+ "about.html";
  }
  $("#help").attr("onclick", "window.open('"+aboutPath+"','_blank')");
  $("<header>").load(aboutPath + " #about-title", function(){
    //aboutTitle = "About " + $(this).text() + " Survey";
    $('.tagline').text($(this).text());
  });

  $('#modal-loading').modal('toggle');

  $('#rememember-me').click(function(e) {
    var icon = $(this).find('#check-icon');
    if (icon.hasClass('fa-circle-o')){
      icon.addClass('fa-dot-circle-o');
      icon.removeClass('fa-circle-o');
    }	else{
      icon.removeClass('fa-dot-circle-o');
      icon.addClass('fa-circle-o');
    }
  });


  $('#login-form').ajaxForm({
    url: "/login",
    beforeSubmit : function(formData, jqForm, options){
      if (lv.validateForm() == false){
        return false;
      } 	else{
        remember = $('#check-icon').hasClass('fa-dot-circle-o');
      // append 'remember-me' option to formData to write local cookie //
        formData.push({name:'remember-me', value:remember});
        replyUser = formData[0].value;
        return true;
      }
    },
    success	: function(responseText, status, xhr, $form){
      if (status == 'success'){
        $('#login-dialog').modal('toggle');
        mc.checkLogin();
      }
    },
    error : function(e){
      lv.showLoginError('Login Failure', 'Please check your username and/or password');
    }
  });
  $('#user-tf').focus();


  // login retrieval form via email //

    var ev = new EmailValidator();

    $('#get-credentials-form').ajaxForm({
      url: '/lost-password',
      beforeSubmit : function(formData, jqForm, options){
        if (ev.validateEmail($('#email-tf').val())){
          ev.hideEmailAlert();
          return true;
        }	else{
          ev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
          return false;
        }
      },
      success	: function(responseText, status, xhr, $form){
        $('#cancel').html('OK');
        $('#retrieve-password-submit').hide();
        ev.showEmailSuccess("Check your email on how to reset your password.");
      },
      error : function(){
        $('#cancel').html('OK');
        $('#retrieve-password-submit').hide();
        ev.showEmailAlert("Sorry. There was a problem, please try again later.");
      }
    });

});
