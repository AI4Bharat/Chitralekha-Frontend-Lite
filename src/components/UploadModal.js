import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FloatingLabel, Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { getTransliterationLanguages } from '@ai4bharat/indic-transliterate';
import { FaClipboardCheck } from 'react-icons/fa';
import APITransport from '../redux/actions/apitransport/apitransport';
import GetRecentLinksAPI from '../redux/actions/api/Video/GetRecentLinks';
import { useDispatch, useSelector } from 'react-redux';

const UploadModal = (props) => {
    const dispatch = useDispatch();
    const recentLinks = useSelector((state) => state.getRecentLinks.data);
    const [languageAvailable, setLanguageAvailable] = useState([]);
    const [title, setTitle] = useState('');
    const [subLang, setSubLang] = useState('en');

    const fetchTranscriptionLanguages = async () => {
        let langs = await getTransliterationLanguages();
        if (langs?.length > 0) {
            let langArray = [{ name: 'English', key: 'en' }];
            for (const index in langs) {
                langArray.push({ name: `${langs[index].DisplayName}`, key: `${langs[index].LangCode}` });
            }
            langArray.push({ name: 'Other Language', key: 'xx' });
            setLanguageAvailable(langArray);
        }
    };

    const fetchRecentLinks = () => {
        const linksObj = new GetRecentLinksAPI();
        dispatch(APITransport(linksObj));
    };

    useEffect(() => {
        fetchRecentLinks();
        fetchTranscriptionLanguages();

        if (localStorage.getItem('selectValue') === 'video') {
            setTitle('Upload Video');
        } else if (localStorage.getItem('selectValue') === 'subtitles') {
            setTitle(props.configuration === 'Subtitling' ? 'Upload Translation Subtitles' : 'Upload Transcription Subtitle');
        } else {
            setTitle('Upload Audio');
        }
        if (props.configuration === 'Subtitling') {
            if (localStorage.getItem('langTranslate')) {
                setSubLang(localStorage.getItem('langTranslate'));
            } else {
                localStorage.setItem('langTranslate', localStorage.getItem('langTranscribe') === 'en' ? 'hi' : 'en');
                setSubLang(localStorage.getItem('langTranslate'));
            }
        } else {
            if (localStorage.getItem('langTranscribe')) {
                setSubLang(localStorage.getItem('langTranscribe'));
            } else {
                localStorage.setItem('langTranscribe', 'en');
                setSubLang('en');
            }
        }
    }, []);

    const renderVideoModal = () => {
        return (
            <>
                <FloatingLabel controlId="floatingTextarea2" label="Enter Video Link From Youtube or Google Drive Here" style={{ color: '#000' }}>
                    <Form.Control
                        as="textarea"
                        style={{ height: '100px' }}
                        value={props.textAreaValue}
                        onChange={(e) => props.textAreaValueChange(e.target.value)}
                    />
                </FloatingLabel>

                {localStorage.getItem('isLoggedIn') ? (
                    <div className="video-links">
                        <p className="video-links-heading">
                            Recently Edited Video Links <FaClipboardCheck />
                        </p>

                        <ul>
                            {Array.isArray(recentLinks) && recentLinks?.map((video) => {
                                return (
                                    <li
                                        href="javascript:void(0)"
                                        className="video-name"
                                        onClick={() => {
                                            props.textAreaValueChange(video.url);
                                            props.onRecentVideoLinkClick(video.url);
                                            props.onHide();
                                        }}
                                    >
                                        {video.name}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : null}
            </>
        );
    };

    const renderSubtitleModal = () => {
        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: '20px',
                        marginBottom: '20px',
                    }}
                >
                    <label style={{ margin: 0 }}>Select Language:</label>
                    <select
                        onChange={(event) => {
                            setSubLang(event.target.value);
                            if (props.configuration === 'Subtitling') {
                                localStorage.setItem('langTranslate', event.target.value);
                            } else {
                                localStorage.setItem('langTranscribe', event.target.value);
                            }
                        }}
                        value={subLang}
                        style={{ padding: '6px 4px', borderRadius: '5px', flex: 1 }}
                    >
                        {languageAvailable?.map((item) => (
                            <option key={item.key} value={item.key}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                <Form.Control type="file" onChange={props.onSubtitleChange} onClick={props.onInputClick} />
            </div>
        );
    };

    const renderAudioModal = () => {
        return (
            <FloatingLabel controlId="floatingTextarea2" label="Enter Audio Link from Youtube or Google Drive Here" style={{ color: '#000' }}>
                <Form.Control
                    as="textarea"
                    style={{ height: '100px' }}
                    value={props.driveUrl}
                    onChange={(e) => props.setDriveUrl(e.target.value)}
                />
            </FloatingLabel>
        );
    };

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title style={{ textAlign: 'center', width: '100%' }}>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {localStorage.getItem('selectValue') === 'video'
                    ? renderVideoModal()
                    : localStorage.getItem('selectValue') === 'subtitles'
                    ? renderSubtitleModal()
                    : renderAudioModal()}
            </Modal.Body>

            <Modal.Footer>
                {localStorage.getItem('selectValue') === 'video' ? (
                    <Button
                        onClick={() => {
                            props.onYouTubeChange();
                            props.onHide();
                        }}
                        style={{ marginLeft: '10px' }}
                    >
                        Fetch
                    </Button>
                ) : localStorage.getItem('selectValue') === 'audio' ? (
                    <Button
                        onClick={() => {
                            props.handleAudioUpload();
                            props.onHide();
                        }}
                        style={{ marginLeft: '10px' }}
                    >
                        Fetch
                    </Button>
                ) : null}
                <Button onClick={props.onHide} variant="dark">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadModal;

//Code for Upload video tabs
{
    /* <Tabs defaultActiveKey="URL" id="fill-tab-example" className="mb-3" fill variant="pills">
    <Tab eventKey="URL" title="Youtube URL">
        <FloatingLabel
            controlId="floatingTextarea2"
            label="Enter YouTube Link Here"
            style={{ color: '#000' }}
        >
            <Form.Control
                as="textarea"
                style={{ height: '100px' }}
                value={props.textAreaValue}
                onChange={(e) => props.textAreaValueChange(e.target.value)}
            />
        </FloatingLabel>

        {localStorage.getItem('isLoggedIn') ? (
            <div className="video-links">
                <p className="video-links-heading">
                    Recent Video Links <FaClipboardCheck />
                </p>

                <ul>
                    {recentLinks?.map((video) => {
                        return (
                            <li
                                href="javascript:void(0)"
                                className="video-name"
                                onClick={() => {
                                    props.textAreaValueChange(video.url);
                                    props.onRecentVideoLinkClick(video.url);
                                    props.onHide();
                                }}
                            >
                                {video.name}
                            </li>
                        );
                    })}
                </ul>
            </div>
        ) : null}
    </Tab>
    <Tab eventKey="Upload" title="Upload">
        <Form.Control type="file" onChange={props.onVideoChange} onClick={props.onInputClick} />
    </Tab>
</Tabs> */
}
