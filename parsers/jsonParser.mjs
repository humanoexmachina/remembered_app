'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';

export async function loadFile(filePath) {
    let rawData = await fs.promises.readFile(filePath);
    let parsedFile = JSON.parse(rawData);
    let participants = parsedFile.participants;
    let messages = parsedFile.messages;

    getParticipants(participants);
    getMessages(messages);
}

function getParticipants(participants) {
    for (let i = 0; i < participants.length; i++) {
        const name = participants[i].name;
        console.log(name);
    }
}

function getMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const type = message.type;

        switch (type) {
            case 'Generic':
                if (message.hasOwnProperty(`content`)) {
                    const decodedText = utf8.decode(message.content); // decodes symbols and emojis
                    console.log(decodedText);
                } else if (message.hasOwnProperty(`audio_files`)) {
                    const audioFiles = message.audio_files;
                    console.log(audioFiles[0].uri);
                } else if (message.hasOwnProperty(`videos`)) {
                    const videoFiles = message.videos;
                    console.log(videoFiles[0].uri);
                } else if (message.hasOwnProperty(`photos`)) {
                    const photoFiles = message.photos;
                    console.log(photoFiles[0].uri);
                } else {
                    console.log(`It is a message we don't care about`);
                }
                break;
            case 'Share':
                // for message of type 'Share', it could be sharing a link or sharing some contents or both
                if (message.hasOwnProperty(`content`)) {
                    console.log(utf8.decode(message.content));
                } else if (message.hasOwnProperty(`share`)) {
                    if (message.share.hasOwnProperty(`link`)) {
                        console.log(message.share.link);
                    } else {
                        console.log(`It is a message we don't care about`);
                    }
                } 
                break;
        }
    }
}