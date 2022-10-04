import styled from 'styled-components';
import languages from '../libs/languages';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { IndicTransliterate, getTransliterationLanguages } from '@ai4bharat/indic-transliterate';
import { t, Translate } from 'react-i18nify';
import googleTranslate from '../libs/googleTranslate';
import { url2sub, vtt2url, sub2vtt } from '../libs/readSub';
import GetTranscriptLanguagesAPI from '../redux/actions/api/Transcript/GetTranscriptLanguages';
import FetchTranscriptAPI from '../redux/actions/api/Transcript/FetchTranscript';
import GenerateTranscriptAPI from '../redux/actions/api/Transcript/GenerateTranscript';
import 'react-tabs/style/react-tabs.css';
import TranscriptionModal from './TranscriptionModal';
import { Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);
    z-index: 10;

    .transcribe {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        border-bottom: 1px solid rgb(255 255 255 / 20%);
        height: 80px;

        .heading {
            h4 {
                margin: 0;
            }
        }

        .options {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;

            span {
                font-size: 18px;
            }
        }

        select {
            width: 65%;
            outline: none;
            height: 35px;
            border-radius: 3px;
        }

        .save {
            display: block;
            margin: 0;
        }
    }

    .reference {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        height: 80px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        h4 {
            margin-bottom: 0;
            margin-top: 0;
        }
    }

    .ReactVirtualized__Table {
        margin-top: 20px;
        width: 100%;

        .ReactVirtualized__Table__Grid {
            outline: none;
            width: 100% !important;
        }

        .ReactVirtualized__Grid__innerScrollContainer {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
        }

        .ReactVirtualized__Table__row {
            overflow: visible !important;
            width: 100% !important;

            .item {
                height: 100%;
                padding: 10px;

                ul {
                    position: absolute !important;
                    bottom: 200px !important;
                    left: 0 !important;
                    z-index: 9999 !important;
                    height: 170px !important;
                    width: 100% !important;
                    transform: translate(0px, 0px) !important;
                    display: block !important;

                    li {
                        color: #000 !important;
                        border-bottom: 1px solid #999;
                    }
                }

                .textarea {
                    border: none;
                    width: 100%;
                    height: 100%;
                    color: #fff;
                    font-size: 12px;
                    padding: 10px;
                    text-align: center;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.2s ease;
                    resize: none;
                    outline: none;

                    word-wrap: break-word;

                    &.highlight {
                        background-color: rgb(0 87 158);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    &.illegal {
                        background-color: rgb(123 29 0);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    &.found {
                        background-color: #ffffcc;
                        color: #000;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    &.current-found {
                        background-color: #ffff33;
                        color: #000;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                }
            }
        }
    }

    .transliterate-toggle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        p {
            margin: 0;
        }
    }
`;

export default function SameLanguageSubtitles({
    currentIndex,
    subtitle,
    setSubtitleOriginal,
    checkSub,
    player,
    updateSub,
    language,
    setLoading,
    subtitleEnglish,
    formatSub,
    setSubtitle,
    notify,
    isPrimary,
    clearedSubs,
    setClearedSubs,
    updateSubOriginal = null,
    clearSubs,
    clearSubsEnglish,
    configuration,
    setConfiguration,
    setSubtitleEnglish,
    translationApi,
    transcriptSource,
    setTranscriptSource,
    found,
    currentFound,
    transcriptionModalOpen,
    setTranscriptionModalOpen,
    handleTranscriptionClose,
    handleTranscriptionShow,
    saveTranscript,
}) {
    const [height, setHeight] = useState(100);

    const TRANSCRIPT_TYPES = {
        Youtube: 'uos',
        AI4Bharat: 'umg',
        Custom: 'mc',
    };

    const [languageAvailable, setLanguageAvailable] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [transliterate, setTransliterate] = useState(true);
    
    const fetchTranscriptionLanguages = async () => {
        setLanguageAvailable([]);
        if (transcriptSource === 'AI4Bharat') {
            let apiObj = new GetTranscriptLanguagesAPI();
            const res = await fetch(apiObj.apiEndPoint(), {
                method: 'GET',
                headers: apiObj.getHeaders().headers,
            });
            const resp = await res.json();
            if (res.ok) {
                let langArray = [];
                for (const key in resp.data) {
                    langArray.push({ name: `${key}`, key: `${resp.data[key]}` });
                }
                setLanguageAvailable(langArray);
            }
        } else {
            let langs = await getTransliterationLanguages();
            if (langs?.length > 0) {
                let langArray = [{name: 'English', key: 'en'}];
                for (const index in langs) {
                    langArray.push({ name: `${langs[index].DisplayName}`, key: `${langs[index].LangCode}` });
                }
                if (transcriptSource === 'Custom') langArray.push({ name: 'Other Language', key: 'xx' });
                setLanguageAvailable(langArray);
            }
        }
    };

    useEffect(() => {
        fetchTranscriptionLanguages();
    }, [transcriptSource]);

    useEffect(() => {
        return () => {
            !!localStorage.getItem('user_id') && saveTranscript();
        };
    }, []);

    useEffect(() => {
        if (!!localStorage.getItem('user_id') && subtitle?.length > 0 && !waiting) {
            setWaiting(true);
            setTimeout(() => {
                setWaiting(false);
            }, 10000);
        }
    }, [subtitle]);

    useEffect(() => {
        if (!!localStorage.getItem('user_id') && !waiting) {
            saveTranscript();
        }
    }, [waiting]);

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

    const [modeTranscribe, setModeTranscribe] = useStickyState('en', 'transcribed-view');

    const handleBlur = (data, index) => {
        if (isPrimary) {
            return;
        }
        googleTranslate([{ text: data.text }], localStorage.getItem('langTranscribe')).then((resp) => {
            updateSubOriginal(data, resp[0], index);
        });
    };

    const resize = useCallback(() => {
        setHeight(document.body.clientHeight - 320);
    }, [setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    const parseSubtitles = useCallback(
        (subtitles) => {
            const suburl = vtt2url(subtitles);
            url2sub(suburl).then((urlsub) => {
                clearSubs();
                setSubtitleEnglish(formatSub(urlsub));
                localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
                setLoading('');
                notify({
                    message: "Transcript loaded successfully",
                    level: 'success',
                });
            });
        },
        [setSubtitleEnglish, setLoading, formatSub],
    );

    const onTranscribe = useCallback(async () => {
        setLoading(t('TRANSCRIBING'));
        const transcriptObj = new FetchTranscriptAPI(
            localStorage.getItem('videoId'),
            localStorage.getItem('langTranscribe'),
            TRANSCRIPT_TYPES[transcriptSource],
        );
        const res = await fetch(transcriptObj.apiEndPoint(), {
            method: 'GET',
            body: JSON.stringify(transcriptObj.getBody()),
            headers: transcriptObj.getHeaders().headers,
        });

        if (res.ok) {
            const resp = await res.json();
            localStorage.setItem('transcript_id', resp.id);
            parseSubtitles(resp.data.output);
        } else {
            const generateObj = new GenerateTranscriptAPI(
                localStorage.getItem('videoId'),
                localStorage.getItem('langTranscribe'),
            );
            const res = await fetch(generateObj.apiEndPoint(), {
                method: 'GET',
                body: JSON.stringify(generateObj.getBody()),
                headers: generateObj.getHeaders().headers,
            });

            if (res.ok) {
                const resp = await res.json();
                localStorage.setItem('transcript_id', resp.id);
                parseSubtitles(resp.data.output);
            } else {
                setLoading('');
                notify({
                    message: "Transcript not available",
                    level: 'error',
                });
            }
        }
    }, [setLoading, formatSub, setSubtitle, notify, clearSubs, player, setSubtitleEnglish, transcriptSource]);

    return (
        <>
            <TranscriptionModal
                transcriptionModalOpen={transcriptionModalOpen}
                handleTranscriptionClose={handleTranscriptionClose}
                languageAvailable={languageAvailable}
                modeTranscribe={modeTranscribe}
                setModeTranscribe={setModeTranscribe}
                transcriptSource={transcriptSource}
                setTranscriptSource={setTranscriptSource}
                player={player}
                onTranscribe={onTranscribe}
                setConfiguration={setConfiguration}
            />

            {configuration === "Same Language Subtitling" && <Style className="subtitles" style={{ width: JSON.parse(localStorage.getItem('isAudioOnly')) ? '50%' : '' }}>
                <div className="transcribe">
                    {!!localStorage.getItem('user_id') && (
                        <Button className="save" onClick={saveTranscript}>
                            Save 💾
                        </Button>
                    )}
                    {!(
                        !localStorage.getItem('langTranscribe') ||
                        localStorage.getItem('langTranscribe') === 'en' ||
                        localStorage.getItem('langTranscribe') === 'en-k' ||
                        localStorage.getItem('langTranscribe') === 'xx'
                    ) && <div className="transliterate-toggle">
                        <Toggle
                            id="toggle-panel"
                            icons={false}
                            checked={transliterate}
                            onChange={() => setTransliterate(!transliterate)}
                            aria-labelledby="toggle-panel"
                        />
                        <p>Transliteration</p>
                    </div>}
                </div>

                {!isPrimary && (
                    <div className="reference">
                        <h4>Reference Subtitles</h4>
                        <span>Language : {languages['en'].filter((item) => item.key === language)[0].name}</span>
                    </div>
                )}

                <Table
                    headerHeight={40}
                    width={300}
                    height={height}
                    rowHeight={80}
                    scrollToIndex={currentIndex === -1 ? undefined : currentIndex + 2}
                    rowCount={subtitleEnglish.length}
                    rowGetter={({ index }) => subtitleEnglish[index]}
                    headerRowRenderer={() => null}
                    rowRenderer={(props) => {
                        return (
                            <div
                                key={props.key}
                                className={props.className}
                                style={props.style}
                                onClick={() => {
                                    if (player) {
                                        player.pause();
                                        if (player.duration >= props.rowData.startTime) {
                                            player.currentTime = props.rowData.startTime + 0.001;
                                        }
                                    }
                                }}
                            >
                                <div className="item">
                                    <IndicTransliterate
                                        className={[
                                            'textarea',
                                            currentIndex === props.index ? 'highlight' : '',
                                            checkSub(props.rowData) ? 'illegal' : '',
                                            found.includes(props.index) ? 'found' : '',
                                            found[currentFound] === props.index ? 'current-found' : '',
                                        ]
                                            .join(' ')
                                            .trim()}
                                        value={unescape(props.rowData.text)}
                                        spellCheck={false}
                                        onChangeText={(event) => {
                                            // console.log(event); //here
                                            updateSub(props.rowData, {
                                                text: event,
                                            });
                                        }}
                                        onBlur={() => handleBlur(props.rowData, props.index)}
                                        enabled={
                                            transliterate &&
                                            !(
                                                !localStorage.getItem('langTranscribe') ||
                                                localStorage.getItem('langTranscribe') === 'en' ||
                                                localStorage.getItem('langTranscribe') === 'en-k' ||
                                                localStorage.getItem('langTranscribe') === 'xx'
                                            )
                                        }
                                        lang={localStorage.getItem('langTranscribe')}
                                        maxOptions={5}
                                        renderComponent={(props) => (
                                            <textarea {...props} style={{ height: '70px', fontSize: '18px' }} />
                                        )}
                                    />
                                </div>
                            </div>
                        );
                    }}
                ></Table>
            </Style>}
        </>
    );
}
