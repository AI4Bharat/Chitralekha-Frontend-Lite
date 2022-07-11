import "../utils/Login.css";

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
 }) => {

    const handleClose = () => {
        setShowFindAndReplace(false);
        setFind("");
        setReplace("");
        setFound([]);
        setCurrentFound();
    }

  return (
    <div className={`${showFindAndReplace ? "" : "active"} show`}>
      <div className="login-form">
        <div className="form-box solid">
          <button type="button" className="close-btn" onClick={handleClose}>x</button>
          <form className="login-form-form">
            <h1 className="login-text">Find and Replace</h1>
            <label>Find</label>
            <br></br>
            <input type="text" className="login-box" value={find} onChange={(e) => setFind(e.currentTarget.value)} />
            <br></br>
            <button type="button" className="login-btn" onClick={handleFind}>Find</button>
            {currentFound !== null && found.length >0 && <div className="found-toggle">
              <p className="found-num">{currentFound+1} / {found.length}</p>
              <button type="button" className="login-btn" onClick={() => setCurrentFound(currentFound-1)} disabled={currentFound === 0}>Prev</button>
              <button type="button" className="login-btn" onClick={() => setCurrentFound(currentFound+1)} disabled={currentFound === found.length - 1}>Next</button>
            </div>}
            <label>Replace</label>
            <br></br>
            <input type="text" className="login-box" value={replace} onChange={(e) => setReplace(e.currentTarget.value)}/>
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
