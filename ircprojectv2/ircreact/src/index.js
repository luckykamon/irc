import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from "./App";
import Onglets from './Onglets';
import Messages from './Messages';
import Channels from './Channels';
import Form from './Form';
import Nav from './Nav';
import './App.css';


import socketIOClient from "socket.io-client";

const ENDPOINT = "localhost:4000";
const connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout": 10000,                  //before connect_error and connect_timeout are emitted.
    "transports": ["websocket"]
};
const socket = socketIOClient(ENDPOINT, connectionOptions);
let darkTheme = true;
let lucasCreated = false;
let clickLucasCount = 0;


ReactDOM.render(
    <React.StrictMode>
        <Nav/>
    </React.StrictMode>,
    document.getElementById('Nav')
);
ReactDOM.render(
    <React.StrictMode>
        <Onglets/>
    </React.StrictMode>,
    document.getElementById('onglets')
);
ReactDOM.render(
    <React.StrictMode>
        <Channels/>
    </React.StrictMode>,
    document.getElementById('channels')
);
ReactDOM.render(
    <React.StrictMode>
        <Messages/>
    </React.StrictMode>,
    document.getElementById('messages')
);
ReactDOM.render(
    <React.StrictMode>
        <Form/>
    </React.StrictMode>,
    document.getElementById('form')
);

let currentChannel = "general";

function LightTheme() {
    console.log("bouton Light Theme cliqué");
    document.body.style.backgroundColor = "lavender";
    document.getElementById("App-header").style.color = "black";
    document.getElementById("ReactChannels").style.color = "black";
    document.getElementById("messagesContainer").style.color = "black";
    document.getElementById("messagesContainer").style.backgroundColor = "aliceblue";
    document.getElementById("inputSendMessage").style.backgroundColor = "aliceblue";
    document.getElementById("inputSendMessage").style.color = "black";
    document.getElementById("channels").style.backgroundColor = "aliceblue";
    document.getElementById("listChannel").style.color = "black";
    document.getElementById("buttonTheme").style.backgroundColor = "aliceblue";
    document.getElementById("buttonTheme").innerHTML = "Switch to Dark Theme";
    // document.getElementById("buttonLucas").style.backgroundColor = "aliceblue";
    let divLucas = document.getElementById("divLucas");
    while (divLucas.lastElementChild){
        divLucas.removeChild(divLucas.lastElementChild);
    }
    let titre = document.getElementById("titre");
    titre.innerHTML = "Welcome to IRC";
    darkTheme = false;
    lucasCreated = false;
    clickLucasCount = 0;
}

function DarkTheme() {
    console.log("bouton Dark Theme cliqué");
    document.body.style.backgroundColor = "#282c34";
    document.getElementById("App-header").style.color = "white";
    document.getElementById("ReactChannels").style.color = "white";
    document.getElementById("messagesContainer").style.color = "white";
    document.getElementById("messagesContainer").style.backgroundColor = "#44424e";
    document.getElementById("inputSendMessage").style.backgroundColor = "lightsteelblue";
    document.getElementById("inputSendMessage").style.color = "black";
    document.getElementById("channels").style.backgroundColor = "#606c9a";
    document.getElementById("listChannel").style.color = "white";
    document.getElementById("buttonTheme").style.backgroundColor = "#606c9a";
    document.getElementById("buttonTheme").innerHTML = "Switch to Light Theme";
    // document.getElementById("buttonLucas").style.backgroundColor = "#606c9a";
    let divLucas = document.getElementById("divLucas");
    while (divLucas.lastElementChild){
        divLucas.removeChild(divLucas.lastElementChild);
    }
    let titre = document.getElementById("titre");
    titre.innerHTML = "Welcome to IRC";
    darkTheme = true;
    lucasCreated = false;
    clickLucasCount = 0;
}

function LucasTheme() {
    let imgLucas = document.createElement("img")
    imgLucas.src = "https://image.noelshack.com/fichiers/2021/04/2/1611657742-lucasiimg.jpg"
    imgLucas.id = "Lucas"
    let divLucas = document.getElementById("divLucas")
    let titre = document.getElementById("titre");
    if (lucasCreated == false) {
        divLucas.appendChild(imgLucas);
        titre.innerHTML = "Welcome to Hell!";
    }
    lucasCreated = true;


    document.body.style.backgroundColor = "darkred";
    document.getElementById("App-header").style.color = "white";
    document.getElementById("ReactChannels").style.color = "white";
    document.getElementById("messagesContainer").style.color = "white";
    document.getElementById("messagesContainer").style.backgroundColor = "black";
    document.getElementById("inputSendMessage").style.backgroundColor = "darkred";
    document.getElementById("inputSendMessage").style.color = "white";
    document.getElementById("channels").style.backgroundColor = "black";
    document.getElementById("listChannel").style.color = "white";
    document.getElementById("buttonTheme").style.backgroundColor = "black";
    // document.getElementById("buttonLucas").style.backgroundColor = "black";

}

document.getElementById("titre").onclick = function () {
    clickLucasCount ++;
    if (clickLucasCount > 2) LucasTheme();
}

document.getElementById("buttonTheme").onclick = function () {
    if (darkTheme) LightTheme();
    else DarkTheme();
};

// document.getElementById("buttonLucas").onclick = function () {
//     LucasTheme();
// };


document.getElementById("buttonSendMessage").onclick = function () {
    let message = document.getElementById("inputSendMessage");
    socket.emit('commands', message.value, currentChannel);
    document.getElementById("inputSendMessage").value = "";
}

document.getElementById("inputSendMessage").addEventListener("keyup", function (event) {

    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("buttonSendMessage").click();
    }
});


//data a 5 éléments: channel, date, message, nickname (il faut vérifier qu'il existe), user
function newMessage(data) {
    const newDiv = document.createElement("p");
    const dateObject = new Date(data['date'])
    const humanDateFormat = dateObject.toLocaleString()
    let newContent;
    if (data['nickname'] !== undefined) {
        newContent = document.createTextNode(data['nickname'] + ' (' + humanDateFormat + ') : ' + data['message']);
    } else {
        newContent = document.createTextNode(data['user'] + ' (' + humanDateFormat + ') : ' + data['message']);
    }
    newDiv.appendChild(newContent);
    const currentDiv = document.getElementById('div1');
    document.getElementById("currentChannelMessage").insertBefore(newDiv, currentDiv);
}

function newMessageString(msg, colors = "#FFFFFF", type = "p") {
    const newDiv = document.createElement(type);
    newDiv.style.color = colors;
    const newContent = document.createTextNode(msg);
    newDiv.appendChild(newContent);
    newDiv.appendChild(document.createElement("br"));
    const currentDiv = document.getElementById('div1');
    document.getElementById("currentChannelMessage").insertBefore(newDiv, currentDiv);
}


socket.on('messageChannel', function (data) {
    for (let i = 0; i < data.length; i++) {
        newMessage(data[i]);
    }
})

socket.on('newMessageChannel', function (data) {
    if (data['channel'] == currentChannel) {
        newMessage(data);
    }
})

socket.on('listUserOnChannel', function (listeUserOnChannel, nameChannel, colors = "#0D1762") {
    let stringListUser = "";
    for (let i = 0; i < listeUserOnChannel.length - 1; i++) {
        stringListUser += listeUserOnChannel[i] + ", ";
    }
    if (listeUserOnChannel.length > 0) {
        stringListUser += listeUserOnChannel[listeUserOnChannel.length - 1];
    }
    const newDiv = document.createElement("b");
    newDiv.style.color = colors;
    const newContent = document.createTextNode("Les utilisateurs connectés au channel " + nameChannel + " sont : " + stringListUser);
    newDiv.appendChild(newContent);
    const currentDiv = document.getElementById('div1');
    document.getElementById("currentChannelMessage").insertBefore(newDiv,currentDiv);
});


socket.on('privateMessage', function (msg, nickname, colors = "#56DFDC") {
    const dateObject = new Date();
    const humanDateFormat = dateObject.toLocaleString();
    const newDiv = document.createElement("p");
    newDiv.style.color = colors;
    const newContent = document.createTextNode(nickname + " (" + humanDateFormat + ") : " + msg);
    newDiv.appendChild(newContent);
    const currentDiv = document.getElementById('div1');
    document.getElementById("currentChannelMessage").insertBefore(newDiv, currentDiv);
})

socket.on('list', function (list) {
    let liste = "";
    for (let i = 0; i < list.length; i++) {
        liste += "<p> "+ list[i] + "</p> ";
    }
    document.getElementById("listChannel").innerHTML = liste;
});

socket.on('joinChannel', function (nameChannel){
    const newDiv = document.createElement("button");
    const attr = document.createAttribute("class");       // Create a "class" attribute
    attr.value = "btn btn-primary";                           // Set the value of the class attribute
    newDiv.setAttributeNode(attr);
    const newContent = document.createTextNode(nameChannel);
    newDiv.appendChild(newContent);
    newDiv.id = nameChannel;
    const currentDiv = document.getElementById('div1');
    document.getElementById("ongletToolBar").insertBefore(newDiv,currentDiv);

    const onglets = document.getElementById("ongletToolBar").children;
    for (let i = 0; i < onglets.length; i++) {
        onglets[i].onclick = function () {
            const idOnglet = this.getAttribute("id");
            console.log(idOnglet);
            while (document.getElementById("currentChannelMessage").children.length !== 0) {
                document.getElementById("currentChannelMessage").removeChild(document.getElementById("currentChannelMessage").lastChild);
            }
            currentChannel = idOnglet;
            socket.emit("messageChannel", idOnglet);
            //fonction qui affiche les messages du channel idOnglet dans la div #messages
        };
    }
});

socket.on('deleteChannel', function (nameChannel){
    if(document.getElementById(nameChannel)){
        document.getElementById(nameChannel).remove();
        socket.emit("commands", "/list");
        console.log("ok!")
    }
});
socket.on('creationChannel', function (){
    socket.emit("commands", "/list");
});
socket.on('quitChannel', function(nameChannel){
    if(document.getElementById(nameChannel)){
        document.getElementById(nameChannel).remove();
        socket.emit("commands", "/list");
        console.log("ok!")
    }
});
socket.on('help', function (){
    let listeCommande = "<p id='help'>/nick <i>pseudo</i> : Définit ton pseudo.<br>" +
        "/list <i>(filtre)</i> : Donne la liste des channels disponibles correspondant au filtre <i>(optionnel)</i>. <br>" +
        "/create <i>channel</i> : Créé un channel avec le nom donné. <br>" +
        "/delete <i>channel</i> : Supprime le channel correspondant.<br>" +
        "/join <i>channel</i> : Rejoint le channel correspondant.<br>" +
        "/quit <i>channel</i> : Quitte le channel correspondant.<br>" +
        "/users <i>channel</i> : Donne la liste des utilisateurs connectés au channel correspondant.<br>" +
        "/msg <i>pseudo message</i> : Envoie un message privé à l'utilisateur correspondant." +
        "</p>";
    document.getElementById("currentChannelMessage").insertAdjacentHTML("beforeend", listeCommande);
});
/**
 * En cas d'erreur (j'avais pensé à une sorte de pop up qui s'affiche pendant 2-3 sec)
 * @param msg D'où vient le problème
 */
socket.on('erreur', function (msg) {
    const dateObject = new Date()
    const humanDateFormat = dateObject.toLocaleString()
    newMessageString("Erreur" + " (" + humanDateFormat + "): " + msg, "#6A0906", "b");
    console.log(msg);
})

/**
 * En cas de success (j'avais pensé à une sorte de pop up qui s'affiche pendant 2-3 sec)
 * @param msg Indique la réussite
 */
socket.on('success', function (msg) {
    const dateObject = new Date();
    const humanDateFormat = dateObject.toLocaleString()
    newMessageString("Succès" + " (" + humanDateFormat + "): " + msg, "#008000", "b");
    console.log(msg);
})

//Quand on se connecte on est immédiatement sur le channel general par défault
socket.emit("messageChannel", "general");
socket.emit("commands", "/list");



