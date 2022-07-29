var URL = "data/data.json";

$(function(){
    loadData(function(data){
        populate($('table'), data);
    });
});

function loadData(done){
  //  $.ajax({ url: URL, type: "GET", contentType: "application/json" })
  //      .done(done)
  //      .error(function(data, errorThrown){
  //          console.log('Data loading failed: '+errorThrown);
  //      });

done(window.DATA);
}

function populate(table, data){
    table.hide();
    table.html("");
    table.append('<tr class="title"><th>Class name</th> <th>Value</th> <th>Grade (A-F)</th> <th>Tries (3 max)</th></tr>');
    var i;
    var total = 0;
    for(i = 0; i < data['semesters'].length; i++){
        var j;
        var num = "th";
        if(i == 0) num = "st";
        if(i == 1) num = "nd";
        if(i == 2) num = "rd";
        var s = data['semesters'][i];
        table.append('<tr class="year"><td><b>' + (i+1) + num + ' Year ' + s['year'] + '</b></td><td></td><td></td><td></td></tr>');
        table.append('<tr class="winter main"><td>Winter</td><td></td><td></td><td></td><</tr>');
        var winter = 0;
        var summer = 0;
        for(j = 0; j < s['winter'].length; j++){
            var c = s['winter'][j];
            table.append('<tr class="winter"><td><a href="https://sluzby.fmph.uniba.sk/infolist/EN/'+c['id']+'.html">' + c['name'] + '</a></td><td>' + c['value'] + '</td><td>' + c['grade'] + '</td><td>' + c['tries'] + '</td></tr>');
            winter += c['value'];
        }
        table.append('<tr class="summer main"><td>Summer</td><td></td><td></td><td></td></tr>');
        for(j = 0; j < s['summer'].length; j++){
            var c = s['summer'][j];
            table.append('<tr class="summer"><td><a href="https://sluzby.fmph.uniba.sk/infolist/EN/'+c['id']+'.html">' + c['name'] + '</a></td><td>' + c['value'] + '</td><td>' + c['grade'] + '</td><td>' + c['tries'] + '</td></tr>');
            summer += c['value'];
        }
        table.append('<tr class="total"><td></td><td>' + (summer + winter) + ' (' + winter + '+' + summer + ')' + '</td><td></td><td></td></tr>');
        total += summer + winter;
    }
    table.append('<tr class="total"><td><b>Total</b></td><td>' + total + '</td><td></td><td></td></tr>');
    table.append('<tr class="finals main"><td><b>Finals</b></td><td></td><td></td><td></td></tr>')
    for(i = 0; i < data['finals'].length; i++){
        var f = data['finals'][i];
        table.append('<tr class="finals"><td>' + f['name'] + '</td><td></td><td>' + f['grade'] + '</td><td></td></tr>')
    }
    table.fadeIn();
}