import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FloatingLabel, Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

const UploadModal = (props) => {
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                {localStorage.getItem('selectValue') === 'video' ? 'Upload Video' : 'Upload Subtitle'}
            </Modal.Header>

            <Modal.Body>
                {localStorage.getItem('selectValue') == 'video' ? (
                    <Tabs defaultActiveKey="URL" id="fill-tab-example" className="mb-3" fill>
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
                                    onChange={(e) => props.textAreaValueChange(e)}
                                />
                            </FloatingLabel>
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
                    <Button onClick={props.onYouTubeChange}>Fetch</Button>
                ) : null}
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadModal;
