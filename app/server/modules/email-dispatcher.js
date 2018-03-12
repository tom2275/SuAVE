var EM = {};
module.exports = EM;

EM.server = require("emailjs/email").server.connect({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    user: process.env.EMAIL_USER || 'spatialsuave@gmail.com',
    password: process.env.EMAIL_PASS || '2spatial',
    ssl: true
});

EM.dispatchResetPasswordLink = function(account, callback) {
    EM.server.send({
        from: process.env.EMAIL_FROM || 'SuAVE <do-not-reply@gmail.com>',
        to: account.email,
        subject: 'Password Reset',
        text: 'something went wrong... :(',
        attachment: EM.composeEmail(account)
    }, callback);
}

EM.composeEmail = function(o) {
    var link = 'http://suave-dev.sdsc.edu/reset-password?e=' + o.email + '&p=' + o.pass;
    var html = "<html><body>";
    html += "Hi " + o.name + ",<br><br>";
    html += "Your username is <b>" + o.user + "</b><br><br>";
    html += "<a href='" + link + "'>Click here to reset your password</a><br><br>";
    html += "Cheers,<br><br>";
    html += "</body></html>";
    return [{
        data: html,
        alternative: true
    }];
}

EM.sendMessage = function(data, callback) {
    var html = "<html><body>";
    html += "Hi,<br><br>";
    html += "<b>" + data.name + " (" + data.email + ") says: </b><br><br>";
    html += "<p>" + data.message + "</p><br><br>";
    html += "Cheers<br><br>";
    html += "</body></html>";

    EM.server.send({
        from: process.env.EMAIL_FROM || 'SuAVE <do-not-reply@gmail.com>',
        to: data.user_email,
        subject: 'Message from ' + data.name,
        text: 'something went wrong... :(',
        attachment: [{
            data: html,
            alternative: true
        }]
    }, callback);
}

EM.sendWelcomeMessage = function(data, callback) {
    var message =
        '<html><body>' +
        '<p>Dear ' + data.name + ',</p>'　 +
        '<p>Thank you for creating a SuAVE account. Here are some resources to help you get started:</p>' +
        '<p>1) Publishing your datasets in SuAVE is straightforward. Once you login, click “New Survey”, enter a survey title, and point to a CSV file with the data. You can also customize the look and feel of the survey and add survey metadata – see a step-by-step guide at http://suave.sdsc.edu/tutorials/</p>' +
        '<p>2) There is a large number of SuAVE applications under http://suave.sdsc.edu/gallery/ and http://suave.sdsc.edu/news/. Click “About Survey” on any application to learn more.</p>' +
        '<p>3) You can illustrate your research with pointers to saved SuAVE views, using “Comment” and “Share” functions. As a result, readers will be able to reproduce your analysis, opening SuAVE at annotation points and tracing your steps, or take analysis in other directions. See an example at http://suave.sdsc.edu/blog/</p>' +
        '<p>Please don’t hesitate to email us with any questions about SuAVE. We’ll be happy to help. SuAVE project news are at http://suave.sdsc.edu/news. In addition to the current production version (suave-stage.sdsc.edu) you are also welcome to create an account on the development version (suave-dev.sdsc.edu), should you want to experiment with new features. </p>' +
        '<p>Your feedback and suggestions are always welcome.</p>' +
        '<p>Thank you,</p>' +
        '<p>- Ilya Zaslavsky, on behalf of the SuAVE team</p>' +
        '</body></html>';

		var html = "<html><body>";
		html += "Hi,<br><br>";
		html += "<b>" + data.name + " (" + data.email + ") has been created </b><br><br>";
		html += "Cheers<br><br>";
		html += "</body></html>";

    EM.server.send({
        from: process.env.EMAIL_FROM || 'SuAVE <do-not-reply@gmail.com>',
        to: '	izaslavsky@ucsd.edu',
        subject: 'A new account has been created',
        text: 'something went wrong... :(',
        attachment: [{
            data: html,
            alternative: true
        }]
    });

    EM.server.send({
        from: process.env.EMAIL_FROM || 'SuAVE <do-not-reply@gmail.com>',
        to: data.email,
        subject: 'Thanks for creating a SuAVE account',
        text: 'something went wrong... :(',
        attachment: [{
            data: message,
            alternative: true
        }]
    }, callback);

}
