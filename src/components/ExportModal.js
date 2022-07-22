import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

const ExportModal = (props) => {
    const [radioTranscribeSelected, setRadioTranscribeSelected] = useState('ass');
    const [radioTranslateSelected, setRadioTranslateSelected] = useState('ass');
     console.log(props);
   // console.log(downloadSub);
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>Export Subtitle </Modal.Header>

            <Modal.Body>
                <Tabs defaultActiveKey="Transcription" id="fill-tab-example" className="mb-3" fill>
                    <Tab eventKey="Transcription" title="Transcription">
                        <Form>
                            {['ass', 'srt', 'vtt'].map((value,index) => ( 
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
                                    {console.log(index)}
                                    {console.log('transcribe radio selected value '+ radioTranscribeSelected)}
                                </div>
                            ))}
                        </Form>
                        <Button onClick={() => props.downloadSubReference(radioTranscribeSelected)}>Export</Button>
                    </Tab>
                    <Tab eventKey="Translation" title="Translation">
                    <Form>
                            {['ass', 'srt', 'vtt'].map((value) => ( 
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

                                    {console.log('translate radio selected value '+ radioTranslateSelected)}
                                </div>
                            ))}
                        </Form>
                        <Button onClick={() => props.downloadSub(radioTranslateSelected)}>Export</Button>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ExportModal;
