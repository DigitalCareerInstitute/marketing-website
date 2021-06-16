import React from 'react';
import ReactDOM from 'react-dom';
import QuestionsDiagram from './QuestionsDiagram.jsx'

let settingsRoot = document.getElementById('questionsdiagramroot');
if (settingsRoot) {
  ReactDOM.render(
    <div>
      {/*This is rendered with  React-->*/}
      <QuestionsDiagram/>
    </div>,
    settingsRoot
  );
}





// {
//     "Are you looking for a carreer change?": {
//         "yes": {
//             "Are you older than 45?": {
//                 "no": {
//                     "What is your professional situation?": {
//                         "Full / Partime job": { },
//                         "Student / Trainee": { },
//                         "Unemployed": {
//                             "Are you registered with the Bundesagentur or Agentur fuer Arbeit?": {
//                                 "Jobcenter": {},
//                                 "Agentur fuer Arbeit": {},
//                                 "No": {}
//                             }
//                          }
//                     }
//                 },
//                 "yes": {
//                     "What is your professional situation?": {
//                         "Full / Partime job": { },
//                         "Student / Trainee": { },
//                         "Unemployed": { }
//                     }
//                 }
//             }
//         },
//         "no": {
//             "Are you older than 45?": {
//                 "no": {
//                     "What is your professional situation?": {
//                         "Full / Partime job": { },
//                         "Student / Trainee": { },
//                         "Unemployed": { }
//                     }
//                 },
//                 "yes": {
//                     "What is your professional situation?": {
//                         "Full / Partime job": { },
//                         "Student / Trainee": { },
//                         "Unemployed": { }
//                     }
//                 }
//             }
//         }
//     }
// }