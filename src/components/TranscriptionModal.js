import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { t, Translate } from 'react-i18nify';

const TranscriptionModal = (props) => {
//     const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}
      {console.log(props)}

      <Modal show={props.transcriptionModalOpen} onHide={props.handleTranscriptionClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transcribe</Modal.Title>
        </Modal.Header>
         <Modal.Body>
         <span>
          <h4 style={{display:"inline-block", marginRight:"10px"}}>Select Language</h4> 
        <select
        value={props.modeTranscribe}
        onChange={(event) => {
            props.setModeTranscribe(event.target.value);
            localStorage.setItem('langTranscribe', event.target.value);

            //console.log(event.target.value);
            //console.log('transcribed view'+localStorage.getItem('transcribed-view'));
            props.setTranscribe(localStorage.getItem('langTranscribe'));
        }}>
        {(props.languageAvailable[props.language] || props.languageAvailable.en || props.languageAvailable).map(
                                    (item) => (
                                        <option key={item.key} value={item.key}>
                                            {item.name}
                                        </option>
                                    ),
                                )}
                                {/* <option>{props.language}</option> */}
                            </select>
                            </span>
                            <div className="select-translation-api-container">
                                <p className="select-heading">
                                    <b>Transcript Source</b>
                                </p>
                                <select
                                    value={props.transcriptSource}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                        props.setTranscriptSource(e.target.value);
                                        //clearSubsEnglish();
                                        props.player?.pause();
                                    }}
                                >
                                    <option value="AI4Bharat">AI4Bharat</option>
                                     <option value="Youtube">Youtube</option> 
                                     <option value="Custom">Custom</option> 
                                </select>
                            </div>
                            <div className="btn" onClick={props.onTranscribe} style={{display:"inline-block", marginRight:"5px", backgroundColor:"#673ab7", color:"white", padding:"10px"}}>
                                <Translate value="TRANSCRIBE" />
                            </div>
        </Modal.Body> 
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleTranscriptionClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TranscriptionModal;
