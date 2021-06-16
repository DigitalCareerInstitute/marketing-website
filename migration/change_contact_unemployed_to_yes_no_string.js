const Contact = require("../models/contact");
exports.migration = async () => {
    try {
        const res = await Contact.find()
        let index = 0
        await Promise.all(res.map(async res => {
            if (!["Yes", "No"].includes(res.unemployed)) {
                res.set('unemployed', !res.unemployed ? "No" : "Yes")
                await res.save()
                index++
            }
        }))
        return `Migration successful. Processed ${res.length} documents, changed ${index}.`
    } catch (error) {
        console.log('error', error);
    }
}