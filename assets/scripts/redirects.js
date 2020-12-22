import React from 'react';
import ReactDOM from 'react-dom';
import Redirects from './Redirects.jsx'

let settingsRoot = document.getElementById('redirectsroot');
if (settingsRoot) {
  ReactDOM.render(
    <div>
      {/*This is rendered with  React-->*/}
      <Redirects/>
    </div>,
    settingsRoot
  );
}
