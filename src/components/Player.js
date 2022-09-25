import React, { useState, useEffect, createRef, useCallback, useMemo, memo } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Translate } from 'react-i18nify';
import styled from 'styled-components';
import backlight from '../libs/backlight';
import { isPlaying } from '../utils';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const Style = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding-bottom: 2%;

    margin-top: -13px;

    .video {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        position: relative;
        flex-direction: column;

        .videoName {
            font-size: 18px;
            font-weight: 500;
            margin: 15px 0;
            color: #fff;
        }

        video {
            position: relative;
            z-index: 10;
            outline: none;
            max-height: 90%;
            max-width: 100%;
            box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
            background-color: #000;
            cursor: pointer;
        }

        .audio-style {
            margin: 10px;
            background-size: 150px;
            background-color: rgba(0, 0, 0, -0.2);
            box-shadow: none;
            height: 150px;
            width: 150px;
        }

        .subtitle {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            bottom: 5%;
            width: 100%;
            padding: 0 20px;
            user-select: none;
            pointer-events: none;

            .operate {
                padding: 5px 15px;
                color: #fff;
                font-size: 13px;
                border-radius: 3px;
                margin-bottom: 5px;
                background-color: rgb(0 0 0 / 75%);
                border: 1px solid rgb(255 255 255 / 20%);
                cursor: pointer;
                pointer-events: all;
            }

            .textarea {
                width: 100%;
                outline: none;
                resize: none;
                text-align: center;
                line-height: 1.2;
                border: none;
                color: #fff;
                font-size: 20px;
                padding: 5px 10px;
                ${'' /* user-select: all; */}
                pointer-events: all;
                background-color: rgb(0 0 0 / 0);
                
                text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) -1px 0px 1px,
                    rgb(0 0 0) 0px -1px 1px;

                &.pause {
                    background-color: rgb(0 0 0 / 50%);
                }
            }
        }
    }
`;

const VideoWrap = memo(
    ({ setPlayer, setCurrentTime, setPlaying }) => {
        const $video = createRef();

        useEffect(() => {
            setPlayer($video.current);
            (function loop() {
                window.requestAnimationFrame(() => {
                    if ($video.current) {
                        setPlaying(isPlaying($video.current));
                        setCurrentTime($video.current.currentTime || 0);
                    }
                    loop();
                });
            })();
        }, [setPlayer, setCurrentTime, setPlaying, $video]);

        const onClick = useCallback(() => {
            if ($video.current) {
                if (isPlaying($video.current)) {
                    $video.current.pause();
                } else {
                    $video.current.play();
                }
            }
        }, [$video]);

        return (
            <video 
                onClick={onClick} 
                src={localStorage.getItem('videoSrc')} 
                ref={$video} 
                id="full-screenVideo" 
            />
        );
    },
    () => true,
);

export default function Player(props) {
    const [currentSub, setCurrentSub] = useState(null);
    const [focusing, setFocusing] = useState(false);
    const [inputItemCursor, setInputItemCursor] = useState(0);
    const [fullscreenVideo, setFullscreenVideo] = useState(false);
    const $player = createRef();

    const handleFullscreenVideo = () =>{
        var doc = window.document;
        var elem = document.getElementById("video");
    
        // if (elem.requestFullscreen) {
        //     elem.requestFullscreen();
        // } else if (elem.webkitRequestFullscreen) { /* Safari */
        //     elem.webkitRequestFullscreen();
        // } else if (elem.msRequestFullscreen) { /* IE11 */
        //     elem.msRequestFullscreen();
        // }
        var requestFullScreen =
        elem.requestFullscreen ||
        elem.mozRequestFullScreen ||
        elem.webkitRequestFullScreen ||
        elem.msRequestFullscreen;
    var cancelFullScreen =
        doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
    ) {
        requestFullScreen.call(elem);
        setFullscreenVideo(true);
    } else {
        setFullscreenVideo(false);
        cancelFullScreen.call(doc);
    }
    
    }
    
     const renderTooltip = (props) => (
            <Tooltip id="button-tooltip" {...props}>
                {!fullscreenVideo ? 'Fullscreen Video' : 'Exit'}
            </Tooltip>
        );
    useEffect(() => {
        if ($player.current && props.player && !backlight.state) {
            backlight.state = true;
            backlight($player.current, props.player);
        }
    }, [$player, props.player]);

    useMemo(() => {
        setCurrentSub(
            (props.configuration === 'Subtitling')
           ? props.subtitle[props.currentIndex]
           : props.subtitleEnglish[props.currentIndex]
    );
    }, [props.configuration, props.subtitle, props.subtitleEnglish, props.currentIndex]);

    const onChange = useCallback(
        (event) => {
            props.player.pause();
            props.configuration === 'Subtitling' ? 
            props.updateSub(currentSub, { text: event.target.value })
            : props.updateSubEnglish(currentSub, { text: event.target.value });
            if (event.target.selectionStart) {
                setInputItemCursor(event.target.selectionStart);
            }
        },
        [props, currentSub],
    );

    const onClick = useCallback(
        (event) => {
            props.player.pause();
            if (event.target.selectionStart) {
                setInputItemCursor(event.target.selectionStart);
            }
        },
        [props],
    );

    const onFocus = useCallback((event) => {
        setFocusing(true);
        if (event.target.selectionStart) {
            setInputItemCursor(event.target.selectionStart);
        }
    }, []);

    const onBlur = useCallback(() => {
        setTimeout(() => setFocusing(false), 500);
    }, []);

    const onSplit = useCallback(() => {
        props.splitSub(currentSub, inputItemCursor);
    }, [props, currentSub, inputItemCursor]);

    return (
        <Style className="player">
            <div className="video" id="video" ref={$player}>
                <div className="videoName">{localStorage.getItem("videoName")}</div>
                <VideoWrap {...props} />

                { props.isSetVideo && !props.fullscreen && !JSON.parse(localStorage.getItem('isAudioOnly')) &&
                    <OverlayTrigger placement="left" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
                        <Button className="full-screen-btn" variant="dark" onClick={() => handleFullscreenVideo(!fullscreenVideo)}>
                        {fullscreenVideo ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-fullscreen-exit"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-fullscreen"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
                                </svg>
                            )}
                        </Button>
                    </OverlayTrigger>
                }
                {props.player && currentSub ? (
                    <div className="subtitle">
                        {props.configuration === 'Same Language Subtitling' && focusing ? (
                            <div className="operate" onClick={onSplit}>
                                <Translate value="SPLIT" />
                            </div>
                        ) : null}
                        <TextareaAutosize
                            className={`textarea ${!props.playing ? 'pause' : ''}`}
                            value={currentSub.text}
                            onChange={onChange}
                            onClick={onClick}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={onFocus}
                            spellCheck={false}
                        />
                    </div>
                ) : null}
            </div>
        </Style>
    );
}
