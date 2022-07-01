import React, { useState } from "react";
import LoginAPI from "../redux/actions/api/User/Login";
import RegisterAPI from "../redux/actions/api/User/Register";
import "../utils/Login.css";

const LoginForm = ({ showLogin, setShowLogin }) => {

    const [credentials, setCredentials] = useState({username: "", password: ""});
    const [details, setDetails] = useState({username: "", password: "", password2: "", email: "", first_name: "", last_name: ""});
    const [err, setErr] = useState("");
    const [isSignIn, setIsSignIn] = useState(true);

    const handleLogin = (e) => {
        e.preventDefault();
        const apiObj = new LoginAPI(credentials.username, credentials.password);
        fetch(apiObj.apiEndPoint(), {
          method: "POST",
          body: JSON.stringify(apiObj.getBody()),
          headers: apiObj.getHeaders().headers,
        })
          .then(async (res) => {
            const rsp_data = await res.json();
            console.log(rsp_data);
            if (!res.ok) {
              setErr("Username or Password incorrect");
            } else {
              localStorage.setItem("chitralekha_access_token", rsp_data.token);
              setErr("");
              setShowLogin(false);
            }
          })
          .catch((error) => {
            if (typeof error === "string") {
              setErr(error);
            } else {
              setErr("Something went wrong");
            }
          });
    }

    const handleSignUp = (e) => {
        e.preventDefault();
        const apiObj = new RegisterAPI(details.username, details.email, details.first_name, details.last_name, details.password, details.password2);
        fetch(apiObj.apiEndPoint(), {
          method: "POST",
          body: JSON.stringify(apiObj.getBody()),
          headers: apiObj.getHeaders().headers,
        })
          .then(async (res) => {
            const rsp_data = await res.json();
            console.log(rsp_data);
            if (!res.ok) {
              setErr("Invalid details");
            } else {
              localStorage.setItem("chitralekha_access_token", rsp_data.token);
              setErr("");
              setShowLogin(false);
            }
          })
          .catch((error) => {
            if (typeof error === "string") {
              setErr(error);
            } else {
              setErr("Something went wrong");
            }
          });
    }

  return (
    <div className={`${showLogin ? "" : "active"} show`}>
      <div className="login-form">
        <div className="form-box solid">
          <button type="button" className="close-btn" onClick={() => setShowLogin(false)}>x</button>
          {isSignIn ? <form className="login-form-form">
            <h1 className="login-text">Sign In</h1>
            {err && <p className="err-msg">{err}</p>}
            <label>Username</label>
            <br></br>
            <input type="text" className="login-box" value={credentials.username} onChange={(e) => setCredentials({...credentials, username: e.currentTarget.value})} />
            <br></br>
            <label>Password</label>
            <br></br>
            <input type="password" className="login-box" value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.currentTarget.value})}/>
            <br></br>
            <button className="login-btn" onClick={handleLogin}>Login</button>
            <p className="form-text">Don't have an account? <span className="link" onClick={() => setIsSignIn(!isSignIn)}>Sign up</span></p>
          </form> 
          :
          <form className="login-form-form">
            <h1 className="login-text">Sign Up</h1>
            {err && <p className="err-msg">{err}</p>}
            <div className="signup-group">
              <div>
                <label>Username</label>
                <br></br>
                <input type="text" className="login-box" value={details.username} onChange={(e) => setDetails({...details, username: e.currentTarget.value})} />
                <br></br>
              </div>
              <div>
                <label>Email</label>
                <br></br>
                <input type="email" className="login-box" value={details.email} onChange={(e) => setDetails({...details, email: e.currentTarget.value})}/>
                <br></br>
              </div>
            </div>
            <div className="signup-group">
              <div>
                <label>First Name</label>
                <br></br>
                <input type="text" className="login-box" value={details.first_name} onChange={(e) => setDetails({...details, first_name: e.currentTarget.value})}/>
                <br></br>
              </div>
              <div>
                <label>Last Name</label>
                <br></br>
                <input type="text" className="login-box" value={details.last_name} onChange={(e) => setDetails({...details, last_name: e.currentTarget.value})}/>
                <br></br>
              </div>
            </div>
            <div className="signup-group">
              <div>
                <label>Password</label>
                <br></br>
                <input type="password" className="login-box" value={details.password} onChange={(e) => setDetails({...details, password: e.currentTarget.value})}/>
                <br></br>
              </div>
              <div>
                <label>Confirm Password</label>
                <br></br>
                <input type="password" className="login-box" value={details.password2} onChange={(e) => setDetails({...details, password2: e.currentTarget.value})}/>
                <br></br>
              </div>
            </div>
            <button className="login-btn" onClick={handleSignUp}>Sign Up</button>
            <p className="form-text">Already have an account? <span className="link" onClick={() => setIsSignIn(!isSignIn)}>Sign In</span></p>
          </form>}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
