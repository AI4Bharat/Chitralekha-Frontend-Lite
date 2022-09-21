import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { t, Translate } from 'react-i18nify';

const TranslationModal = (props) => {
//     const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

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
              {(props.languageAvailable[props.language] || props.languageAvailable.en || props.languageAvailable).map(
                (item) =>
                  ( 
                    <option key={item.key} value={item.key}>
                        {item.name}
                    </option>
                  ),
              )}
            </select>
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
