'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import sqlite3 from 'sqlite3';

/* enums: https://www.sohamkamani.com/javascript/enums/ */
class Platform {
    // Create new instances of the same class as static attributes
    static Messenger = new Platform(1)
    static Instagram = new Platform(2)

    constructor(name) {
        this.name = name
    }
}

class ChatStatus {
    // Create new instances of the same class as static attributes
    static Live = new ChatStatus(1)
    static Archived = new ChatStatus(2)

    constructor(name) {
        this.name = name
    }
}

/* Open Database */
let db = new sqlite3.Database('../data/remembered.db', (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.log('Successfully connected to remembered.db SQLite3 database.');
});

initializeDatabaseTables()

loadFile('../files/arainyspringday_20221205/messages/inbox/graceandminyoungan_98otlxnfta/message_1.json', Platform.Instagram.name, "graceandminyoungan_98otlxnfta");

async function loadFile(filePath, platform, chatTitle) {
    let rawData = await fs.promises.readFile(filePath);
    let parsedFile = JSON.parse(rawData);
    let participants = parsedFile.participants;
    let messages = parsedFile.messages;
    var finalChatParticipants = []

    getParticipants(participants, platform, function(participants) {
        console.log('participants:', participants)
        finalChatParticipants = participants;
        console.log('finalChatParticipants inside:', finalChatParticipants)
    });

    console.log(`finalChatParticipants: ${finalChatParticipants}`)

    getMessages(messages);
};

function getParticipants(participants, platform, callback) {
    var allParticipants = []

    const contactCallback = function(error, id) {
        if (error) {
            console.log(err);
            throw err;
        }

        console.log(`id just added: ${id}`)
        allParticipants.push(id)
        console.log('allParticipants:', allParticipants)
    }

    for (let i = 0; i < participants.length; i++) {
        const name = utf8.decode(participants[i].name);
        console.log(name)

        if (i < participants.length - 1) {
            console.log(`inserting ${name} into DB`)
            insertNewContact(name, contactCallback);
        }
    }

    console.log("allParticipants outside:", allParticipants)
    callback(allParticipants)
};

function getMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const type = message.type;

        switch (type) {
            case 'Generic':
                const text = message.content;
                const audioFiles = message.audio_files;
                const videoFiles = message.videos;
                const photoFiles = message.photos;

                if (text != null) {
                    const decodedText = utf8.decode(text); // decodes symbols and emojis
                    // console.log(decodedText);
                } else {
                    if (audioFiles != null) {
                        // console.log(audioFiles[0].uri);
                    } else if (videoFiles != null) {
                        // console.log(videoFiles[0].uri);
                    } else if (photoFiles != null) {
                        // console.log(photoFiles[0].uri);
                    } else {
                        // console.log('no matching format');
                    }
                }
                break;
            case 'Share':
                console.log(message.share.link);
                break;
        }
    }
};

function initializeDatabaseTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY,
                created INT NOT NULL,
                last_updated INT NOT NULL,
                customTitle TEXT NOT NULL,
                participants TEXT NOT NULL,
                platforms TEXT NOT NULL,
                status INT NOT NULL
            )`, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY,
                created INT NOT NULL,
                last_updated INT NOT NULL,
                nickname TEXT NOT NULL
            )`, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
}

function insertNewContact(contactName, callback) {
    const query = 'INSERT INTO contacts(created, last_updated, nickname) VALUES(?,?,?)'
    const values = [Date.now(), Date.now(), contactName]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    });
}

function insertNewChat(chatTitle, participants, platform, callback) {
    const query = 'INSERT INTO chats(title,participants,platforms,status) VALUES(?,?,?,?)'
    const values = [chatTitle, participants, platform, 1]
    db.run(query, values, function(error) {
        callback(error, this.lastID)
    });
}

// 3rd operation (retrieve data from users table)
// db.each(`SELECT email FROM users`, (err, row) => {
//     if (err) {
//         console.log(err);
//         throw err;
//     }
//     console.log(row.email);
// }, () => {
//     console.log('query completed')
// });