import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import NotificationSystem from 'react-notification-system';
import DT from 'duration-time-conversion';
import isEqual from 'lodash/isEqual';
import styled from 'styled-components';
import Tool from './components/Tool';
import Subtitles from './components/Subtitles';
import Player from './components/Player';
import Footer from './components/Footer';
import Loading from './components/Loading';
import ProgressBar from './components/ProgressBar';
import Links from './components/Links';
//import LoginForm from './components/Login';
// import BottomLinks from './components/BottomLinks';
import { getKeyCode } from './utils';
import Sub from './libs/Sub';
import SameLanguageSubtitles from './components/SameLanguageSubtitle';
import SignLanguageSubtitles from './components/SignLanguageSubtitle';
import FindAndReplace from './components/FindAndReplace';
// import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import debounce from 'lodash/debounce';
import { render } from 'react-dom';
import Header from './components/Tool';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SaveTranscriptAPI from './redux/actions/api/Transcript/SaveTranscript';
import { sub2vtt } from './libs/readSub';
import FirstTimeModal from './components/FirstTimeModal';

const Style = styled.div`
    height: 100%;
    width: 100%;

    .fullscreen-style {
        position: relative;
        top: 50%;
        -webkit-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }

    .main {
        display: flex;
        height: calc(100% - 200px);

        .main-center {
            flex: 1;
            display: flex;
            flex-direction: column;

            .header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .player {
                flex: 1;
            }
        }

        .subtitles {
            width: 300px;
        }

        .tool {
            width: 300px;
        }
    }

    .footer {
        height: 200px;
    }

    .full-screen-btn {
        position: absolute;
        bottom: 25px;
        right: 25px;
        z-index: 999;
    }

    .save {
        margin: auto;
        margin-top: 20px;
        display: block;
    }

    .btn-parent-div {
        display: block;
        background: #000;
    }
`;

export default function App({ defaultLang }) {
    const subtitleHistory = useRef([]);
    const notificationSystem = useRef(null);
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState('');
    const [processing, setProcessing] = useState(0);
    const [language, setLanguage] = useState(defaultLang);
    const [subtitle, setSubtitleOriginal] = useState([]);
    const [subtitleEnglish, setSubtitleEnglish] = useState([]);
    const [waveform, setWaveform] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [clearedSubs, setClearedSubs] = useState(false);
    const [subsBeforeClear, setSubsBeforeClear] = useState([]);
    const [configuration, setConfiguration] = useState('');
    const [enableConfiguration, setEnableConfiguration] = useState(false);
    const [isSetVideo, setIsSetVideo] = useState(false);
    const [isSetConfiguration, setIsSetConfiguration] = useState(false);
    // const [showLogin, setShowLogin] = useState(false);
    // const [translationApi, setTranslationApi] = useState('AI4Bharat');
    const [isTranslateClicked, setIsTranslateClicked] = useState(false);
    const [height, setHeight] = useState(100);
    //  const [visited, setVisited] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const DisplayPopup = () => {
        let visited = localStorage.getItem('hasVisited');
        console.log('visited initial ' + visited);
        if (visited) {
            setShowPopup(false);
        } else {
            localStorage.setItem('hasVisited', true);
            //  console.log(localStorage.getItem('hasVisited'));
            setShowPopup(true);
        }
        console.log('showPopup ' + showPopup);
        return <>{showPopup ? <div>Test </div> : console.log('in else')}</>;
    };
    const [transcriptSource, setTranscriptSource] = useState(process.env.REACT_APP_LITE ? 'Custom' : 'AI4Bharat');
    const [showFindAndReplace, setShowFindAndReplace] = useState(false);
    const [find, setFind] = useState('');
    const [replace, setReplace] = useState('');
    const [found, setFound] = useState([]);
    const [currentFound, setCurrentFound] = useState();
    const [fullscreen, setFullscreen] = useState(false);
    const [firstTimeOpen, setFirstTimeOpen] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(()=>{
        if (localStorage.getItem('registered')) {
          setFirstTimeOpen(false);
        } else if (!localStorage.getItem('registered')) {
          localStorage.setItem('registered', true);
          setFirstTimeOpen(true);
        }
    }, [])

    /* For Transcription Modal */
    const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
    const handleTranscriptionClose = () => setTranscriptionModalOpen(false);
    const handleTranscriptionShow = () => setTranscriptionModalOpen(true);

    /* For Translation Modal */
    const [translationModalOpen, setTranslationModalOpen] = useState(false);
    const handleTranslationClose = () => {
        setTranslationModalOpen(false);
        setIsTranslateClicked(true);
    };
    const handleTranslationShow = () => setTranslationModalOpen(true);

    const newSub = useCallback((item) => new Sub(item), []);
    const hasSub = useCallback((sub) => subtitle.indexOf(sub), [subtitle]);
    const hasSubEnglish = useCallback((sub) => subtitleEnglish.indexOf(sub), [subtitleEnglish]);

    const resize = useCallback(() => {
        setHeight(document.body.clientHeight - 240);
    }, [setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    const formatSub = useCallback(
        (sub) => {
            if (Array.isArray(sub)) {
                return sub.map((item) => newSub(item));
            }
            return newSub(sub);
        },
        [newSub],
    );

    const copySubs = useCallback(() => formatSub(subtitle), [subtitle, formatSub]);
    const copySubsEnglish = useCallback(() => formatSub(subtitleEnglish), [subtitleEnglish, formatSub]);
    //const copySubsEnglish = useCallback(() => formatSub(subtitle), [subtitle, formatSub]);
    // useEffect(() => {
    //     //localStorage.setItem('lang', 'en');

    //     if (localStorage.getItem('videoSrc') === null) {
    //         localStorage.setItem('videoSrc', '/sample.mp4');
    //     }
    // }, []);

    const setSubtitle = useCallback(
        (newSubtitle, saveToHistory = true) => {
            if (!isEqual(newSubtitle, subtitle)) {
                if (saveToHistory) {
                    if (subtitleHistory.current.length >= 1000) {
                        subtitleHistory.current.shift();
                    }
                    subtitleHistory.current.push(formatSub(subtitle));
                }
                window.localStorage.setItem('subtitle', JSON.stringify(newSubtitle));
                setSubtitleOriginal(newSubtitle);
                // setSubtitleEnglish(newSubtitle);
            }
        },
        [subtitle, setSubtitleOriginal, formatSub],
    );

    const undoSubs = useCallback(() => {
        const subs = subtitleHistory.current.pop();
        if (subs) {
            setSubtitle(subs, false);
        }
    }, [setSubtitle, subtitleHistory]);

    const clearSubs = useCallback(() => {
        setSubtitle([]);
        subtitleHistory.current.length = 0;
    }, [setSubtitle, subtitleHistory]);

    // const clearSubsEnglish = useCallback(() => {
    //     localStorage.removeItem('subtitleEnglish');
    //     setSubtitleEnglish([]);
    // }, [setSubtitleEnglish]); //maybe here

    const clearSubsEnglish = useCallback(() => {
        setSubtitleEnglish([]);
        subtitleHistory.current.length = 0;
    }, [setSubtitleEnglish, subtitleHistory]);

    const checkSub = useCallback(
        (sub) => {
            const index = hasSub(sub);
            if (index < 0) return;
            const previous = subtitle[index - 1];
            return (previous && sub.startTime < previous.endTime) || !sub.check || sub.duration < 0.2;
        },
        [subtitle, hasSub],
    );

    const notify = useCallback(
        (obj) => {
            // https://github.com/igorprado/react-notification-system
            const notification = notificationSystem.current;
            notification.clearNotifications();
            notification.addNotification({
                position: 'tc',
                dismissible: 'none',
                autoDismiss: 2,
                message: obj.message,
                level: obj.level,
            });
        },
        [notificationSystem],
    );

    const removeSub = useCallback(
        (sub) => {
            const index = hasSub(sub);
            const index2 = hasSubEnglish(sub);
            console.log(subtitleEnglish);
            console.log(index, index2);
            if (index >= 0) {
                const subs = copySubs();
                subs.splice(index, 1);
                setSubtitle(subs);
            }
            if ((index >= 0 || index2 >= 0) && subtitleEnglish) {
                console.log('here');
                const subsEnglish = copySubsEnglish();
                subsEnglish.splice(index >= 0 ? index : index2, 1);
                console.log(subsEnglish);
                setSubtitleEnglish(subsEnglish);
                localStorage.setItem('subtitleEnglish', JSON.stringify(subsEnglish));
            }
        },
        [hasSub, copySubs, setSubtitle, copySubsEnglish, subtitleEnglish],
    );

    const addSub = useCallback(
        (index, sub) => {
            const subs = copySubs();
            subs.splice(index, 0, formatSub(sub));
            setSubtitle(subs);
            if (subtitleEnglish) {
                const subsEnglish = copySubsEnglish();
                subsEnglish.splice(index, 0, formatSub(sub));
                setSubtitleEnglish(subsEnglish);
                localStorage.setItem('subtitleEnglish', JSON.stringify(subsEnglish));
            }
        },
        [copySubs, setSubtitle, formatSub, copySubsEnglish, subtitleEnglish],
    );

    const updateSub = useCallback(
        (sub, obj) => {
            const index = hasSub(sub);
            if (index < 0) return;
            const subs = copySubs();
            const subClone = formatSub(sub);
            Object.assign(subClone, obj);
            if (subClone.check) {
                subs[index] = subClone;
                setSubtitle(subs);
            }
        },
        [hasSub, copySubs, setSubtitle, formatSub],
    );
    const updateSubEnglish = useCallback(
        (sub, obj) => {
            const index = hasSubEnglish(sub);
            if (index < 0) return;
            const subs = copySubsEnglish();
            const subClone = formatSub(sub);
            Object.assign(subClone, obj);
            if (subClone.check) {
                subs[index] = subClone;
                setSubtitleEnglish(subs);
            }
        },
        [hasSubEnglish, copySubsEnglish, setSubtitleEnglish, formatSub],
    );

    const updateSubTranslate = useCallback(
        (sub, obj, index) => {
            const subs = copySubs();
            const subClone = formatSub(sub);
            Object.assign(subClone, obj);
            if (subClone.check) {
                subs[index] = subClone;
                setSubtitle(subs);
            }
        },
        [copySubs, setSubtitle, formatSub],
    );

    const mergeSub = useCallback(
        (sub) => {
            const index = hasSub(sub);
            const index2 = hasSubEnglish(sub);
            if (index >= 0) {
                const subs = copySubs();
                const next = subs[index + 1];
                if (next) {
                    const merge = newSub({
                        start: sub.start,
                        end: next.end,
                        text: sub.text.trim() + '\n' + next.text.trim(),
                    });
                    subs[index] = merge;
                    subs.splice(index + 1, 1);
                    setSubtitle(subs);
                }
            }
            if ((index >= 0 || index2 >= 0) && subtitleEnglish) {
                const subsEnglish = copySubsEnglish();
                const nextEnglish = subsEnglish[index >= 0 ? index + 1 : index2 + 1];
                if (!nextEnglish) return;
                const mergeEnglish = newSub({
                    start: sub.start,
                    end: nextEnglish.end,
                    text: subsEnglish[index >= 0 ? index : index2].text.trim() + '\n' + nextEnglish.text.trim(),
                });
                subsEnglish[index >= 0 ? index : index2] = mergeEnglish;
                subsEnglish.splice(index >= 0 ? index + 1 : index2 + 1, 1);
                setSubtitleEnglish(subsEnglish);
                localStorage.setItem('subtitleEnglish', JSON.stringify(subsEnglish));
            }
        },
        [hasSub, copySubs, setSubtitle, newSub, copySubsEnglish, subtitleEnglish],
    );

    const splitSub = useCallback(
        (sub, start) => {
            const index = hasSub(sub);
            const index2 = hasSubEnglish(sub);
            if ((index < 0 && index2 < 0) || !sub.text || !start) return;
            // if (index >= 0) {
            // const subs = copySubs();
            // const text1 = sub.text.slice(0, start).trim();
            // const text2 = sub.text.slice(start).trim();
            // if (!text1 || !text2) return;
            // const splitDuration = (sub.duration * (start / sub.text.length)).toFixed(3);
            // if (splitDuration < 0.2 || sub.duration - splitDuration < 0.2) return;
            // subs.splice(index, 1);
            // const middleTime = DT.d2t(sub.startTime + parseFloat(splitDuration));
            // subs.splice(
            //     index,
            //     0,
            //     newSub({
            //         start: sub.start,
            //         end: middleTime,
            //         text: text1,
            //     }),
            // );
            // subs.splice(
            //     index + 1,
            //     0,
            //     newSub({
            //         start: middleTime,
            //         end: sub.end,
            //         text: text2,
            //     }),
            // );
            // setSubtitle(subs);
            // }
            if (index2 >= 0) {
                const subsEnglish = copySubsEnglish();
                const text1 = sub.text.slice(0, start).trim();
                const text2 = sub.text.slice(start).trim();
                if (!text1 || !text2) return;
                const splitDuration = (sub.duration * (start / sub.text.length)).toFixed(3);
                if (splitDuration < 0.2 || sub.duration - splitDuration < 0.2) return;
                subsEnglish.splice(index2, 1);
                const middleTime = DT.d2t(sub.startTime + parseFloat(splitDuration));
                subsEnglish.splice(
                    index2,
                    0,
                    newSub({
                        start: sub.start,
                        end: middleTime,
                        text: text1,
                    }),
                );
                subsEnglish.splice(
                    index2 + 1,
                    0,
                    newSub({
                        start: middleTime,
                        end: sub.end,
                        text: text2,
                    }),
                );
                setSubtitleEnglish(subsEnglish);
                localStorage.setItem('subtitleEnglish', JSON.stringify(subsEnglish));
            }
        },
        [hasSub, hasSubEnglish, copySubs, copySubsEnglish, setSubtitle, setSubtitleEnglish, newSub],
    );

    const onKeyDown = useCallback(
        (event) => {
            const keyCode = getKeyCode(event);
            switch (keyCode) {
                case 32:
                    event.preventDefault();
                    if (player) {
                        if (playing) {
                            player.pause();
                        } else {
                            player.play();
                        }
                    }
                    break;
                case 90:
                    event.preventDefault();
                    if (event.metaKey) {
                        undoSubs();
                    }
                    break;
                case 70:
                    event.preventDefault();
                    if (
                        event.ctrlKey &&
                        (configuration === 'Subtitling' || configuration === 'Same Language Subtitling')
                    ) {
                        event.preventDefault();
                        player?.pause();
                        setShowFindAndReplace(true);
                    }
                    break;
                default:
                    break;
            }
        },
        [player, playing, undoSubs, configuration],
    );

    const handleFind = () => {
        let foundIndices = [];
        if (configuration === 'Subtitling') {
            for (let i = 0; i < subtitle.length; i++) {
                const sub = subtitle[i];
                if (sub.text.toLowerCase().includes(find.toLowerCase())) {
                    foundIndices.push(i);
                }
            }
        } else if (configuration === 'Same Language Subtitling') {
            for (let i = 0; i < subtitleEnglish.length; i++) {
                const sub = subtitleEnglish[i];
                if (sub.text.toLowerCase().includes(find.toLowerCase())) {
                    foundIndices.push(i);
                }
            }
        }
        setFound(foundIndices);
        if (foundIndices.length > 0) {
            setCurrentFound(0);
        }
    };

    const handleReplace = () => {
        if (currentFound < 0 || currentFound >= found.length) return;
        const index = found[currentFound];
        const sub = configuration === 'Subtitling' ? subtitle[index] : subtitleEnglish[index];
        const text = sub.text.replace(new RegExp(find, 'gi'), replace);
        if (configuration === 'Subtitling') {
            const subs = copySubs();
            subs[index].text = text;
            setSubtitle(subs);
        } else if (configuration === 'Same Language Subtitling') {
            const subs = copySubsEnglish();
            subs[index].text = text;
            setSubtitleEnglish(subs);
        }
        setCurrentFound(currentFound + 1);
        setFound(found.filter((i) => i !== index));
    };

    const handleReplaceAll = () => {
        if (found.length === 0) return;
        if (configuration === 'Subtitling') {
            const subs = copySubs();
            for (let i = 0; i < found.length; i++) {
                const index = found[i];
                subs[index].text = subtitle[index].text.replace(new RegExp(find, 'gi'), replace);
            }
            setSubtitle(subs);
        } else if (configuration === 'Same Language Subtitling') {
            const subs = copySubsEnglish();
            for (let i = 0; i < found.length; i++) {
                const index = found[i];
                subs[index].text = subtitleEnglish[index].text.replace(new RegExp(find, 'gi'), replace);
            }
            setSubtitleEnglish(subs);
        }
        setFound([]);
        setCurrentFound();
    };

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useMemo(() => {
        const currentIndex =
            configuration === 'Subtitling'
                ? subtitle.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime)
                : subtitleEnglish.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime);
        setCurrentIndex(currentIndex);
    }, [currentTime, subtitle]);

    useEffect(() => {
        // console.log(subtitle);
        // console.log(translationApi);
        const localSubtitleString = window.localStorage.getItem('subtitle');
        //   console.log(localSubtitleString)
        const localSubtitleEnglish = window.localStorage.getItem('subtitleEnglish');
        //  console.log(localSubtitleEnglish)
        // const fetchSubtitle = () =>
        //     fetch('/sample.json')
        //         .then((res) => res.json())
        //         .then((res) => {
        //             setSubtitleOriginal(res.map((item) => new Sub(item)));
        //         });

        if (localSubtitleString) {
            try {
                const localSubtitle = JSON.parse(localSubtitleString);
                if (localSubtitle.length) {
                    setSubtitleOriginal(localSubtitle.map((item) => new Sub(item)));
                } else {
                    // fetchSubtitle();
                }
            } catch (error) {
                // fetchSubtitle();
            }
        } else {
            // fetchSubtitle();
        }
        if (localSubtitleEnglish) {
            try {
                const localSubtitle = JSON.parse(localSubtitleEnglish);
                if (localSubtitle.length) {
                    setSubtitleEnglish(localSubtitle.map((item) => new Sub(item)));
                } else {
                    setSubtitleEnglish([]);
                }
            } catch (error) {
                setSubtitleEnglish([]);
            }
        } else {
            // fetchSubtitle();
        }
    }, [setSubtitleOriginal, setSubtitleEnglish]);

    const props = {
        player,
        setPlayer,
        subtitle,
        setSubtitle,
        waveform,
        setWaveform,
        currentTime,
        setCurrentTime,
        currentIndex,
        setCurrentIndex,
        playing,
        setPlaying,
        language,
        setLanguage,
        loading,
        setLoading,
        setProcessing,
        subtitleHistory,
        subtitleEnglish,
        setSubtitleEnglish,
        notify,
        newSub,
        hasSub,
        checkSub,
        removeSub,
        addSub,
        undoSubs,
        clearSubs,
        updateSub,
        formatSub,
        mergeSub,
        splitSub,
        clearSubsEnglish,
        updateSubEnglish,
        setSubtitleOriginal,
        clearedSubs,
        setClearedSubs,
        subsBeforeClear,
        setSubsBeforeClear,
        configuration,
        setConfiguration,
        updateSubTranslate,
        enableConfiguration,
        setEnableConfiguration,
        isSetVideo,
        setIsSetVideo,
        isSetConfiguration,
        setIsSetConfiguration,
        // translationApi,
        // setTranslationApi,
        isTranslateClicked,
        setIsTranslateClicked,
        transcriptSource,
        setTranscriptSource,
        showFindAndReplace,
        setShowFindAndReplace,
        find,
        setFind,
        replace,
        setReplace,
        found,
        setFound,
        handleReplace,
        handleReplaceAll,
        handleFind,
        currentFound,
        setCurrentFound,
        transcriptionModalOpen,
        setTranscriptionModalOpen,
        handleTranscriptionClose,
        handleTranscriptionShow,
        translationModalOpen,
        setTranslationModalOpen,
        handleTranslationClose,
        handleTranslationShow,
        fullscreen,
        showLogin, 
        setShowLogin,
    };

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {!fullscreen ? 'Fullscreen Video with Panels' : 'Exit'}
        </Tooltip>
    );

    const handleFullscreen = () => {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen =
            docEl.requestFullscreen ||
            docEl.mozRequestFullScreen ||
            docEl.webkitRequestFullScreen ||
            docEl.msRequestFullscreen;
        var cancelFullScreen =
            doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (
            !doc.fullscreenElement &&
            !doc.mozFullScreenElement &&
            !doc.webkitFullscreenElement &&
            !doc.msFullscreenElement
        ) {
            requestFullScreen.call(docEl);
            setFullscreen(true);
        } else {
            setFullscreen(false);
            cancelFullScreen.call(doc);
        }
    };

    const saveTranscript = async () => {
        if (localStorage.getItem('subtitle')) {
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
            console.log(resp);
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
        }
    };

    return (
        <Style>
            {/* <Header /> */}
            <Tool {...props} style={{ marginBottom: '20px' }} />
            <div className={`${fullscreen ? 'fullscreen-style' : ''} main`}>
                <div className="main-center">
                    <div className="header">
                        {/* <Links /> */}
                        {/* <div style={{zIndex: 200}}>
                            {localStorage.getItem("user_id") ? 
                                <div>
                                    <div className="user-details">
                                        <div className='user-initials'>{localStorage.getItem("first_name")?.charAt(0).toUpperCase()}{localStorage.getItem("last_name")?.charAt(0).toUpperCase()}</div>
                                    </div>
                                    <ul className='user-menu'>
                                        <li onClick={() => {localStorage.clear(); window.location.reload()}}>Logout</li>
                                    </ul>
                                </div> 
                                : 
                                <span onClick={() => setShowLogin(!showLogin)} className="loginicon">
                                    Sign In
                                </span>}
                        </div> */}
                    </div>
                    <Player {...props} />
                </div>
                {configuration === '' && <></>}
                {(configuration === 'Subtitling' || translationModalOpen) && (
                    <div style={{ overflow: 'hidden', background: '#000' }}>
                        {/* <Subtitles
                            currentIndex={props.currentIndex}
                            subtitle={props.subtitleEnglish}
                            checkSub={props.checkSub}
                            player={props.player}
                            updateSub={props.updateSubEnglish}
                            language={props.language}
                            setLanguage={props.setLanguage}
                            setLoading={props.setLoading}
                            subtitleEnglish={props.subtitleEnglish}
                            formatSub={props.formatSub}
                            setSubtitle={props.setSubtitle}
                            notify={props.notify}
                            isPrimary={false}
                            configuration={props.configuration}
                            setConfiguration={props.setConfiguration}
                            updateSubOriginal={props.updateSubTranslate}
                            translationApi={props.translationApi}
                        />*/}

                        {/* <ScrollSync>
                            <div style={{ display: 'flex', position: 'relative', height:`90%`}}>
                                <ScrollSyncPane>
                                    <div style={{overflow: 'auto'}}>
                                            <Subtitles
                                            currentIndex={props.currentIndex}
                                            subtitle={props.subtitleEnglish} //changed from subtitleEnglish to subtitle
                                            checkSub={props.checkSub}
                                            player={props.player}
                                            updateSub={props.updateSubEnglish} 
                                            language={props.language}
                                            setLanguage={props.setLanguage}
                                            setLoading={props.setLoading}
                                            subtitleEnglish={props.subtitleEnglish}
                                            formatSub={props.formatSub}
                                            setSubtitle={props.setSubtitle}
                                            notify={props.notify}
                                            isPrimary={false}
                                            configuration={props.configuration}
                                            setConfiguration={props.setConfiguration}
                                            updateSubOriginal={props.updateSubTranslate}
                                            translationApi={props.translationApi}
                                            />
                                    </div>
                                </ScrollSyncPane>
                                <ScrollSyncPane>
                                    <div style={{overflow: 'auto'}}>
                                        <Subtitles
                                            currentIndex={props.currentIndex}
                                            subtitle={props.subtitle} //subtitle to subtitleEnglish?
                                            checkSub={props.checkSub}
                                            player={props.player}
                                            updateSub={props.updateSub}
                                            language={props.language}
                                            setLanguage={props.setLanguage}
                                            setLoading={props.setLoading}
                                            subtitleEnglish={props.subtitleEnglish}
                                            formatSub={props.formatSub}
                                            setSubtitle={props.setSubtitle}
                                            notify={props.notify}
                                            isPrimary={true}
                                            clearedSubs={props.clearedSubs} //extra
                                            setClearedSubs={props.setClearedSubs} //extra
                                            setSubtitleOriginal={props.setSubtitleOriginal} //extra
                                            configuration={props.configuration}
                                            setConfiguration={props.setConfiguration}
                                            translationApi={props.translationApi}
                                            isTranslateClicked={props.isTranslateClicked} //added
                                            setIsTranslateClicked={props.setIsTranslateClicked} //added
                                        />
                                    </div>
                                </ScrollSyncPane>
                            </div>
                            </ScrollSync> */}

                        <div style={{ display: 'flex', position: 'relative', height: `90%`, zIndex: '200' }}>
                            <Subtitles
                                currentIndex={props.currentIndex}
                                subtitle={props.subtitleEnglish} //changed from subtitleEnglish to subtitle
                                checkSub={props.checkSub}
                                player={props.player}
                                updateSub={props.updateSubEnglish}
                                language={props.language}
                                setLanguage={props.setLanguage}
                                setLoading={props.setLoading}
                                subtitleEnglish={props.subtitleEnglish}
                                formatSub={props.formatSub}
                                setSubtitle={props.setSubtitle}
                                notify={props.notify}
                                isPrimary={false}
                                configuration={props.configuration}
                                setConfiguration={props.setConfiguration}
                                updateSubOriginal={props.updateSubTranslate}
                                // translationApi={props.translationApi}
                                found={props.found}
                                currentFound={props.currentFound}
                                handleTranslationClose={props.handleTranslationClose}
                                handleTranslationShow={props.handleTranslationShow}
                                translationModalOpen={props.translationModalOpen}
                            />
                            {console.log(props.subtitle)}
                            <Subtitles
                                currentIndex={props.currentIndex}
                                subtitle={props.subtitle} //subtitle to subtitleEnglish?
                                checkSub={props.checkSub}
                                player={props.player}
                                updateSub={props.updateSub}
                                language={props.language}
                                setLanguage={props.setLanguage}
                                setLoading={props.setLoading}
                                subtitleEnglish={props.subtitleEnglish}
                                formatSub={props.formatSub}
                                setSubtitle={props.setSubtitle}
                                notify={props.notify}
                                isPrimary={true}
                                clearedSubs={props.clearedSubs} //extra
                                setClearedSubs={props.setClearedSubs} //extra
                                setSubtitleOriginal={props.setSubtitleOriginal} //extra
                                configuration={props.configuration}
                                setConfiguration={props.setConfiguration}
                                // translationApi={props.translationApi}
                                //   isTranslateClicked={props.isTranslateClicked} //added
                                //  setIsTranslateClicked={props.setIsTranslateClicked} //added
                                found={props.found}
                                currentFound={props.currentFound}
                            />
                        </div>
                    </div>
                )}

                {configuration === 'Sign Language Subtitling' && (
                    <>
                        <SignLanguageSubtitles
                            currentIndex={props.currentIndex}
                            subtitle={props.subtitleEnglish}
                            checkSub={props.checkSub}
                            player={props.player}
                            updateSub={props.updateSubEnglish}
                            language={props.language}
                            setLanguage={props.setLanguage}
                            setLoading={props.setLoading}
                            subtitleEnglish={props.subtitleEnglish}
                            formatSub={props.formatSub}
                            setSubtitle={props.setSubtitle}
                            notify={props.notify}
                            isPrimary={false}
                            configuration={props.configuration}
                            setConfiguration={props.setConfiguration}
                            updateSubOriginal={props.updateSubTranslate}
                        />
                        <SignLanguageSubtitles
                            currentIndex={props.currentIndex}
                            subtitle={props.subtitle}
                            checkSub={props.checkSub}
                            player={props.player}
                            updateSub={props.updateSub}
                            language={props.language}
                            setLanguage={props.setLanguage}
                            setLoading={props.setLoading}
                            subtitleEnglish={props.subtitleEnglish}
                            formatSub={props.formatSub}
                            setSubtitle={props.setSubtitle}
                            notify={props.notify}
                            isPrimary={true}
                            clearedSubs={props.clearedSubs}
                            setClearedSubs={props.setClearedSubs}
                            setSubtitleOriginal={props.setSubtitleOriginal}
                            configuration={props.configuration}
                            setConfiguration={props.setConfiguration}
                        />
                    </>
                )}

                {(configuration === 'Same Language Subtitling' || transcriptionModalOpen) && (
                    <>
                        {/* original same lang subtitle config */}
                        {/* <SameLanguageSubtitles
                            currentIndex={props.currentIndex}
                            subtitle={props.subtitle}
                            checkSub={props.checkSub}
                            player={props.player}
                            updateSub={props.updateSub}
                            language={props.language}
                            setLanguage={props.setLanguage}
                            setLoading={props.setLoading}
                            subtitleEnglish={props.subtitleEnglish}
                            formatSub={props.formatSub}
                            setSubtitle={props.setSubtitle}
                            notify={props.notify}
                            isPrimary={true}
                            clearedSubs={props.clearedSubs}
                            setClearedSubs={props.setClearedSubs}
                            setSubtitleOriginal={props.setSubtitleOriginal}
                            configuration={props.configuration}
                            setConfiguration={props.setConfiguration}
                            clearSubs={props.clearSubs}
                            setSubtitleEnglish={props.setSubtitleEnglish}
                            
                        /> */}

                        {/* final */}
                        <SameLanguageSubtitles
                            currentIndex={props.currentIndex}
                            subtitle={props.subtitleEnglish} //here
                            checkSub={props.checkSub}
                            player={props.player}
                            updateSub={props.updateSubEnglish} //here
                            language={props.language}
                            setLanguage={props.setLanguage}
                            setLoading={props.setLoading}
                            subtitleEnglish={props.subtitleEnglish} //change
                            formatSub={props.formatSub}
                            setSubtitle={props.setSubtitle}
                            notify={props.notify}
                            isPrimary={true}
                            clearedSubs={props.clearedSubs}
                            setClearedSubs={props.setClearedSubs}
                            setSubtitleOriginal={props.setSubtitleOriginal}
                            configuration={props.configuration}
                            setConfiguration={props.setConfiguration}
                            clearSubs={props.clearSubs}
                            setSubtitleEnglish={props.setSubtitleEnglish}
                            updateSubOriginal={props.updateSubTranslate}
                            // translationApi={props.translationApi}
                            transcriptSource={props.transcriptSource}
                            setTranscriptSource={props.setTranscriptSource}
                            found={props.found}
                            currentFound={props.currentFound}
                            transcriptionModalOpen={props.transcriptionModalOpen}
                            handleTranscriptionClose={props.handleTranscriptionClose}
                        />
                    </>
                )}
                {/* <Tool {...props} /> */}
                <FindAndReplace
                    find={props.find}
                    replace={props.replace}
                    found={props.found}
                    setFind={props.setFind}
                    setReplace={props.setReplace}
                    setFound={props.setFound}
                    showFindAndReplace={props.showFindAndReplace}
                    setShowFindAndReplace={props.setShowFindAndReplace}
                    handleReplace={props.handleReplace}
                    handleReplaceAll={props.handleReplaceAll}
                    handleFind={props.handleFind}
                    currentFound={props.currentFound}
                    setCurrentFound={props.setCurrentFound}
                    configuration={props.configuration}
                />
            </div>
            {isSetVideo && <Footer {...props} />}
            {loading ? <Loading loading={loading} /> : null}
            {processing > 0 && processing < 100 ? <ProgressBar processing={processing} /> : null}
            <NotificationSystem ref={notificationSystem} allowHTML={true} />
            {/* <BottomLinks /> */}

            <OverlayTrigger placement="left" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
                <Button className="full-screen-btn" onClick={() => handleFullscreen()}>
                    {fullscreen ? (
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

            <FirstTimeModal 
                show={firstTimeOpen}
                handleClose={() => setFirstTimeOpen(false)}
                setLoginOpen={() => setShowLogin(true)}
            />
        </Style>
    );
}
