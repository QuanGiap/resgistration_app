import React from 'react';
import './App.css';
import {useNavigate,Routes,Route} from 'react-router-dom'
import Login from './components/Login';
function App() {
  const [token,setToken] = React.useState(localStorage.getItem("token"));
  const nav = useNavigate();
  React.useEffect(()=>{
    //token not exist --> go to login page
    if(!token) {
      nav('/login_page');
    }
    //fetch user data from token if exist
    if(token){

    }
  },[token])
  return (
    <div className="App">
      <Routes>
        <Route index element={<div>Home page</div>}/>
        <Route path='/login_page' element={<Login/>}/>
      </Routes>
    </div>
  );
}

export default App;
