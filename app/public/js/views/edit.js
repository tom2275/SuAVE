$(document).ready(function(){
	var ec = new EditController();
  $('.navbar-brand').append(' ' + name);
  // handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });
	$('#btn-update').click(function(){ window.open('/update', "_self"); });
});
