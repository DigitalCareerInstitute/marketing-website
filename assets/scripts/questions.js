import React from 'react';
import ReactDOM from 'react-dom';
import QuestionsDiagram from './QuestionsDiagram.jsx'

let settingsRoot = document.getElementById('questionsdiagramroot');
if (settingsRoot) {
  ReactDOM.render(
    <div className="h-100">
      <QuestionsDiagram />
    </div>,
    settingsRoot
  );
}