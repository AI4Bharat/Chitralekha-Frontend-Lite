import '../utils/Login.css';
import { ReactTransliterate } from 'react-transliterate';
import { Modal, Button, FloatingLabel, Form } from 'react-bootstrap';

const FindAndReplace = ({
    showFindAndReplace,
    setShowFindAndReplace,
    find,
    setFind,
    replace,
    setReplace,
    found,
    setFound,
    handleReplace,
    handleReplaceAll,
    handleFind,
    currentFound,
    setCurrentFound,
    configuration,
}) => {
    const handleClose = () => {
        setShowFindAndReplace(false);
        setFind('');
        setReplace('');
        setFound([]);
        setCurrentFound();
    };

    console.log(
        
        find,
        '0-=-=-=-=-=');
    return (
        <>
            <Modal show={showFindAndReplace} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Find and Replace</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label for="exampleInputEmail1">Find</label>
                    <ReactTransliterate
                        className="form-control"
                        value={find}
                        spellCheck={false}
                        onChangeText={(event) => {
                            setFind(event);
                        }}
                        lang={
                            configuration === 'Subtitling'
                                ? localStorage.getItem('langTranslate')
                                : localStorage.getItem('langTranscribe')
                        }
                        enabled={
                            configuration === 'Subtitling'
                                ? !(
                                      !localStorage.getItem('langTranslate') ||
                                      localStorage.getItem('langTranslate') === 'en' ||
                                      localStorage.getItem('langTranslate') === 'en-k'
                                  )
                                : !(
                                      !localStorage.getItem('langTranscribe') ||
                                      localStorage.getItem('langTranscribe') === 'en' ||
                                      localStorage.getItem('langTranscribe') === 'en-k'
                                  )
                        }
                        maxOptions={5}
                        rows={1}
                        renderComponent={(props) => <textarea {...props} />}
                    />

                    {currentFound !== null && found.length > 0 && (
                        <div style={{ color: '#000', textAlign: 'right' }} className="mt-3">
                            {currentFound + 1} / {found.length}
                        </div>
                    )}

                    <div className="d-flex">
                        {currentFound !== null && found.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => setCurrentFound(currentFound - 1)}
                                disabled={currentFound === 0}
                                className="mt-3 replace-btn"
                            >
                                Prev
                            </Button>
                        )}

                        <Button
                            variant="primary"
                            onClick={handleFind}
                            className={currentFound !== null && found.length > 0 ? 'mt-3 mr-10' : 'mt-3 find-btn'}
                        >
                            Find
                        </Button>

                        {currentFound !== null && found.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => setCurrentFound(currentFound + 1)}
                                disabled={currentFound === found.length - 1}
                                className="mt-3"
                            >
                                Next
                            </Button>
                        )}
                    </div>

                    <label for="exampleInputEmail1" className="mt-3">
                        Replace
                    </label>
                    <ReactTransliterate
                        className="form-control"
                        value={replace}
                        spellCheck={false}
                        onChangeText={(event) => {
                            setReplace(event);
                        }}
                        lang={
                            configuration === 'Subtitling'
                                ? localStorage.getItem('langTranslate')
                                : localStorage.getItem('langTranscribe')
                        }
                        enabled={
                            configuration === 'Subtitling'
                                ? !(
                                      !localStorage.getItem('langTranslate') ||
                                      localStorage.getItem('langTranslate') === 'en' ||
                                      localStorage.getItem('langTranslate') === 'en-k'
                                  )
                                : !(
                                      !localStorage.getItem('langTranscribe') ||
                                      localStorage.getItem('langTranscribe') === 'en' ||
                                      localStorage.getItem('langTranscribe') === 'en-k'
                                  )
                        }
                        maxOptions={5}
                        rows={1}
                        renderComponent={(props) => <textarea {...props} />}
                    />
                    <div className="d-flex">
                        <Button
                            variant="secondary"
                            onClick={handleReplace}
                            disabled={found.length === 0}
                            className="mt-3 replace-btn"
                        >
                            Replace
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleReplaceAll}
                            disabled={found.length === 0}
                            className="mt-3"
                        >
                            Replace All
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default FindAndReplace;
