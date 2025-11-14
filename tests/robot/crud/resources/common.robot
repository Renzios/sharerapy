*** Settings ***
Documentation    Common resources for Sharerapy  tests
Library          Collections

*** Variables ***
${BASE_URL}              http://localhost:3000

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test environment
    Log    Setting up test environment for direct function calls    INFO

Cleanup Test Environment
    [Documentation]    Clean up test environment
    Log    Cleaning up test environment    INFO

Generate Random UUID
    [Documentation]    Generate a random UUID for testing
    ${uuid}=    Evaluate    str(__import__('uuid').uuid4())
    RETURN    ${uuid}