
$(document).ready(function(){
  $.ajax({
    url: "/surveysWithAccounts",
    type: "GET",
    success: function(data){
      console.log(data);
      var temp = data.accounts.map(function(account){
        account.surveys = {"public": [], "private": []};
        return account;
      });
      var accounts = {};
      temp.forEach(function(user){
        accounts[user.user] = user;
      })
      var surveys = data.surveys;
      function combFun(accounts, survey) {
        //var account = accounts[survey["user"]];
        if (survey.hidden == 1) {
          accounts[survey.user].surveys.private.push([survey.name, survey.date]);
        } else {
          accounts[survey.user].surveys.public.push([survey.name, survey.date]);
        }
        return accounts;
      }
      var res = surveys.reduce(combFun, accounts);
      var i = 0;
      for (var key in res) {
        i++;
        var acct = res[key];
        $("#info").append(
          "<tr>" +
          "<td>" + i + "</td>" +
          "<td>" + acct.name + "</td>" +
          "<td>" + acct.user + "</td>" +
          "<td>" + acct.email + "</td>" +
          "<td>" + acct.date + "</td>" +
          "<td id='private-"+ i +"'> count: " + acct.surveys.private.length + "</td>"+
          "<td id='public-"+ i +"'> count: " + acct.surveys.public.length + "</td>" +
          "</tr>"
        );

        for(var j = 0; j < acct.surveys.public.length; j++) {
          $("#public-" + i).append('<tr><td>'+ acct.user + "_" +acct.surveys.public[j][0]+'.csv</td><td>' + acct.surveys.public[j][1] + ' </td></tr>');
        }
        for(var j = 0; j < acct.surveys.private.length; j++) {
          $("#private-" + i).append('<tr><td>'+ acct.user + "_" + acct.surveys.private[j][0] +'.csv</td><td>' + acct.surveys.private[j][1] + ' </td></tr>');
        }
      }

      $("th").css("border","1px solid black")
      $("td").css("border","1px solid black")
    },
    error: function(jqXHR){
      console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
    }
  });
});
