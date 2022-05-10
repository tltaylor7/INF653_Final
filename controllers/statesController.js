const data = {
    states: require('../model/states.json'),
    setStates: function(data) { this.states = data}
}
const State = require('../model/State.js');

const getAllStates = async (req, res) => {

    let statesArray;
    //checks for contig, if true show 48 states
    if (req.query?.contig === undefined) {

    }
    if(req.query?.contig === 'true') {
        statesArray = data.states.filter(st => st.code !== 'AK' && st.code !== 'HI')
    } 
    //checks for contig, if false -> show Alaska and Hawaii
    else if (req.query.contig === 'false') {
        statesArray = data.states.filter(st => st.code === 'AK' || st.code === 'HI')
    }  
    //show all state data
    else {
        statesArray = data.states;
    }
    //set data from database 
    let mongoState = await State.find();
    //look for fun facts in each state found
    statesArray.forEach(state => {
            const stateFound = mongoState.find(st => st.stateCode === state.code);
            //if found, show state funfacts
            if (stateFound) {
                state.funfacts = [...stateFound.funfacts];
            }
    })
    //return data
    res.json(statesArray);
}

const getState = async (req, res) => {
    //gets state code and stores in single state
    const singleState =  data.states.filter(st => st.code === req.code);
    
    //get data from database
    let mongoState = await State.find();
    //look for fun facts in each state found
    singleState.forEach(state => {
            let stateFound = mongoState.find(st => st.stateCode === state.code);
            //if found, show state funfacts
            if (stateFound) {
                state.funfacts = [...stateFound.funfacts];
            }
    })
    //return data
    res.json(singleState);
}

const getStateFunFact = async (req, res) => {
    //gets funfact data from database
    let funfact = await State.findOne({stateCode: req.code}).exec();
    //if none, return message
    if (!funfact) {
        return res.status(400).json ({"message": "No fact found for this state."})
    }
    else {
        //randomly get one fun fact from the array
        let funfactsArr = funfact.funfacts[Math.floor(Math.random() * funfact.funfacts.length)];
        //returns one funfact
        res.json({funfact: funfactsArr})
    }
}

const createStateFunFact = async (req, res) => {
    //checks for a funfact parameter, displays message if none 
    if (!req?.body?.funfacts) {
        return res.status(400).json({ 'message': 'Fun fact parameter required' });
    }
    //checks if funfact is an array, displays message if it is not in array form 
    if (!Array.isArray(req.body.funfacts)) {
        return res.status(400).json({ 'message': 'Fun facts require an array' });
    }
    //checks for fun facts in database at state code
    const funfact = await State.findOne({ stateCode: req.code }).exec();
    //if no funfacts, create funfacts 
    if (!funfact){
            //create funfacts with specified parameters
            const funfactArr = await State.create({
                "stateCode": req.code,
                "funfacts": req.body.funfacts
        });
        //returns newly created funfacts
        res.status(201).json(funfactArr)
    } else {
        //adds fun fact to the list of funfacts
        funfact.funfacts = [...funfact.funfacts, ...req.body.funfacts];
        //saves database updates
        const funfactArr = await funfact.save();  
        //returns updated funfacts
        res.status(201).json(funfactArr);
    }
}

const updateStateFunFact = async (req, res) => {
    //checks for index value, returns message if not found
    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }
    //checks for a funfact parameter, displays message if none 
    if (!req?.body?.funfacts) {
        return res.status(400).json({ 'message': 'funfact parameter is required.' });
    }
    //checks for fun facts in database at state code
    const funfact = await State.findOne({ stateCode: req.code }).exec();
    //if no funfacts for state, display message 
    if (!funfact){
        return res.status(400).json({ 'message': 'The state has no fun facts.'});
    } 
    //gets index from body - 1 to match array
    const funfactIndex = req.body.index - 1;
    //grabs fun facts from database
    let funfactArr = funfact.funfacts; 
    //updates fun facts at location of index
    funfactArr.splice(funfactIndex, 1, req.body.funfacts);  
    //saves database updates
    const funfactPatch = await funfact.save();  
    //returns updated fun facts
    res.status(200).json(funfactPatch); 

}

const deleteStateFunFact = async (req, res) => {
    //checks for index value, returns message if not found
    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }
    //checks for fun facts in database at state code
    const funfact = await State.findOne({ stateCode: req.code }).exec();
    //if no funfacts for state, display message 
    if (!funfact){
        return res.status(400).json({ 'message': 'The state has no fun facts.'});
    } 
    //gets index from body - 1 to match array
    const funfactIndex = req.body.index - 1;    
    //stores values
    let funfactArr = funfact.funfacts;
    //removes entry at index location
    funfactArr.splice(funfactIndex, 1);
    //saves database updates
    const funfactDeleted = await funfact.save();    
    //returns updated fun facts
    res.status(204).json(funfactDeleted);

}

const getStateCapital = async (req, res) => {
    let state = data.states.find(st => st.code === req.code);
    //state not fun, return no capital found
    if (!state) {
        return res.status(400).json ({"message": "No capital for this state."})
    }
    //returns state code and capital
    else {
        return res.status(200).json ({state: state.state, capital: state.capital_city})
    }
}

const getStateNickname = async (req, res) => {
    let state = data.states.find(st => st.code === req.code);
    
    if (!state) {
        return res.status(400).json ({"message": "No nickname for this state."})
    }
    //returns state code and nickname
    else {
        return res.status(200).json ({state: state.state, nickname: state.nickname})
    }
}

const getStatePopulation = async (req, res) => {
    let state = data.states.find(st => st.code === req.code);
    
    if (!state) {
        return res.status(400).json ({"message": "No population for this state."})
    }
    //returns state code and population
    else {
        return res.status(200).json ({state: state.state, population: state.population})
    }
}

const getStateAdmission = async (req, res) => {
    let state = data.states.find(st => st.code === req.code);
    
    if (!state) {
        return res.status(400).json ({"message": "No admission for this state."})
    }
    //returns state code and admission
    else {
        return res.status(200).json ({state: state.state, admission: state.admission_date})
    }
}

module.exports = {
    getAllStates,
    getState,
    getStateFunFact,
    createStateFunFact,
    updateStateFunFact,
    deleteStateFunFact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission
}