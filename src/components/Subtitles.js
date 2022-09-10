import styled from 'styled-components';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { IndicTransliterate } from '@ai4bharat/indic-transliterate';
import { t, Translate } from 'react-i18nify';
import { ai4BharatBatchTranslate } from '../libs/ai4BharatTranslate';
import GetTranslationLanguagesAPI from '../redux/actions/api/Translation/GetTranslationLanguages';
import FetchTranslationAPI from '../redux/actions/api/Translation/FetchTranslation';
import GenerateTranslationAPI from '../redux/actions/api/Translation/GenerateTranslation';
import SaveTranslationAPI from '../redux/actions/api/Translation/SaveTranslation';
import APITransport from '../redux/actions/apitransport/apitransport';
import { useDispatch, useSelector } from 'react-redux';
import TranslationModal from './TranslationModal';
import { Button } from 'react-bootstrap';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);
    z-index: 200;

    .translate {
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
            width: 80%;
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
        .ReactVirtualized__Table__Grid {
            outline: none;
            max-width: 20vw;
        }

        .ReactVirtualized__Grid__innerScrollContainer {
            overflow: visible !important;
        }

        .ReactVirtualized__Table__row {
            overflow: visible !important;

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
`;

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

export default function Subtitles({
    currentIndex,
    subtitle,
    setSubtitleOriginal,
    checkSub,
    player,
    updateSub,
    language,
    setLoading,
    setTranslationApi,
    subtitleEnglish,
    formatSub,
    setSubtitle,
    notify,
    isPrimary,
    clearedSubs,
    setClearedSubs,
    configuration,
    setConfiguration,
    translationApi,
    updateSubOriginal = null,
    isTranslateClicked = false,
    setIsTranslateClicked,
    found,
    currentFound,
    translationModalOpen,
    setTranslationModalOpen,
    handleTranslationClose,
    handleTranslationShow,
    displayBtn,
}) {
    const dispatch = useDispatch();
    const [height, setHeight] = useState(100);
    const [translate, setTranslate] = useState(null);
    const translateReq = useRef(false);
    const [languageAvailable, setLanguageAvailable] = useState([]);
    const languageChoices = useSelector(state => state.getTranslationLanguages.data);
    const Translations = useSelector(state => state.fetchTranslation.data);
    const GeneratedTranslations = useSelector(state => state.generateTranslation.data);
    const APIStatus = useSelector(state => state.apiStatus);
    const [waiting, setWaiting] = useState(false);
    const [transliterate, setTransliterate] = useState(true);

    const fetchTranslationLanguages = async() => {
        const langObj = new GetTranslationLanguagesAPI();
        dispatch(APITransport(langObj));
    };

    const saveTranslation = async () => {
        if (localStorage.getItem('subtitle')) {
            let transcript = JSON.parse(localStorage.getItem('subtitleEnglish'));
            let subtitles = JSON.parse(localStorage.getItem('subtitle'));
            if (subtitles?.length === 0) return;
            const payload = {
                translations: subtitles.map((item, i) => {
                    return {
                        source: transcript[i].text,
                        target: item.text,
                    };
                }),
            };
            const saveObj = new SaveTranslationAPI(
                localStorage.getItem('translation_id'),
                localStorage.getItem('langTranslate'),
                payload,
            );
            const res = await fetch(saveObj.apiEndPoint(), {
                method: 'POST',
                body: JSON.stringify(saveObj.getBody()),
                headers: saveObj.getHeaders().headers,
            });
        }
    };

    useEffect(() => {
        if (localStorage.getItem('langTranslate')) {
            setTranslate(localStorage.getItem('langTranslate')); //changes in both
        } else {
            localStorage.setItem('langTranslate', 'en'); //added
            setTranslate(localStorage.getItem('langTranslate'));
        }
        fetchTranslationLanguages();
    }, []);

    useEffect(() => {
        let scrollDivs = [];
        let syncScroll = (e) => {
            scrollDivs[
                e.currentTarget.scrollNum === scrollDivs.length - 1 ? 0 : e.currentTarget.scrollNum + 1
            ].scrollTop = e.currentTarget.scrollTop;
        };
        if (configuration==='Subtitling') {
            scrollDivs = document.getElementsByClassName('ReactVirtualized__Table__Grid');
            if (scrollDivs.length >= 2) {
                for (let i = 0; i < scrollDivs.length; i++) {
                    scrollDivs[i].scrollNum = i;
                    scrollDivs[i].addEventListener('scroll', syncScroll);
                }
            }
        }
        return () => {
            !!localStorage.getItem('user_id') && saveTranslation();
            if (scrollDivs.length >= 2) {
                for (let i = 0; i < scrollDivs.length; i++) {
                    scrollDivs[i].removeEventListener('scroll', syncScroll);
                }
            }
        };
    }, [configuration]);

    useEffect(() => {
        if (!!localStorage.getItem('user_id') && subtitle?.length > 0 && !waiting) {
            setWaiting(true);
            setTimeout(() => {
                setWaiting(false);
            }, 10000);
        }
    }, [subtitle]);

    useEffect(() => {
        if (!waiting && !!localStorage.getItem('user_id')) {
            saveTranslation();
        }
    }, [waiting]);

    useEffect(() => {
        if (languageChoices && Object.keys(languageChoices).length > 0) {
            let langArray = [];
            for (const key in languageChoices) {
                langArray.push({ name: `${key}`, key: `${languageChoices[key]}` });
            }
            setLanguageAvailable(langArray);
            setTranslate(langArray[0].key);
        }
    }, [languageChoices]);

    const handleBlur = (data, index) => {
        if (isPrimary) {
            return;
        }
        ai4BharatBatchTranslate(
            [{ text: data.text }],
            localStorage.getItem('langTranscribe'),
            localStorage.getItem('langTranslate'),
        ).then((resp) => {
            updateSubOriginal(data, resp[0], index);
        });
    };

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

    const [modeTranslate, setModeTranslate] = useStickyState('en', 'translated-view'); //for sticky option in dropdown

    const parseTranslations = useCallback(
        (translations) => {
            let transcript = JSON.parse(localStorage.getItem('subtitleEnglish'));
            for (let i = 0; i < transcript.length; i++) {
                if (transcript[i].text === translations[i].source) {
                    transcript[i].text = translations[i].target;
                }
            }
            localStorage.setItem('subtitle', JSON.stringify(transcript));
            setSubtitle(formatSub(transcript));
            console.log(transcript, "testagain")
            setLoading('');
            notify({
                message: t('TRANSLAT_SUCCESS'),
                level: 'success',
            });
        },
        [setSubtitle, notify, formatSub, setLoading],
    );

    const getTranslations = () => {
        const translationObj = new FetchTranslationAPI(
            localStorage.getItem('transcript_id'),
            localStorage.getItem('langTranslate'),
            true,
        );
        dispatch(APITransport(translationObj));
    };

    const generateTranslations = () => {
        const translationObj = new GenerateTranslationAPI(
            localStorage.getItem('transcript_id'),
            localStorage.getItem('langTranslate'),
        );
        dispatch(APITransport(translationObj));
    };

    useEffect(() => {
        if (
            translateReq.current &&
            Translations.payload?.translations?.length > 0 &&
            (languageChoices[Translations.target_lang] === localStorage.getItem('langTranslate') ||
                Translations.target_lang === localStorage.getItem('langTranslate'))
        ) {
            translateReq.current = false;
            localStorage.setItem('translation_id', Translations.id);
            parseTranslations(Translations.payload.translations);
        }
    }, [Translations]);

    useEffect(() => {
        if (translateReq.current && APIStatus?.error) {
            generateTranslations();
        }
    }, [APIStatus]);

    useEffect(() => {
        if (
            translateReq.current &&
            GeneratedTranslations.payload?.translations?.length > 0 &&
            (languageChoices[GeneratedTranslations.target_lang] === localStorage.getItem('langTranslate') ||
                GeneratedTranslations.target_lang === localStorage.getItem('langTranslate'))
        ) {
            parseTranslations(GeneratedTranslations.payload.translations);
            localStorage.setItem('translation_id', GeneratedTranslations.id);
            translateReq.current = false;
        }
    }, [GeneratedTranslations]);

    const onTranslate = useCallback(() => {
        translateReq.current = true;
        setLoading(t('TRANSLATING'));
        getTranslations();
    }, [setLoading, subtitleEnglish, formatSub, setSubtitle, translate, notify, clearedSubs]);

    console.log("test", isPrimary, subtitle)

    return (
        <>
            <TranslationModal
                translationModalOpen={translationModalOpen}
                handleTranslationClose={handleTranslationClose}
                modeTranslate={modeTranslate}
                setTranslate={setTranslate}
                setModeTranslate={setModeTranslate}
                languageAvailable={languageAvailable}
                language={language}
                onTranslate={onTranslate}
                setConfiguration={setConfiguration}
            />

            {configuration === 'Subtitling' && subtitle && (
                <Style className="subtitles">
                    {isPrimary && translate && languageAvailable && (
                        <div className="translate">
                                {!!localStorage.getItem('user_id') && <Button className="save" onClick={saveTranslation}>
                                    Save 💾
                                </Button>}
                                {!(
                                    !localStorage.getItem('langTranslate') ||
                                    localStorage.getItem('langTranslate') === 'en' ||
                                    localStorage.getItem('langTranslate') === 'en-k' ||
                                    localStorage.getItem('langTranslate') === 'xx'
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
                    )}


                    {!isPrimary && (
                        <div className="reference">
                            <h4>Reference Subtitles </h4>
                        </div>
                    )}
                    <div style={{ display: 'flex', position: 'relative', height: `90%` }}>

                        <Table 
                            headerHeight={40}
                            width={300}
                            height={height}
                            rowHeight={80}
                            scrollToIndex={currentIndex === -1 ? undefined : currentIndex + 2}
                            rowCount={subtitle.length}
                            rowGetter={({ index }) => subtitle[index]}
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
                                                    isPrimary && found.includes(props.index) ? 'found' : '',
                                                    isPrimary && found[currentFound] === props.index
                                                        ? 'current-found'
                                                        : '',
                                                ]
                                                    .join(' ')
                                                    .trim()}
                                                value={unescape(props.rowData.text)}
                                                spellCheck={false}
                                                onChangeText={(event) => {
                                                    updateSub(props.rowData, {
                                                        text: event,
                                                    });
                                                }}
                                                onBlur={() => handleBlur(props.rowData, props.index)}
                                                enabled={
                                                    transliterate &&
                                                    isPrimary
                                                        ? !(
                                                              !localStorage.getItem('langTranslate') ||
                                                              localStorage.getItem('langTranslate') === 'en' ||
                                                              localStorage.getItem('langTranslate') === 'en-k' ||
                                                              localStorage.getItem('langTranslate') === 'xx'
                                                          )
                                                        : !(
                                                              !localStorage.getItem('langTranscribe') ||
                                                              localStorage.getItem('langTranscribe') === 'en' ||
                                                              localStorage.getItem('langTranscribe') === 'en-k' || 
                                                              localStorage.getItem('langTranscribe') === 'xx'
                                                          )
                                                }
                                                lang={
                                                    isPrimary
                                                        ? localStorage.getItem('langTranslate')
                                                        : localStorage.getItem('langTranscribe')
                                                }
                                                maxOptions={5}
                                                readOnly={isPrimary ? false : true}
                                                renderComponent={(props) => <textarea {...props} style={{height: "70px", fontSize: "18px"}}/>}
                                            />
                                        </div>
                                    </div>
                                );
                            }}
                        ></Table>
                    </div>
                </Style>
            )}
        </>
    );
}
