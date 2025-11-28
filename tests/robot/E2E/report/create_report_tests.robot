*** Settings ***
Documentation    Test case for different inputs on create report to Sharerapy
Resource         create_report_resource.robot
Library          SeleniumLibrary

*** Test Cases ***
Successful Create Report - Normal Data
    [Documentation]    This test creates a report with normal valid data
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Reports Page
    Click Create Report
    Input Report Details With Data    John    Doe    01/15/1990    1234567890    [E2E_TEST] Report Title    This is a normal report description.    This is normal report content for the therapy session.
    Verify Report Created Successfully
    Close Browser

Create Report - Title Over 100 Characters
    [Documentation]    This test creates a report with a title exceeding the 100 character limit
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Reports Page
    Click Create Report
    Input Report Details With Data    John    Doe    01/15/1990    1234567890    [E2E_TEST] This is a very long title that definitely exceeds one hundred characters and should test the maximum length validation for the title field in the form    Short description.    Normal content.
    # Title will be truncated to 100 characters by maxlength attribute
    Verify Report Created Successfully
    Close Browser

Create Report - Description Over 500 Characters
    [Documentation]    This test creates a report with a description exceeding the 500 character limit
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Reports Page
    Click Create Report
    Input Report Details With Data    John    Doe    01/15/1990    +1234567890    [E2E_TEST] Normal Title    This is an extremely long description that is designed to exceed the maximum character limit of five hundred characters for the description field. This description contains multiple sentences and goes on and on to test how the form handles input that exceeds the specified maximum length. The description continues with more text to ensure we definitely go over the limit and can observe the validation behavior of the form when users try to input too much text in this field.    Normal content. aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    # Description will be truncated to 500 characters by maxlength attribute
    Verify Report Created Successfully
    Close Browser

Create Report - Missing Required Field
    [Documentation]    This test attempts to create a report with a missing required field (first name)
    Open Sharerapy Login Page
    Login With Valid Credentials
    Should See Landing Page
    
    Click Reports From Landing
    Should See Reports Page
    Click Create Report
    # Leave first name empty (empty string) - should trigger validation
    Input Report Details With Data    ${EMPTY}    Doe    01/15/1990    1234567890    [E2E_TEST] Test Report Title    Test description.    Test content.
    # Note: This test should fail validation and not create a report
    Close Browser