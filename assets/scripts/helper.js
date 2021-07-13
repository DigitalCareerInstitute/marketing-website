
export const get_form_payload = (elements) => {
	const notUnselectedInputs = [...elements].filter(e => e.type === 'radio' && e.checked || e.type != 'radio')
		.filter(i => i.type !== "submit")
	return notUnselectedInputs
		.reduce((acc, el) => {
			const inputValue = el.type === "checkbox" ? el.checked : el.name === "jobcenter" ? !!Number(el.value) : el.value
			return {
				...acc,
				[el.name]: inputValue
			}
		}, {})
}
const flashAlertTimeout = 5000
export var alertTimeout= flashAlertTimeout