// STUN/TURN servers for voice channel 
export const iceServerConfig = (twilioObj) => {
    return {
        config: {
            iceServers: [
                {
                    urls: 'stun:global.stun.twilio.com:3478?transport=udp'
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    urls: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    urls: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    urls: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                },
                {
                    urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                    credential: 'webrtc',
                    username: 'webrtc'
                },  
                // Remove the below three objects if you are running locally without Twilio 
                {
                    urls: 'turn:global.turn.twilio.com:3478?transport=udp',
                    username: twilioObj.username,
                    credential: twilioObj.cred
                },
                {
                    urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
                    username: twilioObj.username,
                    credential: twilioObj.cred
                },
                {
                    urls: 'turn:global.turn.twilio.com:443?transport=tcp',
                    username: twilioObj.username,
                    credential: twilioObj.cred
                }
            ]
        } 
    };
}
