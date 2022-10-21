import React, {useEffect, useState} from 'react';
import {Modal, Button, Form, Alert} from "react-bootstrap"
import { t, Translate } from 'react-i18nify';

const TranscriptionModal = (props) => {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('langTranscribe')) {
      props.setModeTranscribe(localStorage.getItem('langTranscribe'));
    } else {
      localStorage.setItem('langTranscribe', 'en');
      props.setModeTranscribe('en');
    }
  }, [props.transcriptionModalOpen]);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={props.transcriptionModalOpen} onHide={props.handleTranscriptionClose} style={{top: "20%"}}>
        <Modal.Header closeButton>
          <Modal.Title>Transcribe</Modal.Title>
        </Modal.Header>
         <Modal.Body>
            <div className="select-translation-api-container">
                <p className="select-heading" style={{display: "inline-block", marginRight: "10px", fontWeight:"500", width: "200px"}}>Transcript Source</p>
                <select
                    value={props.transcriptSource}
                    onChange={(e) => {
                        props.setTranscriptSource(e.target.value);
                        //clearSubsEnglish();
                        props.player?.pause();
                    }}
                    style={{display: "inline-block",padding: "6px 4px", borderRadius: "5px", minWidth: "200px"}}
                    disabled={!!process.env.REACT_APP_LITE}
                >
                    {!process.env.REACT_APP_LITE && <option value="AI4Bharat">AI4Bharat</option>}
                      {!process.env.REACT_APP_LITE && <option value="Youtube">Youtube</option>}
                      <option value="Custom">Custom</option> 
                </select>
            </div>
            <br/>
            <div style={{marginBottom: "2px"}}>
              <p style={{display:"inline-block", marginRight:"10px", fontWeight:"500", width: "200px"}}>Select Language</p> 
              <select
              value={props.modeTranscribe}
              onChange={(event) => {
                  props.setModeTranscribe(event.target.value);
                  localStorage.setItem('langTranscribe', event.target.value);
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
              {showAlert && <Alert variant='warning'>
                <Alert.Heading style={{fontSize: "1.3rem"}}>
                  Are you sure you want to force retreive translations?
                </Alert.Heading>
                <p>Please note that all your progress will be lost</p>
                <div className='d-flex justify-content-end gap-3'>
                  <Button variant="secondary" onClick={() => setShowAlert(false)}>Cancel</Button>
                  <Button variant="danger" onClick={() => {setShowAlert(false); props.setContinueEditing(false)}}>Confirm</Button>
                </div>
              </Alert>}
              <Form.Check 
                type="checkbox"
                label="Continue editing where I left off"
                disabled={!localStorage.getItem('isLoggedIn')}
                style={{marginTop: "10px"}}
                checked={props.continueEditing}
                onChange={() => props.continueEditing ? setShowAlert(true) : props.setContinueEditing(true)}
              />
            </div>               
        </Modal.Body> 
        <Modal.Footer>
          <div 
            className="btn" 
            onClick={()=>{
              props.setConfiguration('Same Language Subtitling');
              props.onTranscribe(); 
              props.handleTranscriptionClose();
            }} 
            style={{display:"inline-block", marginRight:"5px", backgroundColor:"#0d6efd", color:"white", padding:"7px"}}
          >
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
