import React from 'react';

export default function BottomLinks() {
    return (
        <ul
            style={{
                height: '25px',
                paddingLeft: '25%',
                paddingRight: '25%',
                listStyle: 'none',
                display: 'flex',
                position: 'absolute',
                top: '96vh',
                width: '100vw',
                justifyContent: 'space-around',
                backgroundColor: 'rgb(33 150 243 / 20%)',
            }}
        >
            <li>
                <a
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', color: 'white' }}
                    href="https://github.com/AI4Bharat"
                >
                    Organisation
                </a>
            </li>
            <br />
            <li>
                <a
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', color: 'white' }}
                    href="https://github.com/AI4Bharat/Chitralekha/"
                >
                    GitHub Repo
                </a>
            </li>
        </ul>
    );
}
