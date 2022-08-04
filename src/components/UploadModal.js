import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Card, FloatingLabel, Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { FaClipboardCheck } from 'react-icons/fa';

const UploadModal = (props) => {
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title style={{ textAlign: 'center', width: '100%' }}>
                    {localStorage.getItem('selectValue') === 'video' ? 'Upload Video' : 'Upload Subtitle'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {localStorage.getItem('selectValue') == 'video' ? (
                    <Tabs defaultActiveKey="URL" id="fill-tab-example" className="mb-3" fill variant="pills">
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

                                    {props.videos.map((video) => {
                                        return (
                                            <a
                                                href="javascript:void(0)"
                                                className="video-name"
                                                onClick={() => {
                                                    props.textAreaValueChange(video.url);
                                                    props.onRecentVideoLinkClick(video.url);
                                                    props.onHide();
                                                }}
                                            >
                                                {video.name}
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </Tab>
                        <Tab eventKey="Upload" title="Upload">
                            <Form.Control type="file" onChange={props.onVideoChange} onClick={props.onInputClick} />
                        </Tab>
                    </Tabs>
                ) : (
                    <Form.Control type="file" onChange={props.onSubtitleChange} onClick={props.onInputClick} />
                )}
            </Modal.Body>

            <Modal.Footer>
                {localStorage.getItem('selectValue') === 'video' ? (
                    <Button onClick={props.clearData}>Clear</Button>
                ) : (
                    <Button onClick={props.clearSubsHandler}>Clear</Button>
                )}
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
                ) : null}
                <Button onClick={props.onHide} variant="dark" style={{ marginLeft: '20px' }}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadModal;
