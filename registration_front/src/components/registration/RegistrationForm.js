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
import AccountSignUp, { checkValidAccount } from "./AccountSignUp";
import UserInformInput, { checkUserInform } from "./UserInformInput";
import ConfirmEmail from "./ConfirmEmail";
import { useNavigate } from "react-router-dom";
const steps = ["Create account", "Some of your info", "Confirme your email"];

export default function RegistrationForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [textAnnounce, setTextAnnounce] = React.useState();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repassword, setRepassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [codeVerify, setCodeVerify] = React.useState("");
  const [isVerified, setVerify] = React.useState(false);
  const [isSended, setSend] = React.useState(false);
  const nav = useNavigate();
  const isStepSkipped = (step) => {
    return skipped.has(step);
  };
  const stepLayout = [
    {
      layOut: (
        <AccountSignUp
          email={email}
          password={password}
          repassword={repassword}
          setEmail={(text) => setEmail(text)}
          setPassword={(text) => setPassword(text)}
          setRepassword={(text) => setRepassword(text)}
        />
      ),
      checkFunction: async () =>
        checkValidAccount(email, password, repassword, setTextAnnounce),
    },
    {
      layOut: (
        <UserInformInput
          email={email}
          firstName={firstName}
          lastName={lastName}
          country={country}
          phoneNumber={phoneNumber}
          setFirstName={(text) => setFirstName(text)}
          setLastName={(text) => setLastName(text)}
          setCountry={(text) => setCountry(text)}
          setPhoneNumber={(text) => setPhoneNumber(text)}
        />
      ),
      checkFunction: async () =>
        checkUserInform(
          email,
          password,
          firstName,
          lastName,
          country,
          phoneNumber,
          setTextAnnounce
        ),
    },
    {
      layOut: (
        <ConfirmEmail
        email={email}
          isVerified={isVerified}
          setVerify={setVerify}
          codeVerify={codeVerify}
          setCodeVerify={setCodeVerify}
          isSended={isSended}
          setSend={() => {
            setSend(true);
            setTimeout(() => setSend(false), 5000);
          }}
          setTextAnnounce={setTextAnnounce}
        />
      ),
      checkFunction: () => {
        if (!isVerified) {
          setTextAnnounce("Please verify first");
        } else setTextAnnounce("");
        return isVerified;
      },
    },
  ];

  const isStepOptional = (step) => {
    //currently
    return step === stepLayout.length - 1;
  };

  const handleNext = async (check) => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    const isValid = (await check?.()) ?? true;
    if (!isValid) return;
    setTextAnnounce("");
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

  // const handleReset = () => {
  //   setActiveStep(0);
  // };

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
            All steps completed - You can go to Login page
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={() => nav("/sign_in")}>Go to Login</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {stepLayout[activeStep].layOut}
          <Typography className="registration-text-error">
            {textAnnounce}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || isVerified}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && !isVerified && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            <Button
              onClick={() => handleNext(stepLayout[activeStep].checkFunction)}
            >
              {activeStep === stepLayout.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Paper>
  );
}
