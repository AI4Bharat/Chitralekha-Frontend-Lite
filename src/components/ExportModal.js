import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

const ExportModal = (props) => {
    const [radioTranscribeSelected, setRadioTranscribeSelected] = useState('ass');
    const [radioTranslateSelected, setRadioTranslateSelected] = useState('ass');

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title style={{textAlign: "center", width: "100%"}}>Export Subtitle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="Transcription" id="fill-tab-example" className="mb-3" fill variant="pills">
                    <Tab eventKey="Transcription" title="Transcription">
                        <Form fill>
                            {['ass', 'srt', 'vtt', 'txt'].map((value,index) => ( 
                                <div key={`inline-${value}`} className="mb-3" style={{display: 'inline-block', padding: '10px 20px'}}>
                                    
                                    <Form.Check
                                        inline
                                        label={value}
                                        type='radio'
                                        name='subTranscribeRadioGroup'
                                        id={`inline-${value}-${index+1}`}
                                        checked={radioTranscribeSelected === value}
                                        onChange={()=>setRadioTranscribeSelected(value)}
                                    />
                                </div>
                            ))}
                        </Form>
                        <Button onClick={() => props.downloadSubReference(radioTranscribeSelected)}>Export</Button>
                    </Tab>
                    <Tab eventKey="Translation" title="Translation">
                    <Form>
                            {['ass', 'srt', 'vtt', 'txt'].map((value) => ( 
                                <div key={`inline-${value}`} className="mb-3" style={{display: 'inline-block', padding: '10px 20px'}}>
                                    
                                    <Form.Check
                                        inline
                                        label={value}
                                        type='radio'
                                        name="subTranslateRadioGroup"
                                        id={`inline-${value}`}
                                        checked={radioTranslateSelected === value}
                                        onChange={e=>setRadioTranslateSelected(value)}
                                    />
                                </div>
                            ))}
                        </Form>
                        <Button onClick={() => props.downloadSub(radioTranslateSelected)}>Export</Button>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide} variant="dark">Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExportModal;
