*** Settings ***
Documentation    Report API TDD tests - Direct function calls using Supabase
Resource         ../resources/common.robot
Resource         ../resources/test_data.robot
Library          ../resources/report_functions.py

Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment


*** Keywords ***
Validate Created Report Response
    [Documentation]    Validate successful report creation response
    [Arguments]    ${report_result}    ${expected_data}
    Should Contain    ${report_result}    id
    Should Be Equal    ${report_result}[title]    ${expected_data}[title]
    Should Be Equal    ${report_result}[description]    ${expected_data}[description]
    Log    IMPLEMENTATION SUCCESS: Report creation working correctly - created report with ID ${report_result}[id]    INFO

Validate Reports List Response
    [Documentation]    Validate successful reports list response
    [Arguments]    ${result}
    ${reports}=    Set Variable    ${result}[data]
    Should Not Be Empty    ${reports}
    Log    IMPLEMENTATION SUCCESS: Report list retrieval working correctly - returned ${result}[count] reports    INFO


*** Test Cases ***
Get Report By ID - TDD (non-existent)
    [Documentation]    TDD: Get report by random/non-existent ID (expect None)
    [Tags]    tdd    reports    get
    ${report_id}=    Generate Random UUID
    
    TRY
        ${report}=    Get Report By ID    ${report_id}
        Should Be Equal    ${report}    ${None}
        Log    SUCCESS: Get Report By ID correctly returned None for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: GET reports by ID not implemented - implement to make test pass: ${error}
    END


Test Get All Reports - TDD
    [Documentation]    TDD: Test get all reports using direct function calls
    [Tags]    tdd    reports    get
    
    TRY
        ${result}=    Get All Reports
        Validate Reports List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: GET reports not implemented - implement this endpoint to make test pass: ${error}
    END


Create Report - TDD (happy path)
    [Documentation]    TDD: Create report (happy path) using direct function calls
    [Tags]    tdd    reports    post
    
    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${report_data}    title=TDD Test Report
    
    TRY
        ${created_report}=    Create Report    ${report_data}
        Validate Created Report Response    ${created_report}    ${report_data}
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: POST reports not implemented - implement this endpoint to make test pass: ${error}
    END


Update Report - TDD (non-existent)
    [Documentation]    TDD: Update report with random/non-existent ID (expect None)
    [Tags]    tdd    reports    put
    
    ${report_id}=    Generate Random UUID
    ${update_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${update_data}    title=Updated Report Title
    
    TRY
        ${updated_report}=    Update Report    ${report_id}    ${update_data}
        Should Be Equal    ${updated_report}    ${None}
        Log    SUCCESS: Update Report correctly returned None for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: PUT reports not implemented - implement this endpoint to make test pass: ${error}
    END


Delete Report - TDD (non-existent)
    [Documentation]    TDD: Delete report with random/non-existent ID (expect False)
    [Tags]    tdd    reports    delete
    
    ${report_id}=    Generate Random UUID
    
    TRY
        ${result}=    Delete Report    ${report_id}
        Should Be Equal    ${result}    ${False}
        Log    SUCCESS: Delete Report correctly returned False for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: DELETE reports not implemented - implement this endpoint to make test pass: ${error}
    END


Test Get Reports with Parameters - TDD
    [Documentation]    TDD: Test get reports with parameters using direct function calls
    [Tags]    tdd    reports    get    parameters
    
    TRY
        ${result}=    Get All Reports    search=assessment    type_id=1    limit=10    offset=0
        Validate Reports List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: GET reports with parameters not implemented - implement this to make test pass: ${error}
    END

Test Report Lifecycle - TDD (happy path)
    [Documentation]    TDD: Create, Read, Update, Delete report lifecycle (happy path)
    [Tags]    tdd    reports    lifecycle

    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${report_data}    title=HappyPathReport

    # Create
    ${created}=    Create Report    ${report_data}
    Validate Created Report Response    ${created}    ${report_data}
    ${report_id}=    Set Variable    ${created}[id]

    # Read
    ${read}=    Get Report By ID    ${report_id}
    Should Not Be Equal    ${read}    ${None}
    Should Be Equal    ${read}[title]    ${report_data}[title]

    # Update
    Set To Dictionary    ${report_data}    title=HappyPathReportUpdated
    ${updated}=    Update Report    ${report_id}    ${report_data}
    Validate Created Report Response    ${updated}    ${report_data}

    # Delete
    ${deleted}=    Delete Report    ${report_id}
    Should Be True    ${deleted}
