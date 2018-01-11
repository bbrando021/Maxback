//Using jQuery: Get the button, determine if its been clicked, 
//using Ajax: if so, send the message to server

var concat = '';
var first = 1;

$(document).ready(function() {

    $("#close").click(function() {
        $("#prechatButton").show();
        $("#chatDiv").hide();
    });

    $("#prechatButton").click(function() {
        $("#prechatButton").hide();
        $("#chatDiv").show();
    });

    $("#chatText").keyup(function(event) {
        if (event.keyCode === 13) {
            $("#submitButton").click();
        }
    });


    $("#submitButton").click(function() {

        $('#submitButton').html("Sent")
        //Get textbox value
        var chatMessage = $('#chatText').val()
        //alert(chatMessage);
        //Send data to server
        $.post("/incomingMessage", {
                message: chatMessage
            }, function(data) {
                if (first == 0) {
                    concat = concat + '\n' + chatMessage + '\n' + data;
                }
                else {
                    first = 0;
                    concat = chatMessage + '\n' + data;
                }
                $('#chatArea').val(concat)
                $('#submitButton').html("Send")
                $('#chatText').val('');
                //alert(data)
            })
            .done(function() {
                //when done do something
            })
            .fail(function() {
                alert("post request failed");
            })
            .always(function() {
                //always do something
            });
    });




});
