import "./App.css";
import RegistrationForm from "./components/registration/RegistrationForm";
import StyledEngineProvider from "@mui/material/StyledEngineProvider";
import React from "react";
import AppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import { Routes, Route,useNavigate } from "react-router-dom";
import {
  Grid,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from "@mui/material";
function App() {
  const nav = useNavigate();
  return (
    <StyledEngineProvider injectFirst>
        <AppBar className="bar-app">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              News
            </Typography>
            <Button color="inherit" onClick={()=>nav("/sign_up")}>Sign up</Button>
            <Button color="inherit" onClick={()=>nav("/sign_in")}>Login</Button>
          </Toolbar>
        </AppBar>
        <Routes>
        <Route index element={<div>Home Page</div>} />
        <Route
          path="/sign_up"
          element={
            <Grid container justifyContent="center" spacing={1}>
              <Grid item xs={6} className="registration-box">
                <RegistrationForm />
              </Grid>
            </Grid>
          }
        />
         <Route
          path="/sign_in"
          element={
            <div>Sign in page</div>
          }
        />
        </Routes>
    </StyledEngineProvider>
  );
}

export default App;
