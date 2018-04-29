var serverFirstUse = 0;
var serverContextCoversation;
var serverResponseMessage;
var first = 0;
var fontSize;
var colorTheme;
var canResize;
//-------------------------------------ON READY----------------------------------------//
$(document).ready(function() {




    //var first = 0;

    var conversation = [];
    var conversationTimes = [];
    var dontShowHumanName = 0;
    var dontShowBotName = 0;
    //var canResize = 0;
    //var fontSize = 12;
    //var colorTheme = 0;

    //if the window gets too small, dont display the chatbot
    var screenTooSmall = 0;
    $(window).resize(function() {
        if (!(/Mobi/i.test(navigator.userAgent) || /Android/i.test(navigator.userAgent))) {
            if (($(window).width() < 600 || $(window).height() < 500)) {
                screenTooSmall = 1;
                $('#chatBot').hide();
            }
            else if (screenTooSmall == 1 && $(window).width() >= 600 && $(window).height() >= 500) {
                screenTooSmall = 0;
                $('#chatBot').show();

            }
        }
    });

    //changes the theme to dark or light
    $('#changeTheme').click(function(event) {
        //change to dark
        //alert(colorTheme);
        if (colorTheme == 0) {
            colorTheme = 1;
            document.getElementById("tooltip3").innerHTML = 'Light Theme';
            document.getElementById("changeTheme").style.backgroundColor = "#e8e8e8";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightDark.png')";
            document.getElementById("chatDiv").style.backgroundColor = "#2d2d2d";
            document.getElementById("windowTitleText").style.color = "#2d2d2d";
            document.getElementById("minimize").style.color = "#2d2d2d";
            document.getElementById("close").style.color = "#2d2d2d";
            document.getElementById("magnify").style.color = "#2d2d2d";
            document.getElementById("contract").style.color = "#2d2d2d";
            document.getElementById("chatText").style.backgroundColor = "#161616";
            document.getElementById("chatText").style.color = "#e8e8e8";
            colorChatBubbles('#344416');

            //"#344416"
            $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);
        }
        //change to light
        else {
            colorTheme = 0;
            document.getElementById("tooltip3").innerHTML = 'Dark Theme';
            document.getElementById("changeTheme").style.backgroundColor = "#2d2d2d";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightLight.png')";
            document.getElementById("chatDiv").style.backgroundColor = "#e8e8e8";
            document.getElementById("windowTitleText").style.color = "white";
            document.getElementById("minimize").style.color = "white";
            document.getElementById("close").style.color = "white";
            document.getElementById("magnify").style.color = "white";
            document.getElementById("contract").style.color = "white";
            document.getElementById("chatText").style.backgroundColor = "#ffffff";
            document.getElementById("chatText").style.color = "black";
            colorChatBubbles('#ffffff');
            $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);
        }
    });

    function colorChatBubbles(color) {
        var childs = document.getElementById("chatWindow").children.length;
        var bubbles = document.getElementById("chatWindow").children;
        //alert(childs);
        for (var i = 0; i < childs; i++) {
            //alert(bubbles[i].children.length);
            var bubbleChild = bubbles[i].children;
            bubbleChild[1].style.backgroundColor = color;
        }
    }



    //hover properties
    $('#changeTheme').hover(function() {
        if (colorTheme) {
            document.getElementById("changeTheme").style.backgroundColor = "#2d2d2d";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightLight.png')";
        }
        else {
            document.getElementById("changeTheme").style.backgroundColor = "#e8e8e8";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightDark.png')";
        }
    }, function() {
        if (colorTheme) {
            document.getElementById("changeTheme").style.backgroundColor = "#e8e8e8";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightDark.png')";
        }
        else {
            document.getElementById("changeTheme").style.backgroundColor = "#2d2d2d";
            document.getElementById("changeTheme").style.backgroundImage = "url('lightLight.png')";
        }
    });



    //magnify or reduce the text size
    $('#magnify').click(function(event) {
        if (fontSize > 16 || fontSize < 10) { return; }


        fontSize = parseInt(fontSize) + 2;
        $("#chatWindow").css({ 'font-size': fontSize });
        canResize++;
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);
    });
    $('#contract').click(function(event) {
        if (fontSize > 18 || fontSize <= 10) { return; }

        fontSize = parseInt(fontSize) - 2;
        $("#chatWindow").css({ 'font-size': fontSize });
        canResize--;
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);

    });


    // if the user clicks enter on the input area, we dont want to go to new line
    //then send request to server
    $('#chatText').keypress(function(event) {
        if (event.keyCode == 13) {
            sendMessage();
            event.preventDefault();
        }
    });


    //If the user hovers over the prechat button show new text
    $('#prechatButton').hover(function() {
        $('#prechatButton').text('Lets Chat!');
    }, function() {
        $('#prechatButton').text('Hi, I\'m Max!');
    });


    //Clicking the minimize button on the chat box
    $("#minimize").click(function() {
        $("#chatDiv").hide(400);
        $("#prechatButton").show(400);
        first = 1;
    });

    //clicking the close button on the chat
    $('#close').click(function() {
        //resetting the conversation variables
        conversation = [];
        conversationTimes = [];
        first = 0;
        count = 0;
        serverFirstUse = 0;
        //minimizing display and resetting minimize button
        $('#chatText').val('');
        $('#minimize').css('left', '87%');
        $('#close').hide();
        $("#chatDiv").hide(400);
        $("#prechatButton").show(400);

        //post request to tell server it wants to end chat conversation
        //NOT NEEDED CAN REMOVE
        $.post("/endConversation", {
                message: 1,
            }, function(data) {
                $('#chatWindow').empty();
                serverContextCoversation = {};
            })
            .done(function() {})
            .fail(function() {})
            .always(function() {
                $('#chatWindow').empty();
                serverContextCoversation = {};
            });

    });

    //For UAT, type message and click submit
    $("#UATPic").click(function() {
        var UATMessage = $('textarea#UATSubmit').val();
        console.log(UATMessage)
        if (UATMessage != ''){
            $.post("/UAT", {
                message: UATMessage,
                conversation: serverContextCoversation.conversation_id,
                colorTheme: colorTheme,
                fontSize: fontSize
            }, function(data) {
                 $('#UATSubmit').val('');
            })
            .done(function() {})
            .fail(function() {})
            .always(function() {});
        }
    })


    //To load the chatbot
    $("#picture").click(function() {
        $("#prechatButton").click();
    })
    $("#prechatButton").click(function() {
        $("#prechatButton").hide(300);
        $("#chatDiv").show(300);
        $('#chatText').focus();
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);

        //if first use, then get the greetings message and conversation object from watson
        if (first == 0) {
            first = 1;
            $.post("/startConversation", {
                    message: 1,
                }, function(data) {
                    $('#chatWindow').empty();
                    dontShowHumanName = 0;
                    createBox(data.message, "MAX", 1);
                    dontShowBotName = 1;
                    serverContextCoversation = data.contextConversation;
                    serverFirstUse = 0;
                })
                .done(function() {})
                .fail(function() {})
                .always(function() {});
        }
    });


    //TEST a new page functionality
    // $("#nextPage").click(function() {
    //     try { document.location.href = "https://maxback-chatbot-bbrando0211.c9users.io/ExtraPage"; }
    //     catch (e) { window.location = "https://maxback-chatbot-bbrando0211.c9users.io/ExtraPage"; }
    // });



    //will run before page is closed. This saves the state of the conversation and html.
    window.onbeforeunload = function() {
        try {
            lastAccessed = new Date();
            var divtosave = $("#body").html();
            window.sessionStorage.setItem('saveddiv', divtosave);
            window.sessionStorage.setItem('conversation_id', JSON.stringify(serverContextCoversation));
            window.sessionStorage.setItem('firstUse', serverFirstUse);
            window.sessionStorage.setItem('first', first);
            window.sessionStorage.setItem('canResize', canResize);
            window.sessionStorage.setItem('colorTheme', colorTheme);
            window.sessionStorage.setItem('fontSize', fontSize);
        }
        catch (e) {}
    };




    // -------------------------------------Send message to server----------------------------------------//
    //send a message using click
    function sendMessage() {
        //Get textbox value
        var chatMessage = $('textarea#chatText').val();
        //Send data to server
        if (chatMessage != "") {
            $('#chatText').val('');
            dontShowBotName = 0;
            createBox(chatMessage, "USER", 1);
            dontShowHumanName = 1;

            //if its the start of conversation, now show exit button
            if (first == 1) {
                $('#close').show();
                $('#minimize').css('left', '76%');
                first = 2;
            }
            //post request to send message
            $.post("/incomingMessage", {
                    message: chatMessage,
                    contextConversation: JSON.stringify(serverContextCoversation),
                    firstUse: serverFirstUse
                }, function(data) {
                    serverContextCoversation = data.contextConversation;
                    serverFirstUse = data.firstUse;
                    var botResponse = data.message;
                    //add the bots response and time to the arrays
                    conversation.push(botResponse);
                    conversationTimes.push(new Date());
                    setTimeout(
                        function() {
                            dontShowHumanName = 0;
                            createBox(botResponse, "MAX", 0);
                            dontShowBotName = 1;
                        }, 700
                    );
                })
                .done(function() {
                    //when done do something
                })
                .fail(function() {
                    // alert("post request failed");
                })
                .always(function() {
                    //always do something
                });
        }
    }



    //create the boxes for the message center
    var count = 0;
    var count1 = 0;
    var bigDiv;

    function createBox(message, username, humanTurn) {

        //get time information.
        var time = new Date();
        var dispTime;
        var past = 'AM';
        if (time.getHours() >= 12) {
            past = "PM";
            dispTime = time.getHours() - 12;
        }
        else {
            dispTime = time.getHours();
        }
        dispTime += ":" + time.getMinutes() + past;

        var span = document.createElement('SPAN')
        span.innerHTML = dispTime.toString();
        span.style.color = "#969696";
        span.style.left = '67%';
        span.style.top = '0%';
        span.style.visibility = 'hidden';
        span.style.width = '70px';
        span.style.position = 'absolute';


        //SET THE USERNAME
        var para = document.createElement("p");
        para.innerHTML = username;
        para.style.color = "#969696";
        para.style.left = '10%';
        para.style.top = '0%';
        para.style.position = 'relative';

        para.append(span);

        //SET THE CHAT MESSAGE
        var div = document.createElement("div");
        div.style.left = '3.5%';
        div.style.top = '-7px';
        div.style.position = "relative";
        div.style.borderRadius = '10px';
        div.style.display = "inline-block";
        div.style.padding = "7px 10px 7px 10px";
        div.style.background = (colorTheme ? "#344416" : "#ffffff");
        div.style.color = "black";
        div.style.maxWidth = '210px';
        //div.style.backgroundImage = "-webkit-linear-gradient(top, #333333, #494949)";
        //div.style.background = "#494949";



        //CHECK TO SEE IF LINK TO CHECKOUT IS HERE will be set in server by '~' flag
        if (message.includes('~')) {
            var regularAndLink = message.split('~');
            message = regularAndLink[0];

            var aTag = document.createElement('a');
            aTag.setAttribute('href', regularAndLink[1]);
            aTag.innerHTML = "HERE";
            aTag.style.color = '#70952e';
            aTag.style.fontWeight = 'bold';

            div.innerHTML = message + "<br><br>To checkout click ";
            div.append(aTag);
        }
        //NO LINK, JUST APPEND ALL TO DIV
        else {
            div.innerHTML = message;
        }

        bigDiv = document.createElement("div");
        bigDiv.style.position = "relative";
        count -= 3;

        //if its the humans chat, display their name, if the bot hasnt reponded yet, post new message but no name
        //same for chatbot
        if ((!dontShowBotName && !humanTurn) || (!dontShowHumanName && humanTurn)) {
            bigDiv.append(para);
            bigDiv.append(div);
            bigDiv.onmouseover = function() { span.style.visibility = 'visible' };
            bigDiv.onmouseout = function() { span.style.visibility = 'hidden' };
            document.getElementById("chatWindow").appendChild(bigDiv);
        }
        else {
            bigDiv.append(div);
            bigDiv.onmouseover = function() { span.style.visibility = 'visible' };
            bigDiv.onmouseout = function() { span.style.visibility = 'hidden' };
            document.getElementById("chatWindow").appendChild(bigDiv);
        }

        //scroll to the bottom of the chat window automatically
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);

    }



});


//when loading the page, check to see if the user has prevously interacted with the bot. If so, return the state of everything.
window.onload = function() {

    if ('saveddiv' in window.sessionStorage) {
        $("#body").html(window.sessionStorage.getItem('saveddiv'));
        $("#chatWindow").scrollTop($("#chatWindow")[0].scrollHeight);
        $('#chatText').focus();

    };
    if ('conversation_id' in window.sessionStorage) {
        try {
            serverContextCoversation = JSON.parse(window.sessionStorage.getItem('conversation_id'));
        }
        catch (error) {
            serverContextCoversation = {};
        }
        serverFirstUse = parseInt(window.sessionStorage.getItem('firstUse'));
    }
    else {
        serverContextCoversation = {};
        serverFirstUse = 0;
    }
    if ('first' in window.sessionStorage) {
        first = parseInt(window.sessionStorage.getItem('first'));
    }
    if ('fontSize' in window.sessionStorage) {
        fontSize = window.sessionStorage.getItem('fontSize');
    }
    else fontSize = 12;
    if ('colorTheme' in window.sessionStorage) {
        colorTheme = parseInt(window.sessionStorage.getItem('colorTheme'));
    }
    else colorTheme = 0;
    if ('canResize' in window.sessionStorage) {
        canResize = window.sessionStorage.getItem('canResize');
    }
    else canResize = 0;

    window.sessionStorage.clear();
};
