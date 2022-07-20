import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

const ExportModal = (props) => {
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>Export Subtitle </Modal.Header>

            <Modal.Body>
                <Tabs defaultActiveKey="Transcription" id="fill-tab-example" className="mb-3" fill>
                    <Tab eventKey="Transcription" title="Export Transcription Subtitles">
                        <Form>
                            {['ass', 'srt', 'vtt'].map((value) => (
                                <div key={`inline-${value}`} className="mb-3" onChange={props.setSubtitleFormat}>
                                    <Form.Check
                                        inline
                                        label={value}
                                        type='radio'
                                        id={`inline-${value}`}
                                    />
                                </div>
                            ))}
                        </Form>
                    </Tab>
                    <Tab eventKey="Translation" title="Export Translation Subtitles"></Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <Button>Export</Button>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExportModal;
