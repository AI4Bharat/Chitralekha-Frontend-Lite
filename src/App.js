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
import LoginForm from './components/Login';
// import BottomLinks from './components/BottomLinks';
import { getKeyCode } from './utils';
import Sub from './libs/Sub';
import SameLanguageSubtitles from './components/SameLanguageSubtitle';
import SignLanguageSubtitles from './components/SignLanguageSubtitle';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import debounce from 'lodash/debounce';
import {render} from 'react-dom';
import Header from './components/Tool';


const Style = styled.div`
    height: 100%;
    width: 100%;

    .main {
        display: flex;
        height: calc(100% - 200px);

        .player {
            flex: 1;
        }

        .subtitles {
            width: 250px;
        }

        .tool {
            width: 300px;
        }
    }

    .footer {
        height: 200px;
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
    const [showLogin, setShowLogin] = useState(false);
    const [translationApi, setTranslationApi] = useState('AI4Bharat');
    const [isTranslateClicked, setIsTranslateClicked] = useState(false);
    const [height, setHeight] = useState(100);
  //  const [visited, setVisited] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const DisplayPopup = () =>{
        let visited = localStorage.getItem('hasVisited');
        console.log('visited initial '+visited);
        if(visited){
            setShowPopup(false);
        }
        else{
            localStorage.setItem('hasVisited', true);
          //  console.log(localStorage.getItem('hasVisited'));
            setShowPopup(true);
        }
        console.log('showPopup '+showPopup);
            return (
                <>
                {showPopup
                    ?(<div>Test </div>)
                    : console.log('in else')
                }
                </>
            );
        
    }

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
            if (index < 0) return;
            const subs = copySubs();
            subs.splice(index, 1);
            setSubtitle(subs);
            if (subtitleEnglish) {
                //console.log('here');
                const subsEnglish = copySubsEnglish();
                subsEnglish.splice(index, 1);
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
            if (index < 0) return;
            const subs = copySubs();
            const next = subs[index + 1];
            if (!next) return;
            const merge = newSub({
                start: sub.start,
                end: next.end,
                text: sub.text.trim() + '\n' + next.text.trim(),
            });
            subs[index] = merge;
            subs.splice(index + 1, 1);
            setSubtitle(subs);
            if (subtitleEnglish) {
                const subsEnglish = copySubsEnglish();
                const nextEnglish = subsEnglish[index + 1];
                if (!nextEnglish) return;
                const mergeEnglish = newSub({
                    start: sub.start,
                    end: nextEnglish.end,
                    text: subsEnglish[index].text.trim() + '\n' + nextEnglish.text.trim(),
                });
                subsEnglish[index] = mergeEnglish;
                subsEnglish.splice(index + 1, 1);
                setSubtitleEnglish(subsEnglish);
                localStorage.setItem('subtitleEnglish', JSON.stringify(subsEnglish));
            }
        },
        [hasSub, copySubs, setSubtitle, newSub, copySubsEnglish, subtitleEnglish],
    );

    const splitSub = useCallback(
        (sub, start) => {
            const index = hasSub(sub);
            if (index < 0 || !sub.text || !start) return;
            const subs = copySubs();
            const text1 = sub.text.slice(0, start).trim();
            const text2 = sub.text.slice(start).trim();
            if (!text1 || !text2) return;
            const splitDuration = (sub.duration * (start / sub.text.length)).toFixed(3);
            if (splitDuration < 0.2 || sub.duration - splitDuration < 0.2) return;
            subs.splice(index, 1);
            const middleTime = DT.d2t(sub.startTime + parseFloat(splitDuration));
            subs.splice(
                index,
                0,
                newSub({
                    start: sub.start,
                    end: middleTime,
                    text: text1,
                }),
            );
            subs.splice(
                index + 1,
                0,
                newSub({
                    start: middleTime,
                    end: sub.end,
                    text: text2,
                }),
            );
            setSubtitle(subs);
        },
        [hasSub, copySubs, setSubtitle, newSub],
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
                default:
                    break;
            }
        },
        [player, playing, undoSubs],
    );

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useMemo(() => {
        const currentIndex = subtitle.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime);
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
        translationApi,
        setTranslationApi,
        isTranslateClicked,
        setIsTranslateClicked,
    };

    return (
        
        <Style>
      {/* <Header /> */}
      <Tool {...props} />
            <div className="main">
               
                <DisplayPopup />
                {/* <Links /> */}
                <Player {...props} />
                {configuration === '' && <></>}
                {configuration === 'Subtitling' && (
                    <div className={{overflow: 'visible'}}>
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
                        {/* here */}
                  
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
                          <ScrollSync>
                            <div style={{ display: 'flex', position: 'relative', height:`90%`}}>
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
                         </ScrollSync>
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

                {configuration === 'Same Language Subtitling' && (
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
                            translationApi={props.translationApi}
                        />
                       {// this.handleOpenTranscriptionModal();
                       }
                    </>
                )}
                {/* <LoginForm showLogin={showLogin} setShowLogin={setShowLogin}/>
                <div style={{zIndex: 200}}>
                    {localStorage.getItem("user_id") ? 
                        <div>
                            <div className="user-details">
                                <div className='user-initials'>{localStorage.getItem("first_name")?.charAt(0).toUpperCase()}{localStorage.getItem("last_name")?.charAt(0).toUpperCase()}</div>
                                <span className='user-name'>{localStorage.getItem("username")}</span>
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
            {isSetVideo && <Footer {...props} />}
            {loading ? <Loading loading={loading} /> : null}
            {processing > 0 && processing < 100 ? <ProgressBar processing={processing} /> : null}
            <NotificationSystem ref={notificationSystem} allowHTML={true} />
            {/* <BottomLinks /> */}
        </Style>
    );
}
