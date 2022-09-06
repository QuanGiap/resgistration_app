import React from "react";
import "./RegistrationForm.css";
import {
  Paper,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from "@mui/material";
import { checkValidAccount }  from "./AccountSignUp";
import AccountSignUp from  "./AccountSignUp"
const steps = ["Create account", "Some of your info", "Review"];

export default function RegistrationForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [textError, setTextError] = React.useState();
  const [textInput, setTextInput] = React.useState({
    firstName: "",
    lastName: "",
    password: "",
    repassword: "",
    email: "",
    country: "",
    phoneNumber: "",
  });
  const isStepOptional = (step) => {
    return step === -1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };
  const stepLayout = [
    {
      layOut: (
        <AccountSignUp
          email={textInput.email}
          password={textInput.password}
          repassword={textInput.repassword}
          setEmail={(text) =>
            setTextInput((prev) => {
              return { ...prev, email: text };
            })
          }
          setPassword={(text) =>
            setTextInput((prev) => {
              return { ...prev, password: text };
            })
          }
          setRepassword={(text) =>
            setTextInput((prev) => {
              return { ...prev, repassword: text };
            })
          }
        />
      ),
      checkFunction:()=>checkValidAccount(textInput.email,textInput.password,textInput.repassword,setTextError),
    },
  ];
  const handleNext = (check) => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    const isValid = check();
    if(!isValid) return;
    console.log(isValid);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Paper elevation={3} className="registration-form">
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === stepLayout.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>

          {stepLayout[activeStep].layOut}

          <Typography className="registration-text-error">
            {textError}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            <Button onClick={()=>handleNext(stepLayout[activeStep].checkFunction)}>
              {activeStep === stepLayout.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Paper>
  );
}
