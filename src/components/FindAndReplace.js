import "../utils/Login.css";
import { ReactTransliterate } from 'react-transliterate';

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
        setFind("");
        setReplace("");
        setFound([]);
        setCurrentFound();
    }

  return (
    <div className={`${showFindAndReplace ? "" : "login-active"} login-show`}>
      <div className="login-form">
        <div className="form-box solid">
          <button type="button" className="close-btn" onClick={handleClose}>x</button>
          <form className="login-form-form">
            <h1 className="login-text">Find and Replace</h1>
            <label>Find</label>
            <br></br>
            <ReactTransliterate
                className="login-box"
                value={find}
                spellCheck={false}
                onChangeText={(event) => {
                    setFind(event);
                }}
                lang={configuration === "Subtitling" ? localStorage.getItem('langTranslate') : localStorage.getItem('langTranscribe')}
                enabled={
                  configuration === "Subtitling"
                    ? !(!localStorage.getItem('langTranslate') ||
                        localStorage.getItem('langTranslate') === 'en' ||
                        localStorage.getItem('langTranslate') === 'en-k')
                    : !(!localStorage.getItem('langTranscribe') ||
                        localStorage.getItem('langTranscribe') === 'en' ||
                        localStorage.getItem('langTranscribe') === 'en-k')
                }
                maxOptions={5}
                rows={1}
                renderComponent={(props) => <textarea {...props} />}
            />
            {/* <input type="text" className="login-box" value={find} onChange={(e) => setFind(e.currentTarget.value)} /> */}
            <br></br>
            <button type="button" className="login-btn" onClick={handleFind}>Find</button>
            {currentFound !== null && found.length >0 && <div className="found-toggle">
              <p className="found-num">{currentFound+1} / {found.length}</p>
              <button type="button" className="login-btn" onClick={() => setCurrentFound(currentFound-1)} disabled={currentFound === 0}>Prev</button>
              <button type="button" className="login-btn" onClick={() => setCurrentFound(currentFound+1)} disabled={currentFound === found.length - 1}>Next</button>
            </div>}
            <label>Replace</label>
            <br></br>
            <ReactTransliterate
                className="login-box"
                value={replace}
                spellCheck={false}
                onChangeText={(event) => {
                    setReplace(event);
                }}
                lang={configuration === "Subtitling" ? localStorage.getItem('langTranslate') : localStorage.getItem('langTranscribe')}
                enabled={
                  configuration === "Subtitling"
                    ? !(!localStorage.getItem('langTranslate') ||
                        localStorage.getItem('langTranslate') === 'en' ||
                        localStorage.getItem('langTranslate') === 'en-k')
                    : !(!localStorage.getItem('langTranscribe') ||
                        localStorage.getItem('langTranscribe') === 'en' ||
                        localStorage.getItem('langTranscribe') === 'en-k')
                }
                maxOptions={5}
                rows={1}
                renderComponent={(props) => <textarea {...props} />}
            />
            {/* <input type="text" className="login-box" value={replace} onChange={(e) => setReplace(e.currentTarget.value)}/> */}
            <br></br>
            <div className="found-toggle">
              <button type="button" className="login-btn" onClick={handleReplace} disabled={found.length === 0}>Replace</button>
              <button type="button" className="login-btn" onClick={handleReplaceAll} disabled={found.length === 0}>Replace All</button>
            </div>
          </form> 
        </div>
      </div>
    </div>
  );
};

export default FindAndReplace;
