import React, { useState } from "react";
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
    handleFind
 }) => {

    const handleClose = () => {
        setShowFindAndReplace(false);
        setFind("");
        setReplace("");
        setFound([]);
    }

    console.log(found)

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
            <label>Replace</label>
            <br></br>
            <input type="text" className="login-box" value={replace} onChange={(e) => setReplace(e.currentTarget.value)}/>
            <br></br>
            <button type="button" className="login-btn" onClick={handleReplaceAll}>Replace All</button>
            <button type="button" className="login-btn" onClick={handleReplace}>Replace</button>
          </form> 
        </div>
      </div>
    </div>
  );
};

export default FindAndReplace;
