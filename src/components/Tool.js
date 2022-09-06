import styled from 'styled-components';
// import languages from '../libs/languages';
import { t, Translate } from 'react-i18nify';
import React, { useState, useCallback, useEffect } from 'react';
import { getExt, download } from '../utils';
import { file2sub, sub2vtt, sub2srt, sub2txt, url2sub, vtt2url } from '../libs/readSub';
import sub2ass from '../libs/readSub/sub2ass';
// import googleTranslate from '../libs/googleTranslate';
// import englishKeywordsTranslate from '../libs/englishKeywordsTranslate';
import FFmpeg from '@ffmpeg/ffmpeg';
import SimpleFS from '@forlagshuset/simple-fs';
import HamburgerMenu from 'react-hamburger-menu';
//import '../utils/ToolNavigation.css';
import BottomLinks from './BottomLinks';
import Links from './Links';
import GetVideoDetailsAPI from '../redux/actions/api/Video/GetVideoDetails';
import { useDispatch, useSelector } from 'react-redux';
import APITransport from '../redux/actions/apitransport/apitransport';
import Navbar from './Header';
import LoginForm from './Login';
import SaveTranscriptAPI from '../redux/actions/api/Transcript/SaveTranscript';
import ReactModal from 'react-modal';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import UploadModal from './UploadModal';
import ExportModal from './ExportModal';
import FindAndReplace from './FindAndReplace';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
// import axios from 'axios';

const Style = styled.div`
    border-bottom: 1px solid #63d471;

    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    //  padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 100;

    .top-panel-select {
        width: 150px;
        text-decoration: none;
        align-items: center;
        color: #fff;
        height: 40px;
        background: #3f51b5;
        border-radius: 10px;
        cursor: pointer;
        border: none;
        padding: 0 15px;
        line-height: 2.7;

        option {
            padding: 15px;
            background: #fff;
            border-radius: 10px;
            color: #000;
        }
    }

    .modal-textarea {
        padding: 20px;
    }

    .youtube-link .youtube-textarea {
        padding: 20px;
    }

    .top {
        display: flex;
        justify-content: center;
        align-items: center;
        select {
            outline: none;
            padding: 0 10px;
            height: 40px;
            border-radius: 3px;
            border: none;
        }
    }

    .modal-fetch-btn {
        position: relative;
        opacity: 0.85;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 35px;
        width: 48%;
        border-radius: 3px;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        background-color: black;
        transition: all 0.2s ease 0s;

        &:hover {
            opacity: 1;
        }
    }

    .save-transcript {
        .btn {
            background: #19ab27;
            border-color: #19ab27;

            &:hover {
                background: #19ab27;
                border-color: #19ab27;
            }
        }
    }

    .tool-button {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 10px 10px 2px 0;
        margin-bottom: 5px;

        .icon {
            cursor: pointer;
        }
    }

    .import {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 48%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #3f51b5;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }

        .file {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
        }
    }

    .export {
        text-align: center;
    }

    .secondary-options {
        transform: scaleY(1) !important;
        transition: all 0.25s 0.4s;
        transform-origin: top;
    }

    .hide-secondary-options {
        transform: scaleY(0) !important;
        transition: all 0.25s;
        transform-origin: top;
        height: 0;
    }

    .hide-secondary-options * > {
        opacity: 0;
        transition: all 0.1s;
    }

    .select-translation-api-container {
        display: flex;
        flex-direction: column;
        // justify-content: center;
        padding-left: 10px;

        .select-heading {
            margin-top: -0.5px;
        }

        select {
            width: 95%;
            outline: none;
            height: 35px;
            border-radius: 3px;
            margin-bottom: 10px;
            margin-top: -10px;
        }
    }

    .burn {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 100%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .export {
        .export-btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 31%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #009688;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .operate {
        .btn {
            width: fit-content;
            text-decoration: none;
            align-items: center;
            color: #fff;
            height: 40px;
            background: #3f51b5;
            border-radius: 10px;
            cursor: pointer;
            border: none;
            padding: 0 15px;
            line-height: 2.4;
            margin-right: 20px;
        }

        .btn:hover {
            background-color: #5264cc;
        }
    }

    .configuration {
        transform: scaleY(1) !important;
        transition: all 0.25s 0.4s;
        transform-origin: top;
        display: flex;
        justify-content: center;
        align-items: center;

        &-heading {
            opacity: 1;
            padding-left: 10px;
            margin-top: -0.5px;
        }

        &-options {
            opacity: 1;
            display: flex;
            // align-items: center;

            .btn {
                width: 150px;
                text-decoration: none;
                align-items: center;
                justify-content: center;
                color: #fff;
                height: 40px;
                background: #3f51b5;
                border-radius: 10px;
                cursor: pointer;
                border: none;
                text-align: center;
            }

            .btn:hover {
                background-color: #5264cc;
            }
        }
    }

    .hide-config {
        transform: scaleY(0) !important;
        transition: all 0.25s;
        transform-origin: top;
        height: 0;
        display: none;
    }
    .hide-config .configuration-heading {
        opacity: 0;
        transition: all 0.1s;
        display: none;
    }

    .hide-config .configuration-options {
        opacity: 0;
        transition: all 0.1s;
        display: none;
    }

    .translate {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        select {
            width: 65%;
            outline: none;
            padding: 0 5px;
            border-radius: 3px;
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 33%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }
    .youtube-link {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        .youtube-textarea {
            width: 65%;
            outline: none;
            padding: 0 5px;
            border-radius: 3px;
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 33%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .hotkey {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        span {
            width: fit-content;
            text-decoration: none;
            align-items: center;
            color: #fff;
            height: 40px;
            background: #3f51b5;
            border-radius: 10px;
            cursor: not-allowed;
            border: none;
            padding: 0 15px;
            line-height: 2.7;
            margin: 0 10px;
        }
    }

    .bottom {
        padding: 10px;
        a {
            display: flex;
            flex-direction: column;
            border: 1px solid rgb(255 255 255 / 30%);
            text-decoration: none;

            .title {
                color: #ffeb3b;
                padding: 5px 10px;
                animation: animation 3s infinite;
            }

            @keyframes animation {
                50% {
                    color: #00bcd4;
                }
            }

            img {
                max-width: 100%;
            }
        }
    }

    .progress {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        z-index: 9;
        height: 2px;
        background-color: rgb(0 0 0 / 50%);

        span {
            display: inline-block;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0;
            height: 100%;
            background-color: #ff9800;
            transition: all 0.2s ease 0s;
        }
    }

    .signin-btn {
        margin-left: auto;
    }

    .select-box {
        margin-left: auto;
    }

    .export-btn-main {
        width: 150px;
        text-decoration: none;
        align-items: center;
        justify-content: center;
        color: #fff;
        height: 40px;
        background: #3f51b5;
        border-radius: 10px;
        cursor: pointer;
        border: none;
        margin: 0 20px;
        line-height: 2.7;
        padding: 0 15px;
    }

    .export-btn-main:hover {
        background-color: #5264cc;
    }

    .react-toggle {
        margin: 0 20px 0 0;
    }
`;
// function useStickyState(defaultValue, key) {
//     const [value, setValue] = React.useState(() => {
//       const stickyValue = window.localStorage.getItem(key);
//       return stickyValue !== null
//         ? JSON.parse(stickyValue)
//         : defaultValue;
//     });
//     React.useEffect(() => {
//       window.localStorage.setItem(key, JSON.stringify(value));
//     }, [key, value]);
//     return [value, setValue];
//   }

// const CalendarView = () => {
//     const [mode, setMode] = useStickyState('day', 'calendar-view');
//     return (
//       <>
//         <select onChange={ev => setMode(ev.target.value)}>
//           <option value="day">Day</option>
//           <option value="week">Week</option>
//           <option value="month">Month</option>
//         </select>
//         {/* Calendar stuff here */}
//       </>
//     )
//   }

FFmpeg.createFFmpeg({ log: true }).load();
const fs = new SimpleFS.FileSystem();

export default function Header({
    player,
    waveform,
    newSub,
    undoSubs,
    clearSubs,
    language,
    subtitle,
    setLoading,
    formatSub,
    setSubtitle,
    setProcessing,
    notify,
    subtitleEnglish,
    setSubtitleEnglish,
    clearSubsEnglish,
    setSubtitleOriginal,
    clearedSubs,
    setClearedSubs,
    configuration,
    setConfiguration,
    enableConfiguration,
    setEnableConfiguration,
    isSetConfiguration,
    setIsSetConfiguration,
    translationApi,
    setTranslationApi,
    setTranscribe,
    onTranscribe,
    isSetVideo,
    setIsSetVideo,
    transcriptSource,
    setTranscriptSource,
    find,
    replace,
    found,
    setFind,
    setReplace,
    setFound,
    handleReplace,
    handleReplaceAll,
    handleFind,
    currentFound,
    setCurrentFound,
    handleTranscriptionClose,
    handleTranscriptionShow,
    handleTranslationClose,
    handleTranslationShow,
    fullscreen,
    isTranslateClicked,
}) {
    // const [translate, setTranslate] = useState('en');
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeURL, setYoutubeURL] = useState('');
    const translate = 'en';
    const [toolOpen, setToolOpen] = useState(true);
    const dispatch = useDispatch();
    const VideoDetails = useSelector((state) => state.getVideoDetails.data);
    const [showLogin, setShowLogin] = useState(false);
    const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);

    const [toggleState, setToggleState] = useState('Same Language Subtitling');

    // const [videos, setVideos] = useState([]);
    /* For Upload/Open Modal */
    const [importModalOpen, setImportModalOpen] = useState(false);
    const handleImportClose = () => setImportModalOpen(false);
    const handleImportShow = () => setImportModalOpen(true);

    function useStickyState(defaultValue, key) {
        const [value, setValue] = React.useState(() => {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        });
        React.useEffect(() => {
            window.localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);
        return [value, setValue];
    }

    // const [modeTranscribe, setModeTranscribe] = useStickyState('as', 'transcribed-view');
    // const [isSetVideo, setIsSetVideo] = useState(false);
    const saveTranscript = async () => {
        if (localStorage.getItem('subtitle')) {
            setLoading(t('SAVING'));
            const payload = {
                output: sub2vtt(subtitle),
            };
            const saveObj = new SaveTranscriptAPI(
                localStorage.getItem('transcript_id'),
                localStorage.getItem('langTranscribe'),
                payload,
            );
            const res = await fetch(saveObj.apiEndPoint(), {
                method: 'POST',
                body: JSON.stringify(saveObj.getBody()),
                headers: saveObj.getHeaders().headers,
            });
            const resp = await res.json();
            if (res.ok) {
                localStorage.setItem('subtitle', JSON.stringify(subtitle));
                localStorage.setItem('subtitleEnglish', JSON.stringify(subtitle));
                notify({
                    message: 'Subtitle saved successfully',
                    level: 'success',
                });
            } else {
                notify({
                    message: 'Subtitle could not be saved',
                    level: 'error',
                });
            }
            setLoading('');
        }
    };

    const clearSubsHandler = () => {
        window.localStorage.setItem('subsBeforeClear', JSON.stringify(subtitle));

        // let tempSubs = subtitle.slice(0);
        // tempSubs.map((sub) => {
        //     sub.text = '';
        //     sub.text2 = '';
        //     return true;
        // });
        setSubtitle([]);
        setSubtitleEnglish([]);
        localStorage.removeItem('subtitleEnglish');

        // setSubtitleOriginal(tempSubs);
        setClearedSubs(true);
        player?.pause();
    };

    const decodeAudioData = useCallback(
        async (file) => {
            try {
                const { createFFmpeg, fetchFile } = FFmpeg;
                const ffmpeg = createFFmpeg({ log: true });
                ffmpeg.setProgress(({ ratio }) => setProcessing(ratio * 100));
                setLoading(t('LOADING_FFMPEG'));
                await ffmpeg.load();
                ffmpeg.FS('writeFile', file.name, await fetchFile(file));
                setLoading('');
                notify({
                    message: t('DECODE_START'),
                    level: 'info',
                });
                const output = `${Date.now()}.mp3`;
                await ffmpeg.run('-i', file.name, '-ac', '1', '-ar', '8000', output);
                const uint8 = ffmpeg.FS('readFile', output);
                // download(URL.createObjectURL(new Blob([uint8])), `${output}`);
                await waveform.decoder.decodeAudioData(uint8);
                waveform.drawer.update();
                setProcessing(0);
                ffmpeg.setProgress(() => null);
                notify({
                    message: t('DECODE_SUCCESS'),
                    level: 'success',
                });
            } catch (error) {
                setLoading('');
                setProcessing(0);
                notify({
                    message: t('DECODE_ERROR'),
                    level: 'error',
                });
            }
        },
        [waveform, notify, setProcessing, setLoading],
    );

    const burnSubtitles = useCallback(async () => {
        player?.pause();
        try {
            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({ log: true });
            ffmpeg.setProgress(({ ratio }) => setProcessing(ratio * 100));
            setLoading(t('LOADING_FFMPEG'));
            await ffmpeg.load();
            setLoading(t('LOADING_FONT'));

            await fs.mkdir('/fonts');
            const fontExist = await fs.exists('/fonts/Microsoft-YaHei.ttf');
            if (fontExist) {
                const fontBlob = await fs.readFile('/fonts/Microsoft-YaHei.ttf');
                ffmpeg.FS('writeFile', `tmp/Microsoft-YaHei.ttf`, await fetchFile(fontBlob));
            } else {
                const fontUrl = 'https://cdn.jsdelivr.net/gh/zhw2590582/SubPlayer/docs/Microsoft-YaHei.ttf';
                const fontBlob = await fetch(fontUrl).then((res) => res.blob());
                await fs.writeFile('/fonts/Microsoft-YaHei.ttf', fontBlob);
                ffmpeg.FS('writeFile', `tmp/Microsoft-YaHei.ttf`, await fetchFile(fontBlob));
            }
            setLoading(t('LOADING_VIDEO'));
            ffmpeg.FS(
                'writeFile',
                videoFile ? videoFile.name : 'sample.mp4',
                await fetchFile(videoFile || 'sample.mp4'),
            );
            setLoading(t('LOADING_SUB'));
            const subtitleFile = new File([new Blob([sub2ass(subtitle)])], 'subtitle.ass');
            ffmpeg.FS('writeFile', subtitleFile.name, await fetchFile(subtitleFile));
            setLoading('');
            notify({
                message: t('BURN_START'),
                level: 'info',
            });
            const output = `${Date.now()}.mp4`;
            await ffmpeg.run(
                '-i',
                videoFile ? videoFile.name : 'sample.mp4',
                '-vf',
                `ass=${subtitleFile.name}:fontsdir=/tmp`,
                '-preset',
                videoFile ? 'fast' : 'ultrafast',
                output,
            );
            const uint8 = ffmpeg.FS('readFile', output);
            download(URL.createObjectURL(new Blob([uint8])), `${output}`);
            setProcessing(0);
            ffmpeg.setProgress(() => null);
            notify({
                message: t('BURN_SUCCESS'),
                level: 'success',
            });
        } catch (error) {
            setLoading('');
            setProcessing(0);
            notify({
                message: t('BURN_ERROR'),
                level: 'error',
            });
        }
    }, [notify, setProcessing, setLoading, videoFile, subtitle]);

    const props = {};

    const onVideoChange = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = getExt(file.name);
                const canPlayType = player.canPlayType(file.type);
                if (canPlayType === 'maybe' || canPlayType === 'probably') {
                    setVideoFile(file);
                    decodeAudioData(file);
                    const url = URL.createObjectURL(new Blob([file]));
                    waveform.decoder.destroy();
                    waveform.drawer.update();
                    // waveform.seek(0);
                    player.currentTime = 0;
                    clearSubs();
                    setSubtitle([
                        newSub({
                            start: '00:00:00.000',
                            end: '00:00:01.000',
                            text: t('SUB_TEXT'),
                        }),
                    ]);
                    player.src = url;
                } else {
                    notify({
                        message: `${t('VIDEO_EXT_ERR')}: ${file.type || ext}`,
                        level: 'error',
                    });
                }
            }

            localStorage.setItem('isVideoPresent', true);
            setIsSetVideo(true);
        },
        [newSub, notify, player, setSubtitle, waveform, clearSubs, decodeAudioData, setIsSetVideo],
    );

    // const fetchTranscript = () => {
    //     const transcriptObj = new FetchTranscriptAPI();
    // }

    useEffect(() => {
        if (VideoDetails.direct_video_url) {
            localStorage.setItem('videoSrc', VideoDetails.direct_video_url);
            localStorage.setItem('videoId', VideoDetails.video.id);
            localStorage.setItem('audioSrc', VideoDetails.direct_audio_url);
            localStorage.setItem('youtubeURL', VideoDetails.video.url);
            localStorage.setItem('isVideoPresent', true);
            setIsSetVideo(true);
            setLoading('');
            player.src = VideoDetails.direct_video_url;
            player.currentTime = 0;
            clearSubs();
            // if (VideoDetails.transcript_id) {
            //     localStorage.setItem('transcript_id', VideoDetails.transcript_id);
            //     setSubtitleEnglish(formatSub(VideoDetails.subtitles));
            //     localStorage.setItem('subtitleEnglish', JSON.stringify(VideoDetails.subtitles));
            //     setTranscriptSource('Youtube');
            //     // fetch(VideoDetails.subtitles)
            //     // .then((subtext) => {
            //     //     return subtext.text();
            //     // })
            //     // .then((subtext) => {
            //     //     const suburl = vtt2url(subtext);
            //     //     url2sub(suburl).then((urlsub) => {
            //     //         setSubtitle(urlsub);
            //     //         setSubtitleEnglish(urlsub);
            //     //         localStorage.setItem('subtitle', JSON.stringify(urlsub));
            //     //         localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
            //     //     });
            //     // })
            //     // .catch((err) => {
            //     //     console.log(err);
            //     // });
            // }
        }
        // if (resp.subtitles) {
        //     const sub = resp.subtitles;

        //     fetch(sub)
        //         .then((subtext) => {
        //             return subtext.text();
        //         })
        //         .then((subtext) => {
        //            // console.log(subtext);
        //             player.currentTime = 0;
        //             clearSubs();
        //             const suburl = vtt2url(subtext);
        //             url2sub(suburl).then((urlsub) => {
        //                 setSubtitle(urlsub);
        //                 localStorage.setItem('subtitle', JSON.stringify(urlsub));
        //             });
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //         });
        //     }
        // } else {
        //             // // Auto-transcribe
        //             // const data = {
        //             //     url: youtubeURL,
        //             //     vad_level: 2,
        //             //     chunk_size: 10,
        //             //     language: 'en',
        //             // };

        //             // fetch(`${process.env.REACT_APP_ASR_URL}/transcribe`, {
        //             //     method: 'POST',
        //             //     headers: { 'Content-Type': 'application/json' },
        //             //     body: JSON.stringify(data),
        //             // })
        //             //     .then((resp) => {
        //             //         return resp.json();
        //             //     })
        //             //     .then((resp) => {
        //             //         console.log(resp.output);
        //             //         player.currentTime = 0;
        //             //         clearSubs();
        //             //         const suburl = vtt2url(resp.output);
        //             //         url2sub(suburl).then((urlsub) => {
        //             //             setSubtitle(urlsub);
        //             //             localStorage.setItem('subtitle', JSON.stringify(urlsub));
        //             //         });
        //             //     })
        //             //     .catch((err) => {
        //             //         console.log(err);
        //             //     });
        //         }
        //     });
    }, [VideoDetails]);

    const onYouTubeChange = useCallback(
        (event) => {
            if (youtubeURL.length > 0) {
                const videoObj = new GetVideoDetailsAPI(youtubeURL);

                setLoading(t('LOADING'));
                dispatch(APITransport(videoObj));
            }
        },
        [clearSubs, youtubeURL, translate, player, setSubtitle, setLoading, setIsSetVideo],
    );

    const onRecentVideoLinkClick = useCallback(
        (url) => {
            const videoObj = new GetVideoDetailsAPI(url);

            setLoading(t('LOADING'));
            dispatch(APITransport(videoObj));
        },
        [clearSubs, youtubeURL, translate, player, setSubtitle, setLoading, setIsSetVideo],
    );

    const handleChange = (value) => {
        setYoutubeURL(value);
    };

    const clearData = () => {
        setYoutubeURL('');
        localStorage.setItem('videoSrc', null);
        localStorage.setItem('isVideoPresent', false);
        localStorage.setItem('lang', 'en');
        localStorage.setItem('subtitleEnglish', null);

        clearSubs();
        clearSubsEnglish();
        clearSubsHandler();

        window.location.reload();
    };

    const onSubtitleChange = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = getExt(file.name);
                if (['ass', 'vtt', 'srt', 'json'].includes(ext)) {
                    file2sub(file)
                        .then((res) => {
                            // clearSubs();
                            localStorage.removeItem('transcript_id');
                            setSubtitle(res);
                            // setSubtitleEnglish(res); //added setSubtitleEnglish
                        })
                        .catch((err) => {
                            notify({
                                message: err.message,
                                level: 'error',
                            });
                        });
                } else {
                    notify({
                        message: `${t('SUB_EXT_ERR')}: ${ext}`,
                        level: 'error',
                    });
                }
            }
        },
        [notify, setSubtitle, clearSubs],
    );

    const onInputClick = useCallback((event) => {
        setTranscriptSource('Custom');
        event.target.value = '';
    }, []);

    const downloadSub = useCallback(
        (type) => {
            player?.pause();
            let text = '';
            const name = `${Date.now()}.${type}`;
            switch (type) {
                case 'vtt':
                    text = sub2vtt(subtitle);
                    break;
                case 'srt':
                    text = sub2srt(subtitle);
                    break;
                case 'ass':
                    text = sub2ass(subtitle);
                    break;
                case 'txt':
                    text = sub2txt(subtitle);
                    break;
                case 'json':
                    text = JSON.stringify(subtitle);
                    break;
                default:
                    break;
            }
            const url = URL.createObjectURL(new Blob([text]));
            download(url, name);
        },
        [subtitle],
    );

    const downloadSubReference = useCallback(
        (type) => {
            player?.pause();
            let text = '';
            const name = `${Date.now()}.${type}`;
            switch (type) {
                case 'vtt':
                    text = sub2vtt(subtitleEnglish);
                    break;
                case 'srt':
                    text = sub2srt(subtitleEnglish);
                    break;
                case 'ass':
                    text = sub2ass(subtitleEnglish);
                    break;
                case 'txt':
                    text = sub2txt(subtitleEnglish);
                    break;
                case 'json':
                    text = JSON.stringify(subtitleEnglish);
                    break;
                default:
                    break;
            }
            const url = URL.createObjectURL(new Blob([text]));
            download(url, name);
        },
        [subtitleEnglish],
    );

    const handleToggleChange = () => {
        if (toggleState == 'Subtitling') {
            setConfiguration(toggleState);
            setIsSetConfiguration(true);
            setToggleState('Same Language Subtitling');
        } else {
            setConfiguration(toggleState);
            setIsSetConfiguration(true);
            setToggleState('Subtitling');
        }
    };

    useEffect(() => {
        if (isSetVideo === false) {
            if (window.localStorage.getItem('isVideoPresent') === 'true') {
                setIsSetVideo(!isSetVideo);
            }
        }
    }, [setIsSetVideo, isSetVideo]);

    class ExportSubtitleModal extends React.Component {
        constructor() {
            super();
            this.state = {
                showExportModal: false,
                value: '',
            };

            this.handleOpenExportModal = this.handleOpenExportModal.bind(this);
            this.handleCloseExportModal = this.handleCloseExportModal.bind(this);
        }

        handleOpenExportModal() {
            this.setState({ showExportModal: true });
        }

        handleCloseExportModal() {
            this.setState({ showExportModal: false });
        }

        render() {
            return (
                <>
                    <Style>
                        <Button onClick={this.handleOpenExportModal} style={{ marginRight: '20px' }}>
                            <Translate value="Export" />
                        </Button>
                    </Style>

                    <ExportModal
                        show={this.state.showExportModal}
                        onHide={this.handleCloseExportModal}
                        downloadSub={downloadSub}
                        downloadSubReference={downloadSubReference}
                    />
                </>
            );
        }
    }
    console.log(transcriptSource, 'transcriptSource');

    return (
        <Style className={`tool ${toolOpen ? 'tool-open' : ''} ${fullscreen ? 'd-none' : ''}`}>
            <Links />

            <DropdownButton
                id="dropdown-basic-button"
                title="Import"
                onChange={(event) => {
                    localStorage.setItem('selectValue', event.target.value);
                    handleImportShow();
                }}
                style={{ marginRight: '20px' }}
            >
                <Dropdown.Item
                    name="video"
                    onClick={(event) => {
                        localStorage.setItem('selectValue', event.target.name);
                        handleImportShow();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-camera-video "
                        style={{ marginRight: '10px' }}
                        viewBox="0 0 16 16"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
                        />
                    </svg>
                    Import Video
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    name="subtitles"
                    onClick={(event) => {
                        localStorage.setItem('selectValue', event.target.name);
                        handleImportShow();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-card-text"
                        style={{ marginRight: '10px' }}
                        viewBox="0 0 16 16"
                    >
                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                        <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
                    </svg>
                    Import Subtitle
                </Dropdown.Item>
            </DropdownButton>

            {/* <Dropdown
                onMouseLeave={() => {setShowDropdown(false);console.log(showDropdown);}}
                onMouseEnter={() => {setShowDropdown(!showDropdown); console.log(showDropdown);}}
                style={{ width: '166px' }}
                
                >
                <Dropdown.Toggle
                    className="main-style"
                    id="dropdown-basic"
                >
                    Open
                </Dropdown.Toggle>

                <Dropdown.Menu
                    show={showDropdown}
                    onChange={(event) => {
                        localStorage.setItem('selectValue', event.target.value);
                        handleImportShow();
                    }}
                    value="">
                    <Dropdown.Item value="video" as="button" onClick={()=>{localStorage.setItem('selectValue', 'video'); handleImportShow();}}>
                    Import Video
                    </Dropdown.Item>
                    <Dropdown.Item value="subtitles" as="button" onClick={()=>{localStorage.setItem('selectValue', 'subtitles'); handleImportShow();}}>
                    Import Subtitle
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown> */}
            <UploadModal
                show={importModalOpen}
                onHide={handleImportClose}
                textAreaValue={youtubeURL}
                textAreaValueChange={handleChange}
                onYouTubeChange={onYouTubeChange}
                onVideoChange={onVideoChange}
                onSubtitleChange={onSubtitleChange}
                onInputClick={onInputClick}
                clearData={clearData}
                onRecentVideoLinkClick={onRecentVideoLinkClick}
                setTranscribe={setTranscribe}
            />

            {/* <div className={`tool-button`}>
                <div
                    className="icon"
                    onClick={() => {
                        console.log('hamburger clicked');
                        setToolOpen(!toolOpen);
                    }}
                >
                    <HamburgerMenu
                        isOpen={toolOpen}
                        width={22}
                        height={18}
                        strokeWidth={2}
                        rotate={0}
                        color={'#fff'}
                        borderRadius={0}
                        animationDuration={0.5}
                    />
                </div>
            </div> */}

            <Style>
                {/* <div className="import ">
                    <div className="btn">
                        <Translate value="OPEN_VIDEO" />
                        <input className="file" type="file" onChange={onVideoChange} onClick={onInputClick} />
                    </div>
                    <div className="btn">
                        <Translate value="OPEN_SUB" />
                        <input className="file" type="file" onChange={onSubtitleChange} onClick={onInputClick} />
                    </div>
                    </div> */}
                {/* <div className="youtube-link ">
                        <textarea
                            className="youtube-textarea"
                            placeholder="Enter YouTube Link Here"
                            value={youtubeURL}
                            onChange={handleChange}
                            // onKeyPress={(e) => }
                        />
                        <div className="btn" onClick={onYouTubeChange}>
                            <Translate value="Fetch Video" />
                        </div>
                    </div> */}

                {/* <div className="operate"> */}
                {/* <div
                        className="btn"
                        onClick={() => {
                            if (window.confirm(t('CLEAR_TIP')) === true) {
                                // localStorage.setItem('videoSrc', '/sample.mp4');
                           //     window.localStorage.clear(); //added this to clear the remaining localstorage values
                                localStorage.setItem('videoSrc', null);
                                localStorage.setItem('isVideoPresent', false);
                                localStorage.setItem('lang', 'en');
                                localStorage.setItem('subtitleEnglish', null);
                                clearSubs();
                                clearSubsEnglish();
                                window.location.reload();
                            }
                        }}
                            >
                                <Translate value="CLEAR" />
                            </div>
                            <div className="btn" onClick={undoSubs}>
                                <Translate value="UNDO" />
                            </div>
                        </div>
                         <div className="operate">
                        <div className="btn" onClick={clearSubsHandler}>
                            <Translate value="Clear Subtitles" />
                        </div> */}
                {/* </div> */}

                <div
                    className={`
                            ${isSetVideo ? 'configuration' : 'hide-config'}
                        `}
                >
                    {/* <p className="configuration-heading"><b>Configuration Options</b></p> */}
                    <Button
                        onClick={() => {
                            handleTranscriptionShow();
                            const langTranscribe = localStorage.getItem('lang');
                            //  console.log("lang " + langTranscribe);
                            // setConfiguration('Same Language Subtitling');
                            // // setToggleState('Same Language Subtitling');
                            // // handleToggleChange();
                            // setIsSetConfiguration(true);
                            player?.pause();
                        }}
                        style={{ marginRight: '20px', backgroundColor: configuration === 'Same Language Subtitling' ? '#00CCFF' : '' }}
                    >
                        <Translate value="SAME_LANGUAGE" />
                    </Button>

                    {isTranslateClicked && (
                        <>
                            <Toggle
                                id="toggle-panel"
                                icons={false}
                                defaultChecked={'Subtitling'}
                                onChange={() => {
                                    handleToggleChange();
                                }}
                                aria-labelledby="toggle-panel"
                            />
                        </>
                    )}

                    <Button
                        onClick={() => {
                            handleTranslationShow();
                            // setConfiguration('Subtitling');
                            // // handleToggleChange();
                            // setIsSetConfiguration(true);
                            // clearSubs();
                            player?.pause();
                        }}
                        style={{ marginRight: '20px', backgroundColor: configuration === 'Subtitling' ? '#00CCFF' : '' }}
                    >
                        <Translate value="MAIN_LANGUAGE" />
                    </Button>

                    {/* <div
                            className="btn"
                            onClick={() => {
                                console.log('Configuration - sign');
                                setConfiguration('Sign Language Subtitling');
                                setIsSetConfiguration(true);
                            }}
                        >
                            <Translate value="SIGN_LANGUAGE" />
                        </div> */}
                    <ExportSubtitleModal />
                </div>

                <div className={`secondary-options ${isSetConfiguration ? '' : 'hide-secondary-options'}`}>
                    {/* {configuration === 'Subtitling' && (
                        <>
                            <div className="select-translation-api-container">
                                <p className="select-heading">
                                    <b>Translation Api</b>
                                </p>
                                <select
                                    value={translationApi}
                                    onChange={(e) => {
                                        // console.log(e.target.value);
                                        setTranslationApi(e.target.value);
                                        player?.pause();
                                    }}
                                >
                                    <option value="AI4Bharat">AI4Bharat</option>
                                    <option value="Google">Google</option>
                                </select>
                            </div>
                        </>
                    )} */}
                    {/* {configuration === 'Same Language Subtitling' && (
                        <>
                            <div className="select-translation-api-container">
                                <p className="select-heading">
                                    <b>Transcript Source</b>
                                </p>
                                <select
                                    value={transcriptSource}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                        setTranscriptSource(e.target.value);
                                        clearSubsEnglish();
                                        player?.pause();
                                    }}
                                >
                                    <option value="AI4Bharat">AI4Bharat</option>
                                    <option value="Youtube">Youtube</option>
                                    <option value="Manual Upload">Manual Upload</option>
                                </select>
                            </div>
                        </>)} */}
                    {window.crossOriginIsolated ? (
                        <div className="burn" onClick={burnSubtitles}>
                            <div className="btn">
                                <Translate value="EXPORT_VIDEO" />
                            </div>
                        </div>
                    ) : null}
                    {/*<p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                        <b>Export Your Subtitles</b>
                    </p>
                     <div className="export" style={{ marginTop: '-20px' }}>
                        <div className="btn" onClick={() => downloadSub('ass')}>
                            <Translate value="EXPORT_ASS" />
                        </div>
                        <div className="btn" onClick={() => downloadSub('srt')}>
                            <Translate value="EXPORT_SRT" />
                        </div>
                        <div className="btn" onClick={() => downloadSub('vtt')}>
                            <Translate value="EXPORT_VTT" />
                        </div>
                    </div>}
                    <p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                        <b>Export Transcript</b>
                    </p>
                    <div className="export" style={{ marginTop: '-20px' }}>
                        <div className="btn" onClick={() => downloadSubReference('ass')}>
                            <Translate value="EXPORT_ASS" />
                        </div>
                        <div className="btn" onClick={() => downloadSubReference('srt')}>
                            <Translate value="EXPORT_SRT" />
                        </div>
                        <div className="btn" onClick={() => downloadSubReference('vtt')}>
                            <Translate value="EXPORT_VTT" />
                        </div>
                    </div> */}
                </div>

                <div className="">{/* <BottomLinks /> */}</div>

                {/* <div className="translate">
                        <select
                            value={translate}
                            onChange={(event) => {
                                setTranslate(event.target.value);
                                localStorage.setItem('lang', event.target.value);
                            }}
                        >
                            {(languages[language] || languages.en).map((item) => (
                                <option key={item.key} value={item.key}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <div className="btn" onClick={onTranslate}>
                            <Translate value="TRANSLATE" />
                </div>
                    </div> */}

                {/* <div className="hotkey">
                    <span className="button-layout">
                        <Translate value="HOTKEY_01" />
                    </span>
                    <span className="button-layout">
                        <Translate value="HOTKEY_02" />
                    </span>
                </div> */}
            </Style>

            <Button onClick={() => clearData()} style={{ marginRight: '20px' }}>
                Clear
            </Button>

            <div className="save-transcript">
                <Button onClick={() => setShowFindReplaceModal(!showFindReplaceModal)}>Find / Replace</Button>
            </div>

            {showFindReplaceModal ? (
                <FindAndReplace
                    find={find}
                    replace={replace}
                    found={found}
                    setFind={setFind}
                    setReplace={setReplace}
                    setFound={setFound}
                    showFindAndReplace={showFindReplaceModal}
                    setShowFindAndReplace={setShowFindReplaceModal}
                    handleReplace={handleReplace}
                    handleReplaceAll={handleReplaceAll}
                    handleFind={handleFind}
                    currentFound={currentFound}
                    setCurrentFound={setCurrentFound}
                    configuration={configuration}
                />
            ) : null}
            <LoginForm showLogin={showLogin} setShowLogin={setShowLogin} />
            <div className="signin-btn" style={{ zIndex: 200 }}>
                {process.env.REACT_APP_LITE ? null : localStorage.getItem('user_id') ? (
                    <DropdownButton
                        id="dropdown-basic-button"
                        title={localStorage.getItem('username')}
                        style={{ marginRight: '20px' }}
                    >
                        <Dropdown.Item
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            Logout
                        </Dropdown.Item>
                    </DropdownButton>
                ) : (
                    <Button onClick={() => setShowLogin(!showLogin)} style={{ marginRight: '20px' }}>
                        Sign In
                    </Button>
                )}
            </div>
        </Style>
    );
}
