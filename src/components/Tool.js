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
import GetVideoDetailsAPI from "../redux/actions/api/Video/GetVideoDetails"
import { useDispatch, useSelector } from "react-redux"
import APITransport from "../redux/actions/apitransport/apitransport"
import Navbar from './Header';
import LoginForm from './Login';
import SaveTranscriptAPI from "../redux/actions/api/Transcript/SaveTranscript";
import ReactModal from 'react-modal';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Style = styled.div`
    border-bottom: 1px solid #63D471;

    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
  //  padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 100;

    .top-panel-select{
        padding: 6px;
        border-radius: 4px;
    }

    .modal-textarea{
        padding: 20px;
    }

    .youtube-link .youtube-textarea{
        padding: 20px;
    }
 
    .top{
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
        padding: 5px 0;
        margin-left: 20px;
        width: 100px;

        .save-btn{
            width: 100px;
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

    .export{
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
            background-color: #009688;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
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
            
            padding-left: 10px;

            .btn {
                position: relative;
                opacity: 0.85;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 35px;
                width: 95%;
                border-radius: 3px;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                background-color: #009688;
                transition: all 0.2s ease 0s;
                margin-right: 10px;
                letter-spacing: 1.3px;
                padding: 2px 5px;

                &:hover {
                    opacity: 1;
                }
            }
        }
    }

    .hide-config {
        transform: scaleY(0) !important;
        transition: all 0.25s;
        transform-origin: top;
        height: 0;
    }
    .hide-config .configuration-heading {
        opacity: 0;
        transition: all 0.1s;
    }

    .hide-config .configuration-options {
        opacity: 0;
        transition: all 0.1s;
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
            width: 100px;
            margin-left: 10px;
            font-size: 13px;
            padding: 5px 0;
            border-radius: 3px;
            text-align: center;
            color: rgb(255 255 255 / 75%);
            background-color: rgb(255 255 255 / 20%);
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
}) {
    // const [translate, setTranslate] = useState('en');
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeURL, setYoutubeURL] = useState('');
    const translate = 'en';
    const [toolOpen, setToolOpen] = useState(true);
    const dispatch = useDispatch();
    const VideoDetails = useSelector(state => state.getVideoDetails.data);
    const [showLogin, setShowLogin] = useState(false);
    const [languageAvailable, setLanguageAvailable] = useState([]);

    
    function useStickyState(defaultValue, key) {
        const [value, setValue] = React.useState(() => {
          const stickyValue = window.localStorage.getItem(key);
          return stickyValue !== null
            ? JSON.parse(stickyValue)
            : defaultValue;
        });
        React.useEffect(() => {
          window.localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);
        return [value, setValue];
      }
    

    const [modeTranscribe, setModeTranscribe] = useStickyState('as', 'transcribed-view');
    // const [isSetVideo, setIsSetVideo] = useState(false);
    const saveTranscript = async () => {
        if (localStorage.getItem('subtitle')) {
            setLoading(t('SAVING'));
            const payload = {
                output: sub2vtt(subtitle)
            }
            const saveObj = new SaveTranscriptAPI(localStorage.getItem("transcript_id"), localStorage.getItem("langTranscribe"), payload);
            const res = await fetch(saveObj.apiEndPoint(), {
                method: "POST",
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
                    level: 'success'});
            } else {
                notify({
                    message: 'Subtitle could not be saved', 
                    level: 'error'});
            }
            setLoading('');
        }
    }

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


    class OpenModal extends React.Component {
        constructor () {
          super();
          this.state = {
            showModal: false,
            value: ''

          };
          
          this.handleOpenModal = this.handleOpenModal.bind(this);
          this.handleCloseModal = this.handleCloseModal.bind(this);
        }
        
        handleOpenModal () {
          this.setState({ showModal: true });
        }
        
        handleCloseModal () {
          this.setState({ showModal: false });
        }
        
        render () {
          return (
            <Style>
            <div>
                <select
                 onChange={(event)=>{
                //    if(event.target.value=="video")
                //    {
                //     this.handleOpenModal()
                //    }
                //    else if(event.target.value=="subtitles")
                //    {
                //     // onSubtitleChange();
                //     // onInputClick();
                //    }
                localStorage.setItem('selectValue', event.target.value);
                this.handleOpenModal();
                   
                }}
                className="top-panel-select"
                >
                    <option value="" disabled selected>Open</option>
                    <option value="video">Import Video</option>
                    <option value="subtitles">Import Subtitle</option>
                </select>
              {/* <button onClick={this.handleOpenModal}>Trigger Modal</button> */}
              
              <ReactModal 
                 isOpen={this.state.showModal}
                 style={{
                    overlay: {
                        position: 'absolute',
                        top: '0',
                        background: 'none'
                    },
                    content: {
                      position: 'absolute',
                      
                      top: '150px',
                      left: '30%',
                      bottom: '40px',
                      width: '40%',
                      height: '40%',
                      border: '1px solid #ccc',
                      background: '#fff',
                      overflow: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      borderRadius: '20px',
                      outline: 'none',
                      padding: '20px',
                      zIndex: '1000',
                    },
                  }}
              >
                    { (localStorage.getItem('selectValue') == "video")
                    ? <div>
                        <div>
                            <Tabs defaultIndex={0} onSelect={(index) => console.log(index)}>
                                <TabList>
                                <Tab>Youtube URL</Tab>
                                <Tab>Upload</Tab>
                                </TabList>

                                <TabPanel>
                                <div>
                                        <textarea
                                            className="modal-textarea"
                                            placeholder="Enter YouTube Link Here"
                                            value={youtubeURL}

                                            onChange={handleChange}
                                            // onKeyPress={(e) => }
                                        />
                                        <div className="btn modal-fetch-btn" onClick={onYouTubeChange}>
                                            <Translate value="Fetch Video" />
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel>
                                    <input className="file" type="file" onChange={onVideoChange} onClick={onInputClick} />
                                </TabPanel>
                            </Tabs>
                        </div>    
                        <button onClick={this.handleCloseModal}>Cancel</button>
                    </div>

                    : <div>
                        <div className="btn">
                            <Translate value="OPEN_SUB" />
                            <input className="file" type="file" onChange={onSubtitleChange} onClick={onInputClick} />
                        </div>
                        <button onClick={this.handleCloseModal}>Cancel</button>
                    </div>
                    } 
              </ReactModal>
       
            </div>
                
            </Style>
          );
        }
      }
      

      

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
            if (VideoDetails.subtitles) {
                fetch(VideoDetails.subtitles)
                .then((subtext) => {
                    return subtext.text();
                })
                .then((subtext) => {
                    const suburl = vtt2url(subtext);
                    url2sub(suburl).then((urlsub) => {
                        setSubtitle(urlsub);
                        setSubtitleEnglish(urlsub);
                        localStorage.setItem('subtitle', JSON.stringify(urlsub));
                        localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
            }
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
                
                console.log('called');
       //         clearSubsHandler(); // added this so that subtitles of previous video do not remain even on new video load
                setLoading(t('LOADING'));
                dispatch(APITransport(videoObj));

                // fetch(
                //     `${process.env.REACT_APP_ASR_URL}/get_youtube_video_link_with_captions?url=${youtubeURL}&lang=${translate}`,
                //     {
                //         method: 'POST',
                //     },
                // )
                //     .then((resp) => {
                //         return resp.json();
                //     })
                //     .then((resp) => {
                //         const url = resp.video;
                //         player.src = url;

                //         localStorage.setItem('videoSrc', resp.video);
                //         localStorage.setItem('audioSrc', resp.audio);
                //         localStorage.setItem('youtubeURL', youtubeURL);

                //         if (resp.subtitles) {
                //             const sub = resp.subtitles;

                //             fetch(sub)
                //                 .then((subtext) => {
                //                     return subtext.text();
                //                 })
                //                 .then((subtext) => {
                //                    // console.log(subtext);
                //                     player.currentTime = 0;
                //                     clearSubs();
                //                     const suburl = vtt2url(subtext);
                //                     url2sub(suburl).then((urlsub) => {
                //                         setSubtitle(urlsub);
                //                         localStorage.setItem('subtitle', JSON.stringify(urlsub));
                //                     });
                //                 })
                //                 .catch((err) => {
                //                     console.log(err);
                //                 });
                //         } else {
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
                
                // // fetch(
                // //     `${process.env.REACT_APP_ASR_URL}/get_youtube_video_link_with_captions?url=${youtubeURL}&lang=en`,
                // //     {
                // //         method: 'POST',
                // //     },
                // // )
                // //     .then((resp) => {
                // //         return resp.json();
                // //     })
                // //     .then((resp) => {
                // //         //const url = resp.video;
                // //         const audio = resp.audio;

                // //         if (resp.subtitles) {
                // //             const sub = resp.subtitles;
                // //             fetch(sub)
                // //                 .then((subtext) => {
                // //                     return subtext.text();
                // //                 })
                // //                 .then((subtext) => {
                // //                     clearSubsEnglish();
                // //                     const suburl = vtt2url(subtext);
                // //                     url2sub(suburl).then((urlsub) => {
                // //                         setSubtitleEnglish(urlsub);
                // //                         localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
                // //                     });

                // //                     setLoading('');
                // //                 })
                // //                 .catch((err) => {
                // //                     console.log(err);
                // //                 });
                // //         } else {
                // //             const data = {
                // //                 audio_url: audio,
                // //                 vad_level: 2,
                // //                 chunk_size: 10,
                // //                 language: 'en',
                // //             };

                // //             fetch(`${process.env.REACT_APP_ASR_URL}/transcribe_audio`, {
                // //                 method: 'POST',
                // //                 headers: { 'Content-Type': 'application/json' },
                // //                 body: JSON.stringify(data),
                // //             })
                // //                 .then((resp) => {
                // //                     return resp.json();
                // //                 })
                // //                 .then((resp) => {
                // //                     console.log(resp.output);
                // //                     player.currentTime = 0;
                // //                     clearSubs();
                // //                     const suburl = vtt2url(resp.output);
                // //                     url2sub(suburl).then((urlsub) => {
                // //                         setSubtitleEnglish(urlsub);
                // //                         localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
                // //                     });
                // //                 })
                // //                 .then(() => setLoading(''))
                // //                 .catch((err) => {
                // //                     console.log(err);
                // //                 });
                // //         }
                // //     });
            }

            // localStorage.setItem('isVideoPresent', true);
            // setIsSetVideo(true);
            // setLoading('')
        },
        [
            clearSubs,
            youtubeURL,
            translate,
            player,
            setSubtitle,
            setLoading,
            setIsSetVideo,
        ],
    );

    const handleChange = (e) => {
        e.preventDefault();
        setYoutubeURL(e.target.value);
        
    };

    const onSubtitleChange = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = getExt(file.name);
                if (['ass', 'vtt', 'srt', 'json'].includes(ext)) {
                    file2sub(file)
                        .then((res) => {
                            clearSubs();
                            setSubtitle(res);
                            setSubtitleEnglish(res); //added setSubtitleEnglish
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
        event.target.value = '';
    }, []);

    const downloadSub = useCallback(
        (type) => {
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

    useEffect(() => {
        if (isSetVideo === false) {
            if (window.localStorage.getItem('isVideoPresent') === 'true') {
                console.log('here inside loop');
                setIsSetVideo(!isSetVideo);
            }
        }
    }, [setIsSetVideo, isSetVideo]);


    class TranscriptionModal extends React.Component {
        constructor () {
          super();
          this.state = {
            showTranscriptionModal: false,
            value: ''

          };
          
          this.handleOpenTranscriptionModal = this.handleOpenTranscriptionModal.bind(this);
          this.handleCloseTranscriptionModal = this.handleCloseTranscriptionModal.bind(this);
        }
        
        handleOpenTranscriptionModal () {
          this.setState({ showTranscriptionModal: true });
        }
        
        handleCloseTranscriptionModal () {
          this.setState({ showTranscriptionModal: false });
        }
        
        render () {
            if(configuration=='Same Language Subtitling')
        //     {
        // //  this.handleOpenTranscriptionModal();
        //     }
          return (
            <Style>
            <div>
                <div
                            className="btn"
                            onClick={() => {
                                // console.log('Configuration - same');
                                // const langTranscribe = localStorage.getItem('lang');
                              
                              //  console.log("lang " + langTranscribe);
                                //   setConfiguration('Same Language Subtitling');
                                //   setIsSetConfiguration(true);
                                  this.handleOpenTranscriptionModal();
                            }}
                        >
                            <Translate value="SAME_LANGUAGE" />
                        </div>
                        
              {/* <button onClick={this.handleOpenModal}>Trigger Modal</button> */}
              
              <ReactModal 
                 isOpen={this.state.showTranscriptionModal}
                 style={{
                    overlay: {
                        position: 'absolute',
                        top: '0',
                        background: 'none'
                    },
                    content: {
                      position: 'absolute',
                      color: 'black',
                      top: '150px',
                      left: '30%',
                      bottom: '40px',
                      width: '40%',
                      height: '40%',
                      border: '1px solid #ccc',
                      background: '#fff',
                      overflow: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      borderRadius: '20px',
                      outline: 'none',
                      padding: '20px',
                      zIndex: '1000',
                    },
                  }}
              >
                    {/* { (localStorage.getItem('selectValue') == "video")
                    ? <div>
                        <div>
                            <Tabs defaultIndex={0} onSelect={(index) => console.log(index)}>
                                <TabList>
                                <Tab>Youtube URL</Tab>
                                <Tab>Upload</Tab>
                                </TabList>

                                <TabPanel>
                                <div>
                                        <textarea
                                            className="modal-textarea"
                                            placeholder="Enter YouTube Link Here"
                                            value={youtubeURL}

                                            onChange={handleChange}
                                            // onKeyPress={(e) => }
                                        />
                                        <div className="btn modal-fetch-btn" onClick={onYouTubeChange}>
                                            <Translate value="Fetch Video" />
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel>
                                    <input className="file" type="file" onChange={onVideoChange} onClick={onInputClick} />
                                </TabPanel>
                            </Tabs>
                        </div>    
                        <button onClick={this.handleCloseTranscriptionModal}>Cancel</button>
                    </div>

                    : <div>
                        <div className="btn">
                            <Translate value="OPEN_SUB" />
                            <input className="file" type="file" onChange={onSubtitleChange} onClick={onInputClick} />
                        </div>
                        <button onClick={this.handleCloseTranscriptionModal}>Cancel</button>
                    </div>
                    }  */}
                     <select
                               // value={transcribe == null ? '' : transcribe}
                               value={modeTranscribe}
                                onChange={(event) => {
                                    setModeTranscribe(event.target.value);
                                    localStorage.setItem('langTranscribe', event.target.value);
                                   
                                    //console.log(event.target.value);
                                    //console.log('transcribed view'+localStorage.getItem('transcribed-view'));
                                    setTranscribe(localStorage.getItem('langTranscribe'));
                                
                                    
                                }}
                            >
                                {/* { console.log("transcribe "+localStorage.getItem('langTranscribe'))} */}
                              {/*  <option key="please-select" value="please-select" >Please Select</option> */}
                                {(languageAvailable[language] || languageAvailable.en || languageAvailable).map(
                                    (item) =>
                                        /*item.key !== 'en' && ( */
                                            <option key={item.key} value={item.key}>
                                                {item.name}
                                            </option>
                                      /*  ), */
                                )}
                                
                            </select>

                            <input type="radio" id="asr" name="asr" value="ASR" />
                            <label for="asr" style={{color: "black"}}>ASR</label><br />
                            <input type="radio" id="original" name="original" value="OriginalSource" />
                            <label for="original" style={{color: "black"}}>Original Source</label> <br />


                             <div className="btn">
                                <Translate value="TRANSCRIBE" />
                            </div>
                            <button onClick={this.handleCloseTranscriptionModal}>Cancel</button>
                            
              </ReactModal>
       
            </div>
                
            </Style>
          );
        }
      }


      class ExportModal extends React.Component {
        constructor () {
          super();
          this.state = {
            showExportModal: false,
            value: ''

          };
          
          this.handleOpenExportModal = this.handleOpenExportModal.bind(this);
          this.handleCloseExportModal = this.handleCloseExportModal.bind(this);
        }
        
        handleOpenExportModal () {
          this.setState({ showExportModal: true });
        }
        
        handleCloseExportModal () {
          this.setState({ showExportModal: false });
        }

        setSubtitleFormat(event) {
            console.log(event.target.value);
            
          }
        
        render () {
          return (
            <Style>
            <div>
            <div className="export btn" onClick={this.handleOpenExportModal}>
                        <Translate value="Export Subtitles" />
                </div>
              {/* <button onClick={this.handleOpenModal}>Trigger Modal</button>  */}
              
              <ReactModal 
                 isOpen={this.state.showExportModal}
                 style={{
                    overlay: {
                        position: 'absolute',
                        top: '0',
                        background: 'none'
                    },
                    content: {
                      position: 'absolute',
                      
                      top: '150px',
                      left: '30%',
                      bottom: '40px',
                      width: '40%',
                      height: '40%',
                      border: '1px solid #ccc',
                      background: '#fff',
                      overflow: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      borderRadius: '20px',
                      outline: 'none',
                      padding: '20px',
                      zIndex: '1000',
                    },
                  }}
              >
                     <div>
                        <div>
                                <div>
                                {/* <p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                        <b>Export Your Subtitles</b>
                    </p> */}

                    {/* <div onChange={this.setSubtitleType.bind(this)}>
                        <input type="radio" value="exportTranslationSubs" name="subtitleType"/> Export Translation Subtitles
                        <input type="radio" value="exportTranscriptionSubs" name="subtitleType"/> Export Transcription Subtitles
                    </div> */}
                     <div className="export">
                     {/* <input type="radio" value="ass" name="exportSubs" />Export ASS */}
                        {/* <div className="btn" onClick={() => downloadSub('ass')}>
                            <Translate value="EXPORT_ASS" />
                        </div>
                        <div className="btn" onClick={() => downloadSub('srt')}>
                            <Translate value="EXPORT_SRT" />
                        </div>
                        <div className="btn" onClick={() => downloadSub('vtt')}>
                            <Translate value="EXPORT_VTT" />
                        </div> */}
                        <Tabs defaultIndex={0} onSelect={(index) => console.log(index)}>
                                <TabList>
                                <Tab>Export Transcription Subtitles</Tab>
                                <Tab>Export Translation Subtitles</Tab>
                                </TabList>

                                <TabPanel>
                                <div>
                                    <h4>Select Format</h4>
                                <div onChange={this.setSubtitleFormat.bind(this)}>
                                <input type="radio" value="ass" name="exportSubs"/><label style={{padding: '5px', color:"black", marginRight: '10px'}}>ASS</label>
                                <input type="radio" value="srt" name="exportSubs"/><label style={{padding: '5px', color:"black", marginRight: '10px'}}>SRT</label>
                                <input type="radio" value="vtt" name="exportSubs"/><label style={{padding: '5px', color:"black", marginRight: '10px'}}>VTT</label>
                                </div>
                                    </div>
                                    {/* <button>Export</button> */}
                                    {/*onClick={downloadSubReference('ass')} */}
                                </TabPanel>

                                <TabPanel>
                                   
                                </TabPanel>
                            </Tabs>
                    </div>
                    {/* <p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                        <b>Export Reference Subtitles</b>
                    </p>
                    <div className="export">
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

                                   
                        </div>    
                        <div>
                        <button>Export</button>
                            <button onClick={this.handleCloseExportModal}>Cancel</button>
                        </div>
                        
                    </div>

                 
                     
              </ReactModal>
       
            </div>
                
            </Style>
          );
        }
      }


      const handleFullScreenMode=(event)=>{
        var el = document.getElementById("full-screenVideo");
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
          el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen(); 
        }
    console.log("fullscreenmode")
    
      }

    return (
        <Style className={`tool ${toolOpen ? 'tool-open' : ''}`}>
         <OpenModal />
         <ExportModal />
         {/* <TranscriptionModal /> */}
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
<Links />
            <div className="top">
            



                


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
                <div className="operate">
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
                </div>

                <div
                    className={`
                        ${isSetVideo ? 'configuration' : 'hide-config'}
                `}
                >
                    <p className="configuration-heading">
                        {/* <b>Configuration Options</b> */}
                    </p>
                    <div className="configuration-options">
                        <div
                            className="btn"
                            onClick={() => {
                                console.log('Configuration - same');
                                const langTranscribe = localStorage.getItem('lang');
                              //  console.log("lang " + langTranscribe);
                                 setConfiguration('Same Language Subtitling');
                                 setIsSetConfiguration(true);
                            }}
                        >
                            <Translate value="SAME_LANGUAGE" />
                        </div>
                        <div
                            className="btn"
                            onClick={() => {
                                console.log('Configuration - basic');
                               // this.handleOpenTranscriptionModal();
                                setConfiguration('Subtitling');
                                setIsSetConfiguration(true);
                            }}
                        >
                            <Translate value="MAIN_LANGUAGE" />
                        </div>

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
                        
                    </div>
                </div>
                
                <div className="save-transcript">
                            <h4>{ <span title="Save Transcript" className='save-btn' onClick={saveTranscript}>Save 💾</span>}</h4>
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
                                    }}
                                >
                                    <option value="AI4Bharat">AI4Bharat</option>
                                    <option value="Google">Google</option>
                                </select>
                            </div>
                        </>
                    )} */}
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
                    </div>
                    <p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                        <b>Export Reference Subtitles</b>
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

                <div className="">
                    {/* <BottomLinks /> */}
                </div>

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
            
                <div className="hotkey">
                    
                    <span>
                        <Translate value="HOTKEY_01" />
                    </span>
                    <span>
                        <Translate value="HOTKEY_02" />
                    </span>
                </div>
            </div>
            <div className="operate">
                <div className="btn"  onClick={handleFullScreenMode} >
                    <Translate value="Full screen mode" />
                </div>
            </div>
            <LoginForm showLogin={showLogin} setShowLogin={setShowLogin}/>
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
                </div>
               
        </Style>
    );
}
