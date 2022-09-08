const generateRandomPass=(length)=>{
    let pass = "";
    for(let i = 0;i<length;i++){
        pass+= Math.floor(Math.random() * 10);
    }
    return pass;
}
module.exports = generateRandomPass;