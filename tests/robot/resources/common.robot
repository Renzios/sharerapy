*** Settings ***
Documentation    Common resources for Sharerapy TDD API tests
Library          RequestsLibrary
Library          Collections

*** Variables ***
${BASE_URL}              http://localhost:3000

*** Keywords ***
Setup Test Environment
    [Documentation]    Initialize test environment for TDD
    Create Session    api    ${BASE_URL}    verify=${False}

Cleanup Test Environment
    [Documentation]    Clean up test environment
    Delete All Sessions

Generate Random UUID
    [Documentation]    Generate a random UUID for testing
    ${uuid}=    Evaluate    str(__import__('uuid').uuid4())
    RETURN    ${uuid}