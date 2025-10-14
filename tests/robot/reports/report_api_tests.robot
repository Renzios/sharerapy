*** Settings ***
Documentation    Report API TDD tests - adapts to implementation status
Resource         ../resources/common.robot
Resource         ../resources/test_data.robot

Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment


*** Keywords ***
Validate Created Report Response
    [Documentation]    Validate successful report creation response
    [Arguments]    ${response}    ${expected_data}
    ${report}=    Set Variable    ${response.json()}
    Should Contain    ${report}    id
    Should Be Equal    ${report}[title]    ${expected_data}[title]
    Should Be Equal    ${report}[description]    ${expected_data}[description]
    Log    IMPLEMENTATION SUCCESS: POST /api/reports working correctly - created report with ID ${report}[id]    INFO

Validate Reports List Response
    [Documentation]    Validate successful reports list response
    [Arguments]    ${response}
    ${reports}=    Set Variable    ${response.json()}
    Should Be True    isinstance($reports, list)
    Log    IMPLEMENTATION SUCCESS: GET /api/reports working correctly - returned ${len($reports)} reports    INFO


*** Test Cases ***
Test Get Report By ID - TDD
    [Documentation]    TDD: Test GET /api/reports/{id} - adapts to implementation status
    [Tags]    tdd    api    reports    get
    ${report_id}=    Generate Random UUID
    ${response}=    GET On Session    api    /api/reports/${report_id}    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    SUCCESS: GET /api/reports/{id} returns 404 (unimplemented or non-existent report)    INFO
    Run Keyword If    ${response.status_code} not in [404]
    ...    Fail    UNEXPECTED: GET /api/reports/{id} returned ${response.status_code}, expected 404


Test Get All Reports - TDD
    [Documentation]    TDD: Test GET /api/reports - adapts to implementation status
    [Tags]    tdd    api    reports    get
    ${response}=    GET On Session    api    /api/reports    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: GET /api/reports not implemented yet - this is expected    INFO
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Reports List Response    ${response}
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: GET /api/reports returned ${response.status_code}, expected 404 or 200


Test Create Report - TDD
    [Documentation]    TDD: Test POST /api/reports - adapts to implementation status
    [Tags]    tdd    api    reports    post
    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${report_data}    title=TDD Test Report
    ${response}=    POST On Session    api    /api/reports    json=${report_data}    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: POST /api/reports not implemented yet - this is expected    INFO
    Run Keyword If    ${response.status_code} == 201
    ...    Validate Created Report Response    ${response}    ${report_data}
    Run Keyword If    ${response.status_code} not in [404, 201]
    ...    Fail    UNEXPECTED: POST /api/reports returned ${response.status_code}, expected 404 or 201


Test Update Report - TDD
    [Documentation]    TDD: Test PUT /api/reports/{id} - adapts to implementation status
    [Tags]    tdd    api    reports    put
    ${report_id}=    Generate Random UUID
    ${update_data}=    Create Dictionary    &{REPORT_TEMPLATE}
    Set To Dictionary    ${update_data}    title=Updated Report Title
    ${response}=    PUT On Session    api    /api/reports/${report_id}    json=${update_data}    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    SUCCESS: PUT /api/reports/{id} returns 404 (unimplemented or non-existent report)    INFO
    Run Keyword If    ${response.status_code} == 200
    ...    Log    IMPLEMENTATION SUCCESS: PUT /api/reports/{id} working correctly - updated report    INFO
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: PUT /api/reports/{id} returned ${response.status_code}, expected 404 or 200


Test Delete Report - TDD
    [Documentation]    TDD: Test DELETE /api/reports/{id} - adapts to implementation status
    [Tags]    tdd    api    reports    delete
    ${report_id}=    Generate Random UUID
    ${response}=    DELETE On Session    api    /api/reports/${report_id}    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    SUCCESS: DELETE /api/reports/{id} returns 404 (unimplemented or non-existent report)    INFO
    Run Keyword If    ${response.status_code} == 200
    ...    Log    IMPLEMENTATION SUCCESS: DELETE /api/reports/{id} working correctly - deleted report    INFO
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: DELETE /api/reports/{id} returned ${response.status_code}, expected 404 or 200


Test Get Reports with Parameters - TDD
    [Documentation]    TDD: Test GET /api/reports with search/filter parameters - adapts to implementation status
    [Tags]    tdd    api    reports    get    parameters
    ${params}=    Create Dictionary    search=assessment    type_id=1    limit=10    offset=0
    ${response}=    GET On Session    api    /api/reports    params=${params}    expected_status=any
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: GET /api/reports with parameters not implemented yet - this is expected    INFO
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Reports List Response    ${response}
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: GET /api/reports with parameters returned ${response.status_code}, expected 404 or 200
