*** Settings ***
Documentation    Patient API TDD tests - API endpoints to be implemented
Resource         ../resources/common.robot
Resource         ../resources/test_data.robot

Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment

*** Keywords ***
Validate Created Patient Response
    [Documentation]    Validate successful patient creation response
    [Arguments]    ${response}    ${expected_data}
    
    ${patient}=    Set Variable    ${response.json()}
    Should Contain    ${patient}    id
    Should Be Equal    ${patient}[first_name]    ${expected_data}[first_name]
    Should Be Equal    ${patient}[last_name]    ${expected_data}[last_name]
    Log    IMPLEMENTATION SUCCESS: POST /api/patients working correctly - created patient with ID ${patient}[id]    INFO

Validate Patients List Response
    [Documentation]    Validate successful patients list response
    [Arguments]    ${response}
    
    ${patients}=    Set Variable    ${response.json()}
    Should Be True    isinstance($patients, list)
    Log    IMPLEMENTATION SUCCESS: GET /api/patients working correctly - returned ${len($patients)} patients    INFO

Validate Patient Update Response
    [Documentation]    Validate successful patient update response
    [Arguments]    ${response}    ${expected_data}
    
    ${patient}=    Set Variable    ${response.json()}
    Should Contain    ${patient}    id
    Should Be Equal    ${patient}[first_name]    ${expected_data}[first_name]
    Log    IMPLEMENTATION SUCCESS: PUT /api/patients/{id} working correctly - updated patient    INFO

*** Test Cases ***
Test Get Patient By ID - TDD
    [Documentation]    TDD: Test GET /api/patients/{id} - should FAIL until implemented
    [Tags]    tdd    api    patients    get
    
    ${patient_id}=    Generate Random UUID
    ${response}=    GET On Session    api    /api/patients/${patient_id}    expected_status=any
    
    # Check if endpoint exists by testing a basic GET to /api/patients
    ${endpoint_check}=    GET On Session    api    /api/patients    expected_status=any
    
    # TDD FAIL: Endpoint not implemented (both return 404)
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 404
    ...    Fail    TDD FAIL: GET /api/patients endpoints not implemented - implement to make test pass
    
    # SUCCESS: Endpoint implemented, correctly returns 404 for non-existent patient
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 200
    ...    Log    SUCCESS: GET /api/patients/{id} correctly returns 404 for non-existent patient    INFO
    
    # Unexpected responses
    Run Keyword If    ${response.status_code} not in [404] or ${endpoint_check.status_code} not in [200, 404]
    ...    Fail    UNEXPECTED: GET /api/patients/{id} returned ${response.status_code}, base endpoint returned ${endpoint_check.status_code}

Test Get All Patients - TDD  
    [Documentation]    TDD: Test GET /api/patients - should FAIL until implemented
    [Tags]    tdd    api    patients    get
    
    ${response}=    GET On Session    api    /api/patients    expected_status=any
    
    # TDD FAIL: Endpoint not implemented
    Run Keyword If    ${response.status_code} == 404
    ...    Fail    TDD FAIL: GET /api/patients not implemented - implement this endpoint to make test pass
    
    # SUCCESS: Endpoint implemented correctly
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Patients List Response    ${response}
    
    # Unexpected responses
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: GET /api/patients returned ${response.status_code}, expected 404 or 200

Test Get Patients with ReadParameters - TDD
    [Documentation]    TDD: Test GET /api/patients with search/filter parameters (to be implemented)
    [Tags]    tdd    api    patients    get    parameters
    
    ${params}=    Create Dictionary    &{READ_PARAMETERS}
    Set To Dictionary    ${params}    search=TestPatient
    ${response}=    GET On Session    api    /api/patients    params=${params}    expected_status=any
    
    # TDD: Expect 404 since endpoint doesn't exist yet
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: GET /api/patients with parameters endpoint not implemented yet - this is expected    INFO
    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}

Test Create Patient - TDD
    [Documentation]    TDD: Test POST /api/patients - should FAIL until implemented
    [Tags]    tdd    api    patients    post
    
    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=TDDTest
    ${response}=    POST On Session    api    /api/patients    json=${patient_data}    expected_status=any
    
    # TDD FAIL: Endpoint not implemented
    Run Keyword If    ${response.status_code} == 404
    ...    Fail    TDD FAIL: POST /api/patients not implemented - implement this endpoint to make test pass
    
    # SUCCESS: Endpoint implemented correctly
    Run Keyword If    ${response.status_code} == 201
    ...    Validate Created Patient Response    ${response}    ${patient_data}
    
    # Unexpected responses
    Run Keyword If    ${response.status_code} not in [404, 201]
    ...    Fail    UNEXPECTED: POST /api/patients returned ${response.status_code}, expected 404 or 201

Test Update Patient - TDD
    [Documentation]    TDD: Test PUT /api/patients/{id} - should FAIL until implemented
    [Tags]    tdd    api    patients    put
    
    ${patient_id}=    Generate Random UUID
    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=Updated
    ${response}=    PUT On Session    api    /api/patients/${patient_id}    json=${patient_data}    expected_status=any
    
    # Check if base endpoint exists
    ${endpoint_check}=    GET On Session    api    /api/patients    expected_status=any
    
    # TDD FAIL: Endpoint not implemented
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 404
    ...    Fail    TDD FAIL: PUT /api/patients/{id} not implemented - implement this endpoint to make test pass
    
    # SUCCESS: Endpoint implemented, correctly returns 404 for non-existent patient
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 200
    ...    Log    SUCCESS: PUT /api/patients/{id} correctly returns 404 for non-existent patient    INFO
    
    # SUCCESS: Endpoint implemented with proper data flow
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Patient Update Response    ${response}    ${patient_data}
    
    # Unexpected responses
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: PUT /api/patients/{id} returned ${response.status_code}, expected 404 or 200

Test Delete Patient - TDD
    [Documentation]    TDD: Test DELETE /api/patients/{id} - should FAIL until implemented
    [Tags]    tdd    api    patients    delete
    
    ${patient_id}=    Generate Random UUID
    ${response}=    DELETE On Session    api    /api/patients/${patient_id}    expected_status=any
    
    # Check if base endpoint exists
    ${endpoint_check}=    GET On Session    api    /api/patients    expected_status=any
    
    # TDD FAIL: Endpoint not implemented
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 404
    ...    Fail    TDD FAIL: DELETE /api/patients/{id} not implemented - implement this endpoint to make test pass
    
    # SUCCESS: Endpoint implemented, correctly returns 404 for non-existent patient
    Run Keyword If    ${response.status_code} == 404 and ${endpoint_check.status_code} == 200
    ...    Log    SUCCESS: DELETE /api/patients/{id} correctly returns 404 for non-existent patient    INFO
    
    # SUCCESS: Endpoint implemented with proper deletion
    Run Keyword If    ${response.status_code} == 200
    ...    Log    SUCCESS: DELETE /api/patients/{id} working correctly - deleted patient    INFO
    
    # Unexpected responses
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    UNEXPECTED: DELETE /api/patients/{id} returned ${response.status_code}, expected 404 or 200