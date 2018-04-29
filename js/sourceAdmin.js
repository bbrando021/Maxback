//-------------------------------------ON READY----------------------------------------//
$(document).ready(function() {

    var device = 0;
    var convo = 0;
    var stat = 0;
    var query = '';

    $('#search').keypress(function(event) {
        if (event.keyCode == 13) {
            query = document.getElementById('search').value;
            queryDB();
            event.preventDefault();
        }
    });

    function queryDB() {
        if (stat) {
            $.post("/chatStats", {
                    message: query,
                }, function(data) {
                    //alert(JSON.stringify(data));
                    populateTable(["Times Accessed", "Number of Quotes", "Uncaught Errors"], data);
                })
                .done(function() {})
                .fail(function() {})
                .always(function() {});
        }
        else if (convo) {
            $.post("/conversations", {
                    message: query,
                }, function(data) {
                    populateTable(["Date", "User Message", "Bot Response"], data);
                })
                .done(function() {})
                .fail(function() {})
                .always(function() {});
        }
        else if (device) {
            var type;
            if (document.getElementById('keyword').checked) {
                type = 'keyword';
            }
            else if (document.getElementById('price').checked) {
                type = 'price';
            }
            $.post("/devicesQuoted", {
                    type: type,
                    message: query
                }, function(data) {
                    populateTable(["Device", "Condition", "Quote"], data);
                })
                .done(function() {})
                .fail(function() {})
                .always(function() {});
        }
    }


    $("#search").focus(function() {
        document.getElementById('display').style.width = '280px';
        document.getElementById('search').placeholder = '   Press \'enter\' to search';
        if (device) {
            $("#radio").show(400);
        }

    });
    $("#search").focusout(function() {
        document.getElementById('display').style.width = '140px';
        document.getElementById('search').placeholder = 'Search...';
    });

    $("#devicesQuoted").click(function() {
        $("#display").show();
        document.getElementById('search').value = '';
        device = 1;
        convo = 0;
        stat = 0;
        $("#search").focus();
    });
    $("#conversations").click(function() {
        $("#display").show();
        document.getElementById('search').value = '';
        device = 0;
        convo = 1;
        stat = 0;
        $("#search").focus();
        $("#radio").hide(400);
    });
    $("#chatStats").click(function() {
        $("#display").hide();
        device = 0;
        convo = 0;
        stat = 1;
        queryDB();
        $("#radio").hide(400);
    });



    function populateTable(fields, data) {
        //remove all fields currently in table
        var myNode = document.getElementById("tableFields");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        var myNode = document.getElementById("tableBody");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }


        //add the table headers to the table head
        for (x in fields) {
            $('#tableFields').append($('<th />', { text: fields[x] }));
        }

        //input data
        var done = 0;
        for (y in data) {

            var tr = document.createElement("tr");
            //tr.className = 'w3-table-all w3-hoverable';
            var td1 = tr.appendChild(document.createElement('td'));
            var td2 = tr.appendChild(document.createElement('td'));
            var td3 = tr.appendChild(document.createElement('td'));
            if (device) {
                td1.innerHTML = data[y].device;
                td2.innerHTML = data[y].condition;
                td3.innerHTML = "$" + data[y].quote;
            }
            else if (convo) {
                td1.innerHTML = data[y].date_accessed;
                td2.innerHTML = data[y].user_Message;
                td3.innerHTML = data[y].bot_Response;
            }
            else if (stat && done == 0) {
                td1.innerHTML = data.times_accessed;
                td2.innerHTML = data.num_of_quotes;
                td3.innerHTML = data.uncaught_errors_in_watson;
                done = 1;
            }
            var table = document.getElementById("tableBody");
            table.appendChild(tr);
            if (done) return;

        }

    }

});
