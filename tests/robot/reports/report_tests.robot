*** Settings ***
Documentation    Report tests - Direct function calls using Supabase
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

Get Report By ID Should Be None
    [Documentation]    Fail if Get Report By ID returns a value (used for retries after delete)
    [Arguments]    ${report_id}
    ${read}=    Get Report By ID    ${report_id}
    Should Be Equal    ${read}    ${None}


*** Test Cases ***
Get Report By ID (non-existent)
    [Documentation]    Get report by random/non-existent ID (expect None)
    [Tags]    reports    get
    ${report_id}=    Generate Random UUID
    
    TRY
        ${report}=    Get Report By ID    ${report_id}
        Should Be Equal    ${report}    ${None}
        Log    SUCCESS: Get Report By ID correctly returned None for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET reports: ${error}
    END


Get All Reports
    [Documentation]    Test get all reports using direct function calls
    [Tags]    reports    get
    
    TRY
        ${result}=    Get All Reports
        Validate Reports List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET reports: ${error}
    END


Get Reports with Parameters
    [Documentation]    Test get reports with parameters using direct function calls
    [Tags]    reports    get    parameters
    
    TRY
        ${result}=    Get All Reports    search=assessment    type_id=1    limit=10    offset=0
        Validate Reports List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET reports with parameters not implemented - implement this to make test pass: ${error}
    END

Update Report (non-existent)
    [Documentation]    Update report with random/non-existent ID (expect None)
    [Tags]    reports    put
    
    ${report_id}=    Generate Random UUID
    ${update_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${update_data}    title=Updated Report Title
    
    TRY
        ${updated_report}=    Update Report    ${report_id}    ${update_data}
        Should Be Equal    ${updated_report}    ${None}
        Log    SUCCESS: Update Report correctly returned None for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: PUT reports: ${error}
    END


Delete Report (non-existent)
    [Documentation]    Delete report with random/non-existent ID (expect False)
    [Tags]    reports    delete
    
    ${report_id}=    Generate Random UUID
    
    TRY
        ${result}=    Delete Report    ${report_id}
        Should Be Equal    ${result}    ${False}
        Log    SUCCESS: Delete Report correctly returned False for non-existent report    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: DELETE reports: ${error}
    END

Test Report Lifecycle (happy path)
    [Documentation]    Create, Read, Update, Delete report lifecycle (happy path)
    [Tags]    reports    lifecycle

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

    # Delete and verify by reading until absent
    ${deleted}=    Delete Report    ${report_id}
    Wait Until Keyword Succeeds    5 times    1s    Get Report By ID Should Be None    ${report_id}
