import React from 'react';

export default function BottomLinks() {
    return (
        <>
            <p style={{ paddingLeft: '10px', marginTop: '-0.5px' }}>
                <b>External Links</b>
            </p>
            <ul
                style={{
                    // height: '25px',
                    // paddingLeft: '25%',
                    // paddingRight: '25%',
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    // position: 'absolute',
                    // top: '96vh',
                    // width: '100vw',
                    // textAlign: 'center',
                    // justifyContent: 'space-around',
                    margin: '-10px 10px 10px 10px',
                    padding: 0,
                    textAlign: 'center',
                    // width: '95%',
                    // backgroundColor: 'rgb(33 150 243 / 20%)',
                }}
            >
                <li
                    style={{
                        width: '100%',
                        // marginBottom: '5px',
                        backgroundColor: 'rgb(33 150 243 / 20%)',
                        padding: '10px 5px',
                    }}
                >
                    <a
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            textDecoration: 'none',
                            color: 'white',
                            padding: '10px 50px',
                        }}
                        href="https://github.com/AI4Bharat"
                    >
                        Organisation
                    </a>
                </li>
                <br />
                <li
                    style={{
                        width: '100%',
                        backgroundColor: 'rgb(33 150 243 / 20%)',
                        padding: '10px 5px',
                    }}
                >
                    <a
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none', color: 'white', padding: '10px 50px' }}
                        href="https://github.com/AI4Bharat/Chitralekha/"
                    >
                        GitHub Repo
                    </a>
                </li>
            </ul>
        </>
    );
}
