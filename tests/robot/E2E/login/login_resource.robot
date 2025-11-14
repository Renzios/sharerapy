*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}        https://sharerapy-staging.vercel.app/
${BROWSER}    Chrome
${VALID_USERNAME}   testuser@email.com
${VALID_PASSWORD}   testuserpw
${INVALID_USERNAME}     test@email.com
${INVALID_PASSWORD}     testtesttest

*** Keywords ***
Open Sharerapy Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Login With Valid Credentials
    Input Text    css=input[type="email"]    ${VALID_USERNAME}
    Input Text    css=input[type="password"]     ${VALID_PASSWORD}
    Click Element  css=button[type="submit"]

Should See Landing Page
    Wait Until Page Contains    Share Knowledge     10s

Login With Invalid Credentials
    Input Text    css=input[type="email"]    ${INVALID_USERNAME}
    Input Text    css=input[type="password"]     ${INVALID_PASSWORD}
    Click Element  css=button[type="submit"]

Should See Error Prompt
    Wait Until Page Contains        Invalid credentials     10s

Logout 
    Wait Until Page Does Not Contain    Successfully    10s
    Click Element      xpath=//button[normalize-space(.)="Logout"]