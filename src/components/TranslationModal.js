import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
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
      {console.log(props)}

      <Modal show={props.translationModalOpen} onHide={props.handleTranslationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Translate</Modal.Title>
        </Modal.Header>
         <Modal.Body>
         <p style={{display:"inline-block", marginRight:"10px", fontWeight:"bold"}}>Select Language</p> 
         <select
                            
                            // value="kn"
                             value={props.modeTranslate} //new - comment out if don't want sticky options
                             onChange={(event) => {
                                 props.setTranslate(event.target.value);
                                 props.setModeTranslate(event.target.value); //new
                                // localStorage.setItem('lang', event.target.value); //maybe remove later
                                 localStorage.setItem('langTranslate', event.target.value); 
                                 // console.log('in select');
                                //  console.log('in onChange translate lang ' +localStorage.getItem('lang'));
                                  console.log('in onChange translate langTranslate ' +localStorage.getItem('langTranslate'));
                                 // console.log(event.target.value);
                             }}
                         >
                             {(props.languageAvailable[props.language] || props.languageAvailable.en || props.languageAvailable).map(
                                 (item) =>
                                     //item.key !== 'en' && 
                                     ( 
                                         <option key={item.key} value={item.key}>
                                             {item.name}
                                         </option>
                                     ),
                             )}
                         </select>
                         <br />
                         <div className="btn" onClick={props.onTranslate} style={{display:"inline-block", marginRight:"5px", backgroundColor:"#673ab7", color:"white", padding:"10px"}}>
                             <Translate value="TRANSLATE" />
                         </div>
        </Modal.Body> 
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleTranslationClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TranslationModal;
