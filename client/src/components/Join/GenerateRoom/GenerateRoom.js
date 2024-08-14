import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom"; 
import { WhatsappIcon, WhatsappShareButton, TelegramShareButton, TelegramIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import "./GenerateRoom.css";
import { useAlert } from "react-alert";
const axios = require("axios");

const GenerateRoom = ({ toggle }) => { 
    const alert = useAlert();
    const [state, setState] = useState(0);
    const [roomId, setRoomId] = useState(''); 
    const [share, setShare] = useState(0); 
    const roomIdRef = useRef();

    const copy = () => {
        navigator.clipboard.writeText(roomId);
        alert.success(`Copied`);
    };

    useEffect(() => {
        const getRoomId = async () => { 
            try {
                let result = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/generateRoomId`); 
                setRoomId(result.data.roomId); 
                setState(2);
            } catch (error) {
                alert.error('Failed to generate room ID');
            }
        };

        if (state === 1) { 
            getRoomId();
        }
    }, [state, alert]); // Added `alert` to the dependency array

    const ShareComponent = () => {
        const myurl = `${process.env.REACT_APP_URL}/join?roomId=${roomId}`;
        const title = "Join my study room";
        return (
            <> 
                <WhatsappShareButton
                    url={myurl}
                    title={title}
                    separator=":: "
                    className="Demo__some-network__share-button"
                >
                    <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <TelegramShareButton
                    url={myurl}
                    title={title}
                    className="Demo__some-network__share-button"
                >
                    <TelegramIcon size={32} round />
                </TelegramShareButton>
                <LinkedinShareButton 
                    url={myurl} 
                    className="Demo__some-network__share-button"
                >
                    <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <span className="goback-share" onClick={() => { setShare(0) }}>
                    <i className="fa fa-arrow-left" aria-hidden="true" aria-label="Go back"></i>
                </span>
            </> 
        );
    };

    return (
        <>
            <button className="button mt-20 fontprime bgbutton" onClick={() => { setState(1) }}>
                Generate  
            </button>
            <div>
                <div className="roomIdBox mt-20 bgtert">
                    {
                        (state === 1) ? 
                        <div className="roomid-loader loader">Loading...</div> : 
                        <div className="roomid-text">
                            <div ref={roomIdRef}>
                                {roomId}
                            </div>
                            {
                                (state === 2) &&
                                <div>
                                    <Link to={`/join?roomId=${roomId}`}>
                                        <i className="fa fa-arrow-circle-o-right" aria-hidden="true" aria-label="Join room"></i>
                                    </Link>
                                </div>
                            }
                        </div>
                    }
                </div>
                <div className="copy-share mt-20">
                    <div>
                        <i className="fa fa-clone" aria-hidden="true" onClick={() => { copy() }} aria-label="Copy room ID"></i> 
                    </div> 
                    <div>
                        {
                            (share === 1) ? 
                            <ShareComponent /> : 
                            <i className="fa fa-share-alt" aria-hidden="true" onClick={() => { (share === 1) ? setShare(0) : setShare(1) }} aria-label="Share room ID"></i> 
                        }
                    </div>
                </div>
                <div style={{ textAlign: "left", fontSize: "2rem" }} className="mt-20"> 
                    <span onClick={() => { toggle(2) }} style={{ marginRight: 0, color: "#7289dA" }}> 
                        <i className="fa fa-arrow-circle-left" aria-hidden="true" aria-label="Go back"></i> 
                    </span>
                </div>
            </div>
        </>
    );
};

export default GenerateRoom;
