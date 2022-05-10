const statesArray = require('../model/states.json');


const verifyStates = () => {

    return (req, res, next) => {

        if (!req?.params?.state){
            return res.status(400).json({"message":"Invalid state abbreviation parameter"});
        }
        
        const stateAbbr = req.params.state.toUpperCase();

        const stateCodes = statesArray.map(st => st.code);

        const isState = stateCodes.find(code => code === stateAbbr);

        if (!isState){
            return res.status(400).json({ "message": "Invalid state abbreviation parameter" })
        }

    req.code = stateAbbr;
    next();    
    }
}

module.exports = verifyStates;