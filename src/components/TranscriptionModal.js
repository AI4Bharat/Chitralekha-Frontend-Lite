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

      <Modal show={props.transcriptionModalOpen} onHide={props.handleTranscriptionClose} style={{top: "20%"}}>
        <Modal.Header closeButton>
          <Modal.Title>Transcribe</Modal.Title>
        </Modal.Header>
         <Modal.Body>
         <div style={{marginBottom: "2px"}}>
          <p style={{display:"inline-block", marginRight:"10px", fontWeight:"500", width: "200px"}}>Select Language</p> 
        <select
        value={props.modeTranscribe}
        onChange={(event) => {
            props.setModeTranscribe(event.target.value);
            localStorage.setItem('langTranscribe', event.target.value);

            //console.log(event.target.value);
            //console.log('transcribed view'+localStorage.getItem('transcribed-view'));
            props.setTranscribe(localStorage.getItem('langTranscribe'));
        }}
        style={{padding: "6px 4px", borderRadius: "5px", minWidth: "200px"}}
        >
                {(props.languageAvailable[props.language] || props.languageAvailable.en || props.languageAvailable).map(
                                    (item) => (
                                        <option key={item.key} value={item.key}>
                                            {item.name}
                                        </option>
                                    ),
                )}
        </select>
                            </div>
                            <br/>
                            <span>
                            <div className="select-translation-api-container">
                                <p className="select-heading" style={{display: "inline-block", marginRight: "10px", fontWeight:"500", width: "200px"}}>Transcript Source</p>
                                <select
                                    value={props.transcriptSource}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                        props.setTranscriptSource(e.target.value);
                                        //clearSubsEnglish();
                                        props.player?.pause();
                                    }}
                                    style={{display: "inline-block",padding: "6px 4px", borderRadius: "5px", minWidth: "200px"}}
                                >
                                    <option value="AI4Bharat">AI4Bharat</option>
                                     <option value="Youtube">Youtube</option> 
                                     <option value="Custom">Custom</option> 
                                </select>
                            </div>
                            </span>
                            
        </Modal.Body> 
        <Modal.Footer>
          <div className="btn" onClick={()=>{props.onTranscribe(); props.handleTranscriptionClose();}} style={{display:"inline-block", marginRight:"5px", backgroundColor:"#0d6efd", color:"white", padding:"7px"}}>
            <Translate value="TRANSCRIBE" />
          </div>
          <Button variant="dark" onClick={props.handleTranscriptionClose} style={{marginLeft: "20px"}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TranscriptionModal;
