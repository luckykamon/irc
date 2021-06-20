const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    next();
});

// ajout de socket.io
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname + '/../testLucas'})
})

const fs = require('fs');
pathUserJson = 'ircexpress/data/users.json';
pathChannelMessage = 'ircexpress/data/channelMessage';
pathChannelList = 'ircexpress/data/channelList';
try {
    fs.writeFileSync(pathUserJson, '[]'); //Réinitialise les utilisateurs connectés
    dataUserJson = JSON.parse(fs.readFileSync(pathUserJson));
    dataChannelMessage = {};
    dataChannelList = {};
    let tailleExtension = ".json".length;
    files = fs.readdirSync(pathChannelMessage);
    let listFile = [];
    files.forEach(function (file) {
        listFile.push(file.substring(0, file.length - tailleExtension));
    });
    listFile.forEach(function (channel) {
        dataChannelMessage[channel] = JSON.parse(fs.readFileSync(pathChannelMessage + '/' + channel + '.json'));
    })

    dataChannelList = {};
    tailleExtension = ".json".length;
    files = fs.readdirSync(pathChannelList);
    listFile = []
    files.forEach(function (file) {
        listFile.push(file.substring(0, file.length - tailleExtension));
    });
    listFile.forEach(function (channel) {
        dataChannelList[channel] = JSON.parse(fs.readFileSync(pathChannelList + '/' + channel + '.json'));
    })
} catch (err) {
    console.log("Erreur de chargement des fichiers");
    console.log(err);
}

let userNumber = 0;

function saveDataChannelList() {
    try {
        for (let i = 0; i < Object.keys(dataChannelList).length; i++) {
            fs.writeFileSync('ircexpress/data/channelList/' + Object.keys(dataChannelList)[i] + '.json', JSON.stringify(dataChannelList[Object.keys(dataChannelList)[i]]));
        }
    } catch (err) {
        console.log("Erreur d'écriture de saveDataChannelList");
        console.log(err);
    }
}

function saveDataChannelMessage() {
    try {
        for (let i = 0; i < Object.keys(dataChannelMessage).length; i++) {
            fs.writeFileSync('ircexpress/data/channelMessage/' + Object.keys(dataChannelMessage)[i] + '.json', JSON.stringify(dataChannelMessage[Object.keys(dataChannelMessage)[i]]));
        }
    } catch (err) {
        console.log("Erreur d'écriture de dataChannelMessage");
        console.log(err);
    }
}

function saveDataUserJson() {
    try {
        fs.writeFileSync(pathUserJson, JSON.stringify(dataUserJson));
    } catch (err) {
        console.log("Erreur d'écriture de dataUserJson");
        console.log(err);
    }
}


io.on('connection', (socket) => {

        console.log(`Connecté au client ${socket.id}`);

        //On enregistre l'utilisateur dans le fichier general.json et dans le fichier users.json
        function connexion() {
            dataUserJson.push({
                "idUser": socket.id,
                "nickname": "Anonymous" + userNumber,
                "channel": []
            });
            userNumber += 1;
            rechercheChaineOnServeur('general', joinChannel);
            saveDataUserJson();
        }

        connexion();

        socket.on('disconnect', function () {
            for (let i = 0; i < dataUserJson.length; i++) {
                if (dataUserJson[i]['idUser'] === socket.id) {
                    for (let nameChannelUser = 0; nameChannelUser < dataUserJson[i]['channel'].length; nameChannelUser++) {
                        dataChannelList[dataUserJson[i]['channel'][nameChannelUser]].splice(dataChannelList[dataUserJson[i]['channel'][nameChannelUser]].indexOf(socket.id), 1);
                    }
                    dataUserJson.splice(i, 1); //On supprime les utilisateurs déconnectés
                    break;
                }
            }
            saveDataChannelList();
            saveDataUserJson();
            console.log(`Déconnexion du client ${socket.id}`);

        });

        function min(a, b) {
            if (a < b) {
                return a;
            } else {
                return b;
            }
        }

        /**
         * Envoie en requête les messages de la chaine à l'adresse messageChannel ou un message d'erreur à la chaîne
         */
        socket.on('messageChannel',
            /**
             *
             * @param nameChannel Nom de la chaîne
             * @param nbMessage le numéro de la page, 1 page = 20 messages, Page 1 = la dernière page
             */
            function (nameChannel, nbMessage = 50) {
                if (dataChannelMessage[nameChannel] !== undefined) {
                    let result = [];
                    tailleDataChannelMessage = dataChannelMessage[nameChannel].length;
                    for (let i = 1; i <= min(tailleDataChannelMessage, nbMessage); i++) {
                        result.unshift(dataChannelMessage[nameChannel][tailleDataChannelMessage - i]);
                    }
                    socket.emit('messageChannel', result);
                }
            });

        function changeUsername(userName) {
            doublon = false;
            for (let username = 0; username < dataUserJson.length; username++) {
                if (dataUserJson[username]['nickname'] === userName) {
                    doublon = true;
                    break;
                }
            }
            if (!doublon) {
                for (let user = 0; user < dataUserJson.length; user++) {
                    if (dataUserJson[user]['idUser'] === socket.id) {
                        dataUserJson[user]['nickname'] = userName;
                        socket.emit('success', 'Votre nouveau pseudo est : ' + userName);
                        break;
                    }
                }
            } else {
                socket.emit('erreur', `Un autre utilisateur possède déjà le pseudo ` + userName+' !');
            }
        }

        function rechercheChaineOnServeur(nameChannel, callback = null) {
            repertoire = "../data/channelMessage";
            const path = require('path');
            const directoryPath = path.join(__dirname, repertoire);
            const tailleExtension = ".json".length;
            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    emit('erreur', `Une erreur s'est produite, code d'erreur 001`);
                    console.log(`Un utilisateur a rencontré le code d'erreur 001`);
                } else {
                    let listFile = [];
                    files.forEach(function (file) {
                        if (nameChannel === undefined || file.substring(0, file.length - tailleExtension).indexOf(nameChannel) !== -1) {
                            listFile.push(file.substring(0, file.length - tailleExtension))
                        }
                    });
                    if (callback !== null) {
                        callback(listFile, nameChannel);
                    } else {
                        socket.emit('list', listFile);
                    }
                }
            });
        }

        function createChannel(listFile, nameChannel) {
            nameChannelUnique = true;
            if (listFile.length !== 0) {
                listFile.forEach(function (channel) {
                    if (channel === nameChannel) {
                        nameChannelUnique = false;
                        socket.emit('erreur', `Le channel ` + nameChannel + ` existe déjà !`);
                    }
                })
            }
            if (nameChannelUnique) {
                if (dataChannelList[nameChannel] === undefined || dataChannelMessage[nameChannel] === undefined) {
                    dataChannelList[nameChannel] = [];
                    dataChannelMessage[nameChannel] = [];
                    for (let i = 0; i < dataUserJson.length; i++) {
                        socket.in(dataUserJson[i]['idUser']).emit('creationChannel', nameChannel);
                        socket.in(dataUserJson[i]['idUser']).emit('success', `La chaîne ${nameChannel} a été créé`);
                    }
                    socket.emit('creationChannel', nameChannel);
                    socket.emit('success', `Le channel ${nameChannel} a été créé`);
                } else {
                    socket.emit('erreur', `Le channel ${nameChannel} existe déjà`);
                }
            }
        }


        function deleteChannel(listFile, nameChannel) {
            if (listFile.indexOf(nameChannel) !== -1 && nameChannel !== 'general') {
                delete dataChannelList[nameChannel];
                delete dataChannelMessage[nameChannel];
                for (let i = 0; i < dataUserJson.length; i++) {
                    if (dataUserJson[i]['channel'].indexOf(nameChannel) !== -1) {
                        dataUserJson[i]['channel'].splice(dataUserJson[i]['channel'].indexOf(nameChannel), 1);
                        socket.emit('deleteChannel', nameChannel)
                    }
                }
                const path1 = 'ircexpress/data/channelList/' + nameChannel + '.json';
                const path2 = 'ircexpress/data/channelMessage/' + nameChannel + '.json';
                fs.unlink(path1, (err) => {
                    if (err) {
                        socket.emit('erreur', `Une erreur s'est produite, code d'erreur 002`);
                        console.log(`Un utilisateur a rencontré le code d'erreur 002`);
                    } else {
                        fs.unlink(path2, (err) => {
                            if (err) {
                                socket.emit('erreur', `Une erreur s'est produite, code d'erreur 003`);
                                console.log(`Un utilisateur a rencontré le code d'erreur 003`);
                            } else {
                                socket.emit('success', `Suppression du channel ${nameChannel} réussie`);
                            }
                        });
                    }
                });
            } else {
                if (listFile.indexOf(nameChannel) === -1) {
                    socket.emit('erreur', `Le channel ${nameChannel} n'as pas pu être supprimé, il n'existe pas !`);
                } else {
                    socket.emit('erreur', `Vous ne pouvez pas supprimer le channel general !`);
                }

            }
        }

        function joinChannel(listFile, nameChannel) {
            if (listFile.indexOf(nameChannel) !== -1) {
                for (let user = 0; user < dataUserJson.length; user++) {
                    if (dataUserJson[user]['idUser'] === socket.id) {
                        if (dataUserJson[user]['channel'].indexOf(nameChannel) === -1) {
                            dataUserJson[user]['channel'].push(nameChannel);
                            dataChannelList[nameChannel].push(socket.id);
                            saveDataUserJson();
                            saveDataChannelList();
                            socket.emit('joinChannel', nameChannel);
                        } else {
                            socket.emit('erreur', `Vous avez déjà rejoint le channel ${nameChannel}`);
                        }
                        break;
                    }
                }
            } else {
                socket.emit('erreur', `Le channel ${nameChannel} n'existe pas`);
            }
        }

        function quitChannel(listFile, nameChannel) {
            if (listFile.indexOf(nameChannel) !== -1) {
                for (let i = 0; i < dataUserJson.length; i++) {
                    if (dataUserJson[i]['idUser'] === socket.id && dataUserJson[i]['channel'].indexOf(nameChannel) !== -1) {
                        dataUserJson[i]['channel'].splice(dataUserJson[i]['channel'].indexOf(nameChannel), 1);
                        socket.emit('quitChannel', nameChannel);
                    }
                }
                dataChannelList[nameChannel].splice(dataChannelList[nameChannel].indexOf(socket.id), 1);
            } else {
                socket.emit('erreur', `Le channel n'existe pas`);
            }
        }

        function listUsersChannel(nameChannel) {
            let listUserOnChannel = [];
            dataChannelList[nameChannel].forEach(function (idUser) {
                for (let i = 0; i < dataUserJson.length; i++) {
                    if (dataUserJson[i]['idUser'] === idUser) {
                        listUserOnChannel.push(dataUserJson[i]['nickname']);
                    }
                }
            });
            socket.emit('listUserOnChannel', listUserOnChannel, nameChannel);
        }

        function sendPrivateMessage(userName, message) {
            messageSend = false;
            for (let i = 0; i < dataUserJson.length; i++) {
                if (dataUserJson[i]['nickname'] === userName) {
                    if (dataUserJson[i]['idUser'] === socket.id) {
                        socket.emit('privateMessage', message, `Vous vous êtes envoyé un message à vous même (●∩_∩●)`);
                    } else {
                        for (let j = 0; j < dataUserJson.length; j++) {
                            if (dataUserJson[j]['idUser'] === socket.id) {
                                socket.in(dataUserJson[i]['idUser']).emit('privateMessage', message, `${dataUserJson[j]['nickname']} vous dit`);
                                socket.emit('privateMessage', message, `Vous avez envoyé à ${dataUserJson[j]['nickname']}`)
                                break;
                            }
                        }
                    }
                    messageSend = true;
                    break;
                }
            }
            if (!messageSend) {
                socket.emit('erreur', `Le destinataire du message n'as pas été trouvé`);
            }
        }

        function messageChannel(message, nameChannel) {
            let data = {
                "user": socket.id,
                "message": message,
                "date": Date.now()
            }
            dataChannelMessage[nameChannel].push(data);
            for (let j = 0; j < dataUserJson.length; j++) {
                if (dataUserJson[j]['idUser'] === socket.id) {
                    data['nickname'] = dataUserJson[j]['nickname'];
                }
            }
            data['channel'] = nameChannel;
            for (let i = 0; i < dataChannelList[nameChannel].length; i++) {
                if (dataChannelList[nameChannel][i] === socket.id) {
                    socket.emit('newMessageChannel', data);//à l'utilisateur lui-même
                } else {
                    socket.in(dataChannelList[nameChannel][i]).emit('newMessageChannel', data);
                }
            }

        }

        function help(){
            socket.emit('help');
        }

        socket.on('commands',
            function (command = "Bienvenue en enfer !", nameChannel = "general") {
                if (command[0] === "/") {
                    nameCommand = command.split(' ');
                    switch (nameCommand[0]) {
                        case '/nick':
                            changeUsername(nameCommand[1]);
                            break;
                        case '/list':
                            rechercheChaineOnServeur(nameCommand[1]);
                            break;
                        case '/create':
                            rechercheChaineOnServeur(nameCommand[1], createChannel);
                            break;
                        case '/delete':
                            rechercheChaineOnServeur(nameCommand[1], deleteChannel);
                            break;
                        case '/join':
                            rechercheChaineOnServeur(nameCommand[1], joinChannel);
                            break;
                        case '/quit':
                            if (nameCommand[1] !== 'general') {
                                rechercheChaineOnServeur(nameCommand[1], quitChannel);
                            } else {
                                socket.emit('erreur', 'Vous ne pouvez pas quitter le channel general');
                            }
                            break;
                        case '/users':
                            listUsersChannel(nameChannel);
                            break;
                        case '/msg':
                            sendPrivateMessage(nameCommand[1], command.substring(('/msg ' + nameCommand[1] + ' ').length));
                            break;
                        case '/help':
                            help(nameCommand[1]);
                            break;
                        default:
                            socket.emit('erreur', `Cette commande n'est pas prise en charge`);
                    }
                } else { // Il s'agit d'un message sur le channel
                    messageChannel(command, nameChannel);
                }
                saveDataChannelList()
                saveDataChannelMessage()
                saveDataUserJson()
            })


    }
)


// on change app par server
server.listen(4000, function () {
    console.log('Votre app est disponible sur localhost:4000 !')
})
