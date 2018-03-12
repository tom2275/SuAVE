var snapshotPara;
var views;
var comments;
var remember = true;
var user;

$(document).ready(function(){
	var sc = new SnapshotController();
	var lv = new LoginValidator();

  var hrefArray = location.href.split('/');

  sc.getSnapshotPara(hrefArray[4]);

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
			// append 'remember-me' option to formData to write local cookie //
				remember = $('#check-icon').hasClass('fa-dot-circle-o');
				formData.push({name:'remember-me', value: remember});
				user = formData[0].value;
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success'){
				$("#login-dialog").modal("toggle");
				sc.checkLogin();
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
