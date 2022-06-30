import React, { useState } from "react";
import "../utils/Login.css";

const LoginForm = ({ showLogin, setShowLogin }) => {

    const [credentails, setCredentials] = useState({email: "", password: ""});

    const handleLogin = (e) => {
        e.preventDefault();
        console.log(credentails);
        setShowLogin(false);
    }

  return (
    <div className={`${showLogin ? "" : "active"} show`}>
      <div className="login-form">
        <div className="form-box solid">
          <button type="button" className="close-btn" onClick={() => setShowLogin(false)}>x</button>
          <form className="login-form-form">
            <h1 className="login-text">Sign In</h1>
            <label>Email</label>
            <br></br>
            <input type="email" className="login-box" value={credentails.email} onChange={(e) => setCredentials({...credentails, email: e.currentTarget.value})} />
            <br></br>
            <label>Password</label>
            <br></br>
            <input type="password" className="login-box" value={credentails.password} onChange={(e) => setCredentials({...credentails, password: e.currentTarget.value})}/>
            <br></br>
            <button className="login-btn" onClick={handleLogin}>Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
