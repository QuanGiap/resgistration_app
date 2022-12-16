const dictionary = {
    address:'Address',
    nickname:'Nickname',
    birthdate:'Birthdate',
    gender:'Gender',
    familyName:'LastName'
}
const setAttribute = (req)=>{
    let attribute = [];
    Object.entries(dictionary).forEach((val)=>{
        const key = val[0];
        const value = val[1];
        if(value in req.body) attribute.push({
            Name:key,
            Value:req.body[value]
        }) 
    })
    return attribute;
}
module.exports = setAttribute;