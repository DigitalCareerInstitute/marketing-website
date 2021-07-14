import intlTelInput from 'intl-tel-input';
import { get_form_payload } from "./helper.js"
import utilsScript from "./intl-tel-input-utils.min.js"
let studentquestionroot = document.getElementById("questionroot")
let company_questionroot = document.getElementById("company_questionroot")

const questionroot = company_questionroot ? company_questionroot : studentquestionroot

const isGerman = window.location.pathname.indexOf('/de') !== -1

const getAnswers = (question, model) => Object.values(model.layers.find(layer => layer.type === "diagram-nodes").models)
	.filter(links => Object.values(model.layers.find(layer => layer.type === "diagram-links").models)
		.filter(layer => layer.source === question.id).map(l => l.target).includes(links.id))

const canTrigger = (questions, model) => {
	const ifThereAreNotJustButtons = questions.filter(q => {
		const allAnswers = getAnswers(q, model)
		const buttons = allAnswers.filter(answer => answer.extras.freeanswer || answer.extras.dropdown)
		return buttons.length > 0
	})
	return ifThereAreNotJustButtons.length === 0
}

const itiConfig = {
	initialCountry: "de",
	utilsScript: utilsScript,
	separateDialCode: true,
	preferredCountries: ["de", "gb"]
}
const findAnswers = (questions, model) => {
	const diagramLinks = model.layers.find(layer => layer.type === "diagram-links").models
	if (diagramLinks) {
		var linksToNextQ = questions.map(q => {
			return Object.values(model.layers.find(layer => layer.type === "diagram-nodes").models)
				.filter(links => Object.values(diagramLinks)
					.filter(layer => layer.source === q.id).map(l => l.target).includes(links.id))
		}).flat().map(a => a.ports[1].links).flat()

		var nextQuestions = Object.values(model.layers.find(layer => layer.type === "diagram-nodes").models)
			.filter(node => {
				return node.ports[0].links.find(l => {
					if (linksToNextQ.includes(l)) {
						return node
					}
				})
			});
		questionroot.innerHTML = `
    <div class="w-100">
    <div id="popup" class="py-5 d-flex flex-column justify-content-between w-300px w-100">
      <form onSubmit="return false;" class="dynamicinputform">
        ${questions.map((question, index) => {
			const answers = getAnswers(question, model);
			const buttons = answers.filter(answer => !answer.extras.freeanswer && !answer.extras.dropdown);
			const freeanswers = answers.filter(answer => answer.extras.freeanswer && !answer.extras.dropdown);
			const dropdowns = answers.filter(answer => answer.extras.dropdown);
			return `
            <div class="d-flex justify-content-center mb-5 px-3">
              <p class="text-center">${isGerman && question.extras.questiontranslation ? question.extras.questiontranslation : question.name}</p>
            </div>
            <div class="">
              <div class="w-100 px-5 px-lg-3 px-xl-5">
              ${freeanswers.length > 0 ? "<div class='row'>" + freeanswers.map(answer => {
				return `<div class="${freeanswers.length === 1 ? "col-md-12" : "col-md-6"}"><label for="freeanswer_${answer.extras.answeridentifier}" >${isGerman ? (answer.extras.answertranslation.indexOf(':') !== -1 ? answer.extras.answertranslation.split(':')[0] : answer.extras.answertranslation) : (answer.name.indexOf(':') !== -1 ? answer.name.split(':')[0] : answer.name)}</label>
                <input placeholder="${isGerman ? (answer.extras.answertranslation.indexOf(':') !== -1 ? answer.extras.answertranslation.split(':')[1] : "") : (answer.name.indexOf(':') !== -1 ? answer.name.split(':')[1] : "")}" class="form-control mb-4 freeanswer dynamicinput" name="${answer.extras.answeridentifier}" title="must start with + followed by numbers" data-type="question" type="${answer.extras.answeridentifier.includes("email") ? "email" : answer.extras.answeridentifier.match(/phone/i) ? "tel" : "text"}"  id="freeanswer_${answer.extras.answeridentifier}" required/> </div>`
			}).join('') + "</div><span id='error-msg' class='text-danger'></span>" : ""}
              ${dropdowns.length > 0 ? dropdowns.map(answer => (`<label for="dropdown_${answer.extras.answeridentifier}" >${isGerman && answer.extras.answertranslation ? answer.extras.answertranslation.split(":")[0] : answer.name.split(":")[0]}</label><select id="dropdown_${answer.extras.answeridentifier}" name="${answer.extras.answeridentifier}" class='form-select mb-3' class="dynamicinput dropdown" required="required"><option class="form-control mb-4" name="button" type="text" data-type="question" placeholder="${isGerman ? "Auswählen..." : "Select..."}" type="text" value="" disabled selected>${isGerman ? "Auswählen..." : "Select..."}</option>` +
								(isGerman && answer.extras.answertranslation ? answer.extras.answertranslation : answer.name).split(":").reverse()[0].split(',').map(dropdownItem => `<option class="form-control mb-4" name="button" type="text" data-type="question" value="${dropdownItem.replace(/\(.*\)/, '').trim()}" placeholder="${answer.extras.answeridentifier}" type="text"> ${dropdownItem.replace(/.*\((.*)\)/, '$1')}`).join('')
				+ `</select>`)).join("") : ""}
              ${buttons.map(answer => {
					return `<div class="form-group">
                <input type="radio" data-trigger="${canTrigger(questions, model)}" id="${answer.name}" name="${question.extras.questionidentifier}" class="btn-check dynamicinputradio" data-question="${question.extras.questionidentifier}" data-nextquestions="${nextQuestions.map(a => a.id)}" value="${answer.name}" required/>
                <label class=" btn btn-lg mb-4 btn-white blue-light-shadow answerbutton w-100 mb-3 mr-3" for="${answer.name}">${isGerman && answer.extras.answertranslation ? answer.extras.answertranslation : answer.name}</label>
                </div>`
				}).join('')}
              ${canTrigger(questions, model) ? `<button class="d-none fakebutton btn btn-lg w-100 btn-outline-secondary mb-4  mr-2 answerbutton" data-nextquestions="${nextQuestions.map(a => a.id)}" type="submit">${isGerman ? `Weiter` : `Next`}</button>` : ``}
                  </div>
                </div>` }).join('')}
              <div class="px-5 px-lg-3 px-xl-5 mt-5">
              <div class="">
                ${nextQuestions.length === 0 ? `<p><label class="checkbox TermsofService text-muted">${isGerman ? `Gelesen und akzeptiert` : `I have read and agree to the`}<input type="checkbox" name="TermsofService" value="true" required="required"><span class="checkmark"></span></label><a href="#" class="ml-1 font-weight-normal text-dark text-decoration-none" data-toggle="modal" data-target="#dataPrivacy">${isGerman ? `Datenschutz` : `Data privacy`}</a></p>` : ``}
                ${canTrigger(questions, model) ? `` : `<div class="d-flex justify-content-end"><button class="btn btn-lg mb-4  mr-2 answerbutton ${nextQuestions.length === 0 ? "w-md-50 w-100 btn-secondary" : "btn-outline-secondary w-100"}" data-nextquestions="${nextQuestions.map(a => a.id)}" type="submit">${nextQuestions.length === 0 ? (isGerman ? `Abschicken` : `Submit`) : (isGerman ? `Weiter` : `Next`)}`}</button></div>
                ${nextQuestions.length === 0 ? `<p class='text-muted small asterix'>
                  With this registration you agree with the storage of your data. These data will be used by Digital Career Institute gGmbH to contact you. You have the right to access, modify, rectify and delete these data.` : ``}
                </p>
              </div>
            </div>
        </form>
      </div>
    </div>`

		const input = document.querySelector('input[name*="phone"]')
		const iti = intlTelInput(input, itiConfig);
		input.addEventListener('blur', (e) => {
			var errorCode = iti.getValidationError();
			if (errorCode !== 0) {
				var errorMap = []
				errorMap[-99] = "Invalid number"
				errorMap[1] = "Invalid country code"
				errorMap[2] = "Too short"
				errorMap[3] = "Too long"
				errorMap[4] = "Might be a local number only"
				errorMap[5] = "Invalid length";
				document.querySelector('#error-msg').innerHTML = errorMap[errorCode];
			} else {
				document.querySelector('#error-msg').innerHTML = "";
			}
		})
		if (window._nb !== undefined) {
			_nb.fields.registerListener(document.querySelector('input[type="email"]'), true);
		}
	}
}

if (
	questionroot
	// && !localStorage.getItem('dcianswers') 
) {
	fetch(`/admin/questions/fetch/${studentquestionroot ? `student` : `company`} `, {
		headers: {
			"content-type": "application/json"
		},
	}).then(res => res.json())
		.then(res => {
			if (res.payload.questions.active) {
				const question = res.payload.questions
				const diagramNodes = question.model.layers.find(layer => layer.type === "diagram-nodes").models
				const startquestion = Object.values(diagramNodes).filter(model => model.ports.find(port => port.label === "In").links.length === 0)
				document.addEventListener('submit', (e) => {
					if (e.target.classList.contains("dynamicinputform")) {
						jumpToNextQuestion(e, diagramNodes, question.model)
					}
				})
				document.addEventListener('change', (e) => {
					if (e.target.classList.contains("dynamicinputradio") && e.target.dataset.trigger === "true") {
						e.target.elements = [e.target, [...e.target.closest('form').elements].find(i => i.type === "submit")]
						jumpToNextQuestion(e, diagramNodes, question.model)
					}
				})
				findAnswers(startquestion, question.model)
			}
		})
}

const jumpToNextQuestion = (e, diagramNodes, model) => {
	e.preventDefault()
	const form_payload = get_form_payload(e.target.elements)
	localStorage.setItem('dcianswers', JSON.stringify({ ...JSON.parse(localStorage.getItem('dcianswers')), ...form_payload }))
	const nextQuestions = Object.values(diagramNodes).filter(n => [...e.target.elements].find(i => i.type === "submit").dataset.nextquestions.includes(n.id.split(',')))
	if (nextQuestions.length > 0) {
		findAnswers(nextQuestions, model)
	} else {
		let payload = JSON.parse(localStorage.getItem('dcianswers'))
		if (payload.age) {
			payload.age_years = payload.age
			delete payload.age
		}
		fetch(`/contact`, {
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(payload)
		}).then(res => res.json())
			.then(data => {
				if (data.response.contact_id) {
					questionroot.querySelector('#popup').innerHTML = `<h2 class="text-center">Thanks</h2>`
					setTimeout(() => {
						window.location.replace(`${window.location.origin}/thank-you/${data.response.contact_id}`);
					}, 500);
					localStorage.removeItem('dcianswers')
				} else if (data.response.error) {
					const div = document.createElement('div')
					div.innerHTML = `<div class="flash m-0 mr-3 alert fade show alert-danger ">Please fill out all form fields<button class="close ml-3" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button></div>`
					document.body.appendChild(div)
				}
			})
	}
}

const input = document.querySelector('input[name*="phone"]')
if (input) {
	const iti = intlTelInput(input, itiConfig);
}