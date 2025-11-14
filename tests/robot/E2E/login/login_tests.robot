*** Settings ***
Documentation    Test case for different inputs on login to Sharerapy
Resource         login_resource.robot
Library          SeleniumLibrary

*** Test Cases ***
Successful Login To Sharerapy
    [Documentation]    This test checks if login works with correct credentials
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    Close Browser

Logging in with Invalid Credentials
    [Documentation]     This test checks if a user is unable to log in using invalid credentials
    Open Sharerapy Login Page
    Login With Invalid Credentials
    Should See Error Prompt
    Close Browser

Successful Login with Logout
    [Documentation]    This test checks if login works with correct credentials
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    Logout
    Close Browser