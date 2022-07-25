import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Tab, Tabs } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

const TranscriptionModal = (props) => {
//     const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal show={props.transcriptionModalOpen} onHide={props.handleTranscriptionClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!
            
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
