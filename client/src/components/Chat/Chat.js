import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import io from 'socket.io-client';
import "./Chat.css";
import { iceServerConfig } from "../../config/iceServers";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import { useAlert } from "react-alert";

// Right side components
import InfoBarRight from "../rightSideComponents/InfobarRight/InfoBarRight";
import People from "../rightSideComponents/People/People";
import Voice from "../rightSideComponents/Voice/Voice";

import Peer from "peerjs";
import axios from "axios";

const getAudio = async () => {
    try {
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
};

function stopMediaTracks(stream) {
    stream.getTracks().forEach((track) => {
        if (track.readyState === 'live') {
            track.stop();
        }
    });
}

let cred = null, socket = null, peer = null, peers = [], myStream = null, receivedCalls = [];

const Chat = ({ location }) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [messageToSend, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [usersOnline, setUsersOnline] = useState([]);

    const [join, setJoin] = useState(0);
    const [usersInVoice, setUsersInVoice] = useState([]);
    const history = useHistory();
    const alert = useAlert();

    // Server WebSocket endpoint
    const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);
        socket = io(ENDPOINT, { transport: ['websocket'] });
        setName(name.trim().toLowerCase());
        setRoom(room.trim().toLowerCase());

        const connectNow = () => {
            socket.emit('join', { name, room }, (result) => {
                console.log(`You are ${name} with id ${socket.id}`);
                cred = iceServerConfig(result);
                console.log("CRED SET", cred);
            });
        }

        const checkRoomExists = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/checkRoomExists/${room}`);
                if (result.data && result.data.exists) {
                    connectNow();
                } else {
                    alert.error("Such room doesn't exist or expired");
                    history.push("/");
                }
            } catch (error) {
                console.error("Error checking room existence:", error);
                alert.error("An error occurred. Please try again later.");
            }
        };

        checkRoomExists();

        return () => {
            socket.emit('leave-voice', { name, room }, () => {});
            socket.emit('disconnect');
            socket.off();
        };
    }, [ENDPOINT, location.search, history, alert]);

    useEffect(() => {
        socket.on('message', (messageReceived) => {
            setMessages((messages) => [...messages, messageReceived]);
        });
        socket.on('usersinvoice-before-join', ({ users }) => {
            setUsersInVoice(users);
        });
        socket.on('users-online', ({ users }) => {
            setUsersOnline(users);
        });
        socket.on('add-in-voice', (user) => {
            console.log(`New user in voice: ${user.name}`);
            setUsersInVoice((usersInVoice) => [...usersInVoice, user]);
        });
        socket.on('remove-from-voice', (user) => {
            setUsersInVoice((usersInVoice) => usersInVoice.filter((x) => x.id !== user.id));
        });
    }, []);

    const onReceiveAudioStream = (stream) => {
        console.log("Receiving an audio stream");
        const audio = document.createElement('audio');
        audio.srcObject = stream;
        audio.addEventListener('loadedmetadata', () => {
            audio.play();
        });
    }

    useEffect(() => {
        if (join) {
            getAudio().then((mystream) => {
                if (!mystream) return;
                myStream = mystream;

                peer = new Peer(socket.id, cred);
                console.log("Peer:", peer);

                peer.on('call', (call) => {
                    console.log("Call receiving");
                    call.answer(mystream);
                    call.on('stream', (stream) => {
                        onReceiveAudioStream(stream);
                        receivedCalls.push(stream);
                    });
                });

                peer.on('open', () => {
                    console.log("Connected to peer server");

                    const otherUsersInVoice = usersInVoice.filter((x) => x.id !== socket.id);

                    peers = otherUsersInVoice.map((u) => {
                        const mediaConnection = peer.call(u.id, mystream);
                        console.log(`Calling ${u.id} ${u.name}`);

                        const audio = document.createElement('audio');
                        mediaConnection.on('stream', (stream) => {
                            console.log(`${u.name} picked up call`);
                            audio.srcObject = stream;
                            audio.addEventListener('loadedmetadata', () => {
                                audio.play();
                            });
                        });

                        mediaConnection.on('close', () => {
                            audio.remove();
                        });
                        return mediaConnection;
                    });
                });
            }).catch((error) => {
                console.error("Error while getting audio", error);
            });
        }

        return () => {
            if (myStream) stopMediaTracks(myStream);
            receivedCalls.forEach((stream) => stopMediaTracks(stream));

            if (peer) {
                peer.disconnect();
                myStream = null;
                console.log("Disconnected");

                if (peers) {
                    peers.forEach((x) => {
                        x.close();
                    });
                    peers = [];
                }
            }
        }
    }, [join, usersInVoice]);

    const sendMessage = (event) => {
        event.preventDefault();
        if (messageToSend) {
            socket.emit('user-message', messageToSend, () => setMessage(''));
        }
    }

    const joinVoice = () => {
        socket.emit('join-voice', { name, room }, () => {});
        console.log('Voice joined');
    }

    const leaveVoice = () => {
        socket.emit('leave-voice', { name, room }, () => {});
        console.log('Voice left');
    }

    return (
        <div className="outerContainer bgprime">
            <div className="container bgsec">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input setMessage={setMessage} sendMessage={sendMessage} messageToSend={messageToSend} />
            </div>
            <div className="inMobile bgsec">
                ...scroll down for more
            </div>
            <div className="container-right">
                <div className="container-up bgsec">
                    <InfoBarRight />
                    <People usersOnline={usersOnline} isVoice={false} />
                </div>
                <div className="container-down bgsec">
                    <People usersOnline={usersInVoice} isVoice={true} />
                    <Voice usersInVoice={usersInVoice} joinVoice={joinVoice} leaveVoice={leaveVoice} join={join} setJoin={setJoin} />
                </div>
            </div>
        </div>
    );
}

export default Chat;
