const { getAvailableTranslations } = require('./AbstractController');
const Employee = require('../models/employee');
module.exports.getEmployees = async function (req, res) {
    try {
        const query = await getAvailableTranslations(req, res);
        const employees = await Employee.find(query)
            .populate('locations')
            .sort({ order: 1 })
            .exec();
        res.render('employees', {
            employees
        });
    }
    catch (err) {
        console.log(err);
    }
};
//# sourceMappingURL=EmployeesController.js.map