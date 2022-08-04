import React, { useState } from 'react';
import { Modal, Button, FloatingLabel, Form } from 'react-bootstrap';
import LoginAPI from '../redux/actions/api/User/Login';
import RegisterAPI from '../redux/actions/api/User/Register';
import '../utils/Login.css';

const LoginForm = ({ showLogin, setShowLogin }) => {
    const initCredentials = { username: '', password: '' };
    const initDetails = { username: '', password: '', password2: '', email: '', first_name: '', last_name: '' };
    const [credentials, setCredentials] = useState(initCredentials);
    const [details, setDetails] = useState(initDetails);
    const [err, setErr] = useState('');
    const [isSignIn, setIsSignIn] = useState(true);

    const handleLogin = (e) => {
        e.preventDefault();
        const apiObj = new LoginAPI(credentials.username, credentials.password);
        fetch(apiObj.apiEndPoint(), {
            method: 'POST',
            body: JSON.stringify(apiObj.getBody()),
            headers: apiObj.getHeaders().headers,
        })
            .then(async (res) => {
                const rsp_data = await res.json();
                console.log(rsp_data);
                if (!res.ok) {
                    setErr('Username or Password incorrect');
                } else {
                    localStorage.setItem('chitralekha_access_token', rsp_data.token);
                    localStorage.setItem('user_id', rsp_data.user?.id);
                    localStorage.setItem('username', rsp_data.user?.username);
                    localStorage.setItem('email', rsp_data.user?.email);
                    localStorage.setItem('first_name', rsp_data.user?.first_name);
                    localStorage.setItem('last_name', rsp_data.user?.last_name);
                    localStorage.setItem('isLoggedIn', true);
                    handleClose();
                }
            })
            .catch((error) => {
                if (typeof error === 'string') {
                    setErr(error);
                } else {
                    setErr('Something went wrong');
                }
            });
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        const apiObj = new RegisterAPI(
            details.username,
            details.email,
            details.first_name,
            details.last_name,
            details.password,
            details.password2,
        );
        fetch(apiObj.apiEndPoint(), {
            method: 'POST',
            body: JSON.stringify(apiObj.getBody()),
            headers: apiObj.getHeaders().headers,
        })
            .then(async (res) => {
                const rsp_data = await res.json();
                console.log(rsp_data);
                if (!res.ok) {
                    setErr('Invalid details');
                } else {
                    localStorage.setItem('chitralekha_access_token', rsp_data.token);
                    localStorage.setItem('user_id', rsp_data.user?.id);
                    localStorage.setItem('username', rsp_data.user?.username);
                    localStorage.setItem('email', rsp_data.user?.email);
                    localStorage.setItem('first_name', rsp_data.user?.first_name);
                    localStorage.setItem('last_name', rsp_data.user?.last_name);
                    handleClose();
                }
            })
            .catch((error) => {
                if (typeof error === 'string') {
                    setErr(error);
                } else {
                    setErr('Something went wrong');
                }
            });
    };

    const handleClose = () => {
        setShowLogin(false);
        setCredentials(initCredentials);
        setDetails(initDetails);
        setErr('');
    };

    return (
        <>
            {isSignIn ? (
                <Modal show={showLogin} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Sign In</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {err && <p className="err-msg">{err}</p>}
                        <FloatingLabel controlId="floatingInput" label="Username" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="name@example.com"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingPassword" label="Password">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleLogin}>
                            Login
                        </Button>
                    </Modal.Footer>
                </Modal>
            ) : (
                <Modal show={showLogin} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Sign Up</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {err && <p className="err-msg">{err}</p>}
                        <FloatingLabel controlId="floatingUsername" label="Username" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="name@example.com"
                                value={details.username}
                                onChange={(e) => setDetails({ ...details, username: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingEmail" label="Email" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={details.email}
                                onChange={(e) => setDetails({ ...details, email: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingFirstName" label="First Name" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="name@example.com"
                                value={details.first_name}
                                onChange={(e) => setDetails({ ...details, first_name: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingLastName" label="Last Name" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="name@example.com"
                                value={details.last_name}
                                onChange={(e) => setDetails({ ...details, last_name: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={details.password}
                                onChange={(e) => setDetails({ ...details, password: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={details.password2}
                                onChange={(e) => setDetails({ ...details, password2: e.currentTarget.value })}
                            />
                        </FloatingLabel>
                        <div style={{color: '#000', textAlign: 'center'}}>
                            <span style={{padding: '8px 12px'}}>
                                Already have an account?{' '}
                            </span>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setErr('');
                                    setIsSignIn(!isSignIn);
                                }}
                            >
                                Sign In
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSignUp}>
                            Sign Up
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default LoginForm;
