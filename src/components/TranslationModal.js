import {Modal, Button, Form, Alert} from "react-bootstrap"
import { t, Translate } from 'react-i18nify';
import { useState, useEffect } from "react"

const TranslationModal = (props) => {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('langTranslate')) {
      props.setModeTranslate(localStorage.getItem('langTranslate'));
    } else {
      localStorage.setItem('langTranslate', localStorage.getItem('langTranscribe') === 'en' ? 'hi' : 'en');
      props.setModeTranslate(localStorage.getItem('langTranslate'));
    }
  }, [props.translationModalOpen]);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={props.translationModalOpen} onHide={props.handleTranslationClose} style={{top: "20%"}}>
        <Modal.Header closeButton>
          <Modal.Title>Translate</Modal.Title>
        </Modal.Header>
         <Modal.Body>
         <div className="select-translation-api-container">
            <p className="select-heading" style={{display: "inline-block", marginRight: "10px", fontWeight:"500", width: "200px"}}>Translation Source</p>
            <select
              value={props.translationSource}
              onChange={(e) => {
                  props.setTranslationSource(e.target.value);
                  props.player?.pause();
              }}
              style={{display: "inline-block",padding: "6px 4px", borderRadius: "5px", minWidth: "200px"}}
            >
              <option value="AI4Bharat">AI4Bharat</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <br/>
          <div style={{marginBottom: "2px"}}>
            <p style={{display:"inline-block", marginRight:"10px", fontWeight:"500", width: "200px"}}>Select Language</p> 
            <select
              value={props.modeTranslate} //new - comment out if don't want sticky options
              onChange={(event) => {
                  props.setTranslate(event.target.value);
                  props.setModeTranslate(event.target.value); //new
                  // localStorage.setItem('lang', event.target.value); //maybe remove later
                  localStorage.setItem('langTranslate', event.target.value);
              }}
              style={{padding: "6px 4px", borderRadius: "5px", minWidth: "200px"}}
            >
              {props.languageAvailable?.filter((lang) => lang.key !== localStorage.getItem("langTranscribe"))?.map(
                (item) =>
                  ( 
                    <option key={item.key} value={item.key}>
                        {item.name}
                    </option>
                  ),
              )}
            </select>
            {showAlert && <Alert variant='warning'>
              <Alert.Heading style={{fontSize: "1.3rem"}}>
                Are you sure you want to force retreive transcripts?
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
              props.setConfiguration('Subtitling');
              props.onTranslate(); 
              props.handleTranslationClose();
            }} 
            style={{display:"inline-block", marginRight:"5px", backgroundColor:"#0d6efd", color:"white", padding:"7px"}}>
            <Translate value="TRANSLATE" />
          </div>
          <Button variant="dark" onClick={props.handleTranslationClose} style={{marginLeft: "20px"}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TranslationModal;
