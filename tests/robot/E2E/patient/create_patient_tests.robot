*** Settings ***
Documentation    Test case for different inputs on create patient to Sharerapy
Resource         create_patient_resource.robot
Library          SeleniumLibrary

*** Test Cases ***
Successful Create Patient - Normal Data
    [Documentation]    This test creates a patient with normal valid data
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Create Patient Page
    Click Create Patient
    Input Patient Details With Data    TestFirst    TestLast    01/15/1990    1234567890
    Verify Patient Created Successfully
    Close Browser Safely

Create Patient - Missing Required Field
    [Documentation]    This test attempts to create a Patient with a missing required field (first name)
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Create Patient Page
    Click Create Patient
    # Leave first name empty (empty string) - should trigger validation
    Input Patient Details With Data    ${EMPTY}    TestLast    01/15/1990    1234567890
    # Verify that the patient was NOT created due to validation failure
    Verify Patient Creation Failed
    Close Browser Safely    

Create Patient - Future Birth Date
    [Documentation]    This test attempts to create a patient with invalid birth date format
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Create Patient Page
    Click Create Patient
    Input Patient Details With Data    TestFirst    TestLast    01/01/3000    1234567890
    Verify Patient Creation Failed
    Close Browser Safely

Create Patient - Invalid Phone Number
    [Documentation]    This test attempts to create a patient with invalid phone number
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Create Patient Page
    Click Create Patient
    Input Patient Details With Data    TestFirst    TestLast    01/15/1990    abc123
    Verify Patient Creation Failed
    Close Browser Safely
    
