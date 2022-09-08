import styled from 'styled-components';
import { t, Translate } from 'react-i18nify';
import React, { useState, useCallback, useEffect } from 'react';
import { getExt, download } from '../utils';
import { file2sub, sub2vtt, sub2srt, sub2txt } from '../libs/readSub';
import sub2ass from '../libs/readSub/sub2ass';
import FFmpeg from '@ffmpeg/ffmpeg';
import SimpleFS from '@forlagshuset/simple-fs';
import Links from './Links';
import GetVideoDetailsAPI from '../redux/actions/api/Video/GetVideoDetails';
import { useDispatch, useSelector } from 'react-redux';
import APITransport from '../redux/actions/apitransport/apitransport';
import LoginForm from './Login';
import 'react-tabs/style/react-tabs.css';
import UploadModal from './UploadModal';
import ExportModal from './ExportModal';
import FindAndReplace from './FindAndReplace';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

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
    saveTranscript,
}) {
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeURL, setYoutubeURL] = useState('');
    const translate = 'en';
    const [toolOpen, setToolOpen] = useState(true);
    const dispatch = useDispatch();
    const VideoDetails = useSelector((state) => state.getVideoDetails.data);
    const [showLogin, setShowLogin] = useState(false);
    const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
    const [toggleState, setToggleState] = useState('Same Language Subtitling');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const handleImportClose = () => setImportModalOpen(false);
    const handleImportShow = () => setImportModalOpen(true);

    const clearSubsHandler = () => {
        window.localStorage.setItem('subsBeforeClear', JSON.stringify(subtitle));
        setSubtitle([]);
        setSubtitleEnglish([]);
        localStorage.removeItem('subtitleEnglish');
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
        }
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
                setLoading(t('LOADING'));
                const ext = getExt(file.name);
                if (['ass', 'vtt', 'srt', 'json'].includes(ext)) {
                    file2sub(file)
                        .then((res) => {
                            if (configuration === 'Subtitling') {
                                setSubtitle(res);
                                setLoading('');
                            } else {
                                localStorage.removeItem('transcript_id');
                                setSubtitleEnglish(res);
                                saveTranscript(res);
                            }
                        })
                        .catch((err) => {
                            notify({
                                message: err.message,
                                level: 'error',
                            });
                            setLoading('');
                        });
                } else {
                    notify({
                        message: `${t('SUB_EXT_ERR')}: ${ext}`,
                        level: 'error',
                    });
                    setLoading('');
                }
            }
        },
        [notify, setSubtitle, setSubtitleEnglish, clearSubs],
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
                setLoading={setLoading}
            />

            <Style>
                <div
                    className={`
                            ${isSetVideo ? 'configuration' : 'hide-config'}
                        `}
                >
                    <Button
                        onClick={() => {
                            handleTranscriptionShow();
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
                            player?.pause();
                        }}
                        style={{ marginRight: '20px', backgroundColor: configuration === 'Subtitling' ? '#00CCFF' : '' }}
                    >
                        <Translate value="MAIN_LANGUAGE" />
                    </Button>
                    <ExportSubtitleModal />
                </div>

                <div className={`secondary-options ${isSetConfiguration ? '' : 'hide-secondary-options'}`}>
                    {window.crossOriginIsolated ? (
                        <div className="burn" onClick={burnSubtitles}>
                            <div className="btn">
                                <Translate value="EXPORT_VIDEO" />
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="">{/* <BottomLinks /> */}</div>
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
