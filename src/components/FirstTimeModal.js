import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const FirstTimeModal = ({ show, handleClose, setLoginOpen }) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>NOTE</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                You can use the public version (anonymous user), but the changes would not be persisted in the system.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        setLoginOpen();
                        handleClose();
                    }}
                >
                    Login
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FirstTimeModal;
