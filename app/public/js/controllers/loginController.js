
function LoginController()
{
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
}
