*** Settings ***
Documentation    Authentication tests (signup / login / signout) using local helper fallback
Resource         ../resources/common.robot
Library          ../resources/auth_functions.py

Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment


*** Test Cases ***
Signup (happy path)
    [Documentation]    Signup should create a new user
    [Tags]    auth    signup

    ${data}=    Create Dictionary    email=robot+signup@example.com    password=Passw0rd!    first_name=Robot    last_name=Signup
    ${created}=    Signup    ${data}
    Should Contain    ${created}    id
    Log    Created user ${created}[email] with id ${created}[id]


Login (success)
    [Documentation]    Login succeeds with correct credentials
    [Tags]    auth    login

    # Ensure user exists (signup helper will fail if exists; ignore errors)
    ${data}=    Create Dictionary    email=robot+login@example.com    password=Secret123    first_name=Robot    last_name=Login
    Run Keyword And Ignore Error    Signup    ${data}

    ${login_payload}=    Create Dictionary    email=robot+login@example.com    password=Secret123
    ${result}=    Login    ${login_payload}
    Should Not Be Equal    ${result}    ${None}
    Should Contain    ${result}    token
    Set Suite Variable    ${TOKEN}    ${result}[token]


Login (failure)
    [Documentation]    Login fails with incorrect credentials
    [Tags]    auth    login

    ${login_payload}=    Create Dictionary    email=nonexistent@example.com    password=Nope
    ${result}=    Login    ${login_payload}
    Should Be Equal    ${result}    ${None}


Sign Out
    [Documentation]    Sign out invalidates session token
    [Tags]    auth    signout

    # Reuse token from successful login if present; otherwise create a fresh session
    # Use empty-string checks and quote variables to avoid Robot evaluating UUIDs as expressions
    ${token}=    Set Variable If    '${TOKEN}' != ''    ${TOKEN}    ${EMPTY}
    Run Keyword If    '${token}' == ''    
    ...    ${signup_data}=    Create Dictionary    email=robot+signout@example.com    password=Abcd1234
    ...    ${created}=    Signup    ${signup_data}
    ...    ${login_payload}=    Create Dictionary    email=robot+signout@example.com    password=Abcd1234
    ...    ${login_result}=    Login    ${login_payload}
    ...    ${token}=    Set Variable    ${login_result}[token]

    ${signed}=    Sign Out    ${token}
    Should Be True    ${signed}
