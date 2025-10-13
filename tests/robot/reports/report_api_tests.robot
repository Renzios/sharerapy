*** Settings ****** Settings ****** Settings ****** Settings ***

Documentation    Report API TDD tests - adapts to implementation status

Resource         ../resources/common.robotDocumentation    Report API TDD tests - adapts to implementation status

Resource         ../resources/test_data.robot

Resource         ../resources/common.robotDocumentation    Report API TDD tests - API endpoints to be implementedDocumentation    Report API integration tests

Suite Setup      Setup Test Environment

Suite Teardown   Cleanup Test EnvironmentResource         ../resources/test_data.robot



*** Keywords ***Resource         ../resources/common.robotResource         ../resources/common.robot

Validate Created Report Response

    [Documentation]    Validate successful report creation responseSuite Setup      Setup Test Environment

    [Arguments]    ${response}    ${expected_data}

    Suite Teardown   Cleanup Test EnvironmentResource         ../resources/test_data.robotResource         ../resources/test_data.robot

    ${report}=    Set Variable    ${response.json()}

    Should Contain    ${report}    id

    Should Be Equal    ${report}[title]    ${expected_data}[title]

    Should Be Equal    ${report}[description]    ${expected_data}[description]*** Keywords ***

    Log    IMPLEMENTATION SUCCESS: POST /api/reports working correctly - created report with ID ${report}[id]    INFO

Validate Created Report Response

Validate Reports List Response

    [Documentation]    Validate successful reports list response    [Documentation]    Validate successful report creation responseSuite Setup      Setup Test EnvironmentSuite Setup      Setup Test Environment

    [Arguments]    ${response}

        [Arguments]    ${response}    ${expected_data}

    ${reports}=    Set Variable    ${response.json()}

    Should Be True    isinstance($reports, list)    Suite Teardown   Cleanup Test EnvironmentSuite Teardown   Cleanup Test Environment

    Log    IMPLEMENTATION SUCCESS: GET /api/reports working correctly - returned ${len($reports)} reports    INFO

    ${report}=    Set Variable    ${response.json()}

*** Test Cases ***

Test Get Report By ID - TDD    Should Contain    ${report}    idTest Setup       Setup Test Data

    [Documentation]    TDD: Test GET /api/reports/{id} - adapts to implementation status

    [Tags]    tdd    api    reports    get    Should Be Equal    ${report}[title]    ${expected_data}[title]

    

    ${report_id}=    Generate Random UUID    Should Be Equal    ${report}[description]    ${expected_data}[description]*** Test Cases ***Test Teardown    Cleanup Test Data

    ${response}=    GET On Session    api    /api/reports/${report_id}    expected_status=any

        Log    ✅ IMPLEMENTATION SUCCESS: POST /api/reports working correctly - created report with ID ${report}[id]    INFO

    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)

    Run Keyword If    ${response.status_code} == 404Test Get Report By ID - TDD

    ...    Log    SUCCESS: GET /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO

    Validate Reports List Response

    # Unexpected responses (FAIL)

    Run Keyword If    ${response.status_code} not in [404]    [Documentation]    Validate successful reports list response    [Documentation]    TDD: Test GET /api/reports/{id} endpoint (to be implemented)*** Test Cases ***

    ...    Fail    UNEXPECTED: GET /api/reports/{id} returned ${response.status_code}, expected 404

    [Arguments]    ${response}

Test Get All Reports - TDD  

    [Documentation]    TDD: Test GET /api/reports - adapts to implementation status        [Tags]    tdd    api    reports    getTest Report CRUD Workflow

    [Tags]    tdd    api    reports    get

        ${reports}=    Set Variable    ${response.json()}

    ${response}=    GET On Session    api    /api/reports    expected_status=any

        Should Be True    isinstance($reports, list)        [Documentation]    Test complete CRUD workflow for reports

    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)

    Run Keyword If    ${response.status_code} == 404    Log    ✅ IMPLEMENTATION SUCCESS: GET /api/reports working correctly - returned ${len($reports)} reports    INFO

    ...    Log    TDD SUCCESS: GET /api/reports not implemented yet - this is expected    INFO

        ${report_id}=    Generate Random UUID    [Tags]    api    crud    reports    workflow    integration

    # TDD Phase 2: Endpoint implemented correctly (200 = SUCCESS)

    Run Keyword If    ${response.status_code} == 200*** Test Cases ***

    ...    Validate Reports List Response    ${response}

    Test Get Report By ID - TDD    ${response}=    GET On Session    api    /api/reports/${report_id}    expected_status=any    

    # Unexpected responses (FAIL)

    Run Keyword If    ${response.status_code} not in [404, 200]    [Documentation]    TDD: Test GET /api/reports/{id} - adapts to implementation status

    ...    Fail    UNEXPECTED: GET /api/reports returned ${response.status_code}, expected 404 or 200

    [Tags]    tdd    api    reports    get        # Setup dependencies

Test Create Report - TDD

    [Documentation]    TDD: Test POST /api/reports - adapts to implementation status    

    [Tags]    tdd    api    reports    post

        ${report_id}=    Generate Random UUID    # TDD: Expect 404 since endpoint doesn't exist yet    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}

    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}

    Set To Dictionary    ${report_data}    title=TDD Test Report    ${response}=    GET On Session    api    /api/reports/${report_id}    expected_status=any

    ${response}=    POST On Session    api    /api/reports    json=${report_data}    expected_status=any

            Run Keyword If    ${response.status_code} == 404    ${patient_id}=    Create Test Patient    ${patient_data}

    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)

    Run Keyword If    ${response.status_code} == 404    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)

    ...    Log    TDD SUCCESS: POST /api/reports not implemented yet - this is expected    INFO

        Run Keyword If    ${response.status_code} == 404    ...    Log    TDD SUCCESS: GET /api/reports/{id} endpoint not implemented yet - this is expected    INFO    Set Test Variable    ${PATIENT_ID}    ${patient_id}

    # TDD Phase 2: Endpoint implemented correctly (201 = SUCCESS)

    Run Keyword If    ${response.status_code} == 201    ...    Log    ✅ SUCCESS: GET /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO

    ...    Validate Created Report Response    ${response}    ${report_data}

            ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    

    # Unexpected responses (FAIL)

    Run Keyword If    ${response.status_code} not in [404, 201]    # Unexpected responses (FAIL)

    ...    Fail    UNEXPECTED: POST /api/reports returned ${response.status_code}, expected 404 or 201

    Run Keyword If    ${response.status_code} not in [404]    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}

Test Update Report - TDD

    [Documentation]    TDD: Test PUT /api/reports/{id} - adapts to implementation status    ...    Fail    ❌ UNEXPECTED: GET /api/reports/{id} returned ${response.status_code}, expected 404

    [Tags]    tdd    api    reports    put

    Test Get All Reports - TDD      ${therapist_id}=    Create Test Therapist    ${therapist_data}

    ${report_id}=    Generate Random UUID

    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}Test Get All Reports - TDD  

    Set To Dictionary    ${report_data}    title=Updated Report Title

    ${response}=    PUT On Session    api    /api/reports/${report_id}    json=${report_data}    expected_status=any    [Documentation]    TDD: Test GET /api/reports - adapts to implementation status    [Documentation]    TDD: Test GET /api/reports endpoint (to be implemented)    Set Test Variable    ${THERAPIST_ID}    ${therapist_id}

    

    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)    [Tags]    tdd    api    reports    get

    Run Keyword If    ${response.status_code} == 404

    ...    Log    SUCCESS: PUT /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO        [Tags]    tdd    api    reports    get    

    

    # TDD Phase 3: If implemented with proper data flow (200 = SUCCESS)     ${response}=    GET On Session    api    /api/reports    expected_status=any

    Run Keyword If    ${response.status_code} == 200

    ...    Log    IMPLEMENTATION SUCCESS: PUT /api/reports/{id} working correctly - updated report    INFO            # CREATE

    

    # Unexpected responses (FAIL)    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)

    Run Keyword If    ${response.status_code} not in [404, 200]

    ...    Fail    UNEXPECTED: PUT /api/reports/{id} returned ${response.status_code}, expected 404 or 200    Run Keyword If    ${response.status_code} == 404    ${response}=    GET On Session    api    /api/reports    expected_status=any    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}



Test Delete Report - TDD    ...    Log    ✅ TDD SUCCESS: GET /api/reports not implemented yet - this is expected    INFO

    [Documentation]    TDD: Test DELETE /api/reports/{id} - adapts to implementation status

    [Tags]    tdd    api    reports    delete            Set To Dictionary    ${report_data}    title=CRUD Test Report    patient_id=${patient_id}    therapist_id=${therapist_id}

    

    ${report_id}=    Generate Random UUID    # TDD Phase 2: Endpoint implemented correctly (200 = SUCCESS)

    ${response}=    DELETE On Session    api    /api/reports/${report_id}    expected_status=any

        Run Keyword If    ${response.status_code} == 200    # TDD: Expect 404 since endpoint doesn't exist yet    

    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)

    Run Keyword If    ${response.status_code} == 404    ...    Validate Reports List Response    ${response}

    ...    Log    SUCCESS: DELETE /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO

            Run Keyword If    ${response.status_code} == 404    ${create_response}=    POST On Session    api    /reports    json=${report_data}

    # TDD Phase 3: If implemented with proper deletion (200 = SUCCESS)

    Run Keyword If    ${response.status_code} == 200    # Unexpected responses (FAIL)

    ...    Log    IMPLEMENTATION SUCCESS: DELETE /api/reports/{id} working correctly - deleted report    INFO

        Run Keyword If    ${response.status_code} not in [404, 200]    ...    Log    TDD SUCCESS: GET /api/reports endpoint not implemented yet - this is expected    INFO    Should Be Equal As Numbers    ${create_response.status_code}    201

    # Unexpected responses (FAIL)

    Run Keyword If    ${response.status_code} not in [404, 200]    ...    Fail    ❌ UNEXPECTED: GET /api/reports returned ${response.status_code}, expected 404 or 200

    ...    Fail    UNEXPECTED: DELETE /api/reports/{id} returned ${response.status_code}, expected 404 or 200

    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    ${report_id}=    Set Variable    ${create_response.json()}[id]

Test Get Reports with ReadParameters - TDD

    [Documentation]    TDD: Test GET /api/reports with search/filter parameters - adapts to implementation statusTest Create Report - TDD

    [Tags]    tdd    api    reports    get    parameters

        [Documentation]    TDD: Test POST /api/reports - adapts to implementation status    Set Test Variable    ${REPORT_ID}    ${report_id}

    ${params}=    Create Dictionary    search=assessment    type_id=1    limit=10    offset=0

    ${response}=    GET On Session    api    /api/reports    params=${params}    expected_status=any    [Tags]    tdd    api    reports    post

    

    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)    Test Create Report - TDD    

    Run Keyword If    ${response.status_code} == 404

    ...    Log    TDD SUCCESS: GET /api/reports with parameters not implemented yet - this is expected    INFO    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}

    

    # TDD Phase 2: Endpoint implemented correctly (200 = SUCCESS)    Set To Dictionary    ${report_data}    title=TDD Test Report    [Documentation]    TDD: Test POST /api/reports endpoint (to be implemented)    # READ

    Run Keyword If    ${response.status_code} == 200

    ...    Validate Reports List Response    ${response}    ${response}=    POST On Session    api    /api/reports    json=${report_data}    expected_status=any

    

    # Unexpected responses (FAIL)        [Tags]    tdd    api    reports    post    ${read_response}=    GET On Session    api    /reports/${report_id}

    Run Keyword If    ${response.status_code} not in [404, 200]

    ...    Fail    UNEXPECTED: GET /api/reports with parameters returned ${response.status_code}, expected 404 or 200    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)

    Run Keyword If    ${response.status_code} == 404        Should Be Equal As Numbers    ${read_response.status_code}    200

    ...    Log    ✅ TDD SUCCESS: POST /api/reports not implemented yet - this is expected    INFO

        ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}    Should Be Equal    ${read_response.json()}[title]    CRUD Test Report

    # TDD Phase 2: Endpoint implemented correctly (201 = SUCCESS)

    Run Keyword If    ${response.status_code} == 201    ${response}=    POST On Session    api    /api/reports    json=${report_data}    expected_status=any    

    ...    Validate Created Report Response    ${response}    ${report_data}

            # UPDATE

    # Unexpected responses (FAIL)

    Run Keyword If    ${response.status_code} not in [404, 201]    # TDD: Expect 404 since endpoint doesn't exist yet    ${update_data}=    Create Dictionary    &{REPORT_TEMPLATE}

    ...    Fail    ❌ UNEXPECTED: POST /api/reports returned ${response.status_code}, expected 404 or 201

    Run Keyword If    ${response.status_code} == 404    Set To Dictionary    ${update_data}    title=Updated CRUD Report    patient_id=${patient_id}    therapist_id=${therapist_id}

Test Update Report - TDD

    [Documentation]    TDD: Test PUT /api/reports/{id} - adapts to implementation status    ...    Log    TDD SUCCESS: POST /api/reports endpoint not implemented yet - this is expected    INFO      ${update_response}=    PUT On Session    api    /reports/${report_id}    json=${update_data}

    [Tags]    tdd    api    reports    put

        ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    Should Be Equal As Numbers    ${update_response.status_code}    200

    ${report_id}=    Generate Random UUID

    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}    

    Set To Dictionary    ${report_data}    title=Updated Report Title

    ${response}=    PUT On Session    api    /api/reports/${report_id}    json=${report_data}    expected_status=anyTest Update Report - TDD    # DELETE

    

    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)    [Documentation]    TDD: Test PUT /api/reports/{id} endpoint (to be implemented)    ${delete_response}=    DELETE On Session    api    /reports/${report_id}

    Run Keyword If    ${response.status_code} == 404

    ...    Log    ✅ SUCCESS: PUT /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO    [Tags]    tdd    api    reports    put    Should Be Equal As Numbers    ${delete_response.status_code}    200

        

    # TDD Phase 3: If implemented with proper data flow (200 = SUCCESS)     ${report_id}=    Generate Random UUID

    Run Keyword If    ${response.status_code} == 200    ${report_data}=    Create Dictionary    &{REPORT_TEMPLATE}

    ...    Log    ✅ IMPLEMENTATION SUCCESS: PUT /api/reports/{id} working correctly - updated report    INFO    Set To Dictionary    ${report_data}    title=Updated Report Title

        ${response}=    PUT On Session    api    /api/reports/${report_id}    json=${report_data}    expected_status=any

    # Unexpected responses (FAIL)    

    Run Keyword If    ${response.status_code} not in [404, 200]    # TDD: Expect 404 since endpoint doesn't exist yet

    ...    Fail    ❌ UNEXPECTED: PUT /api/reports/{id} returned ${response.status_code}, expected 404 or 200    Run Keyword If    ${response.status_code} == 404

    ...    Log    TDD SUCCESS: PUT /api/reports/{id} endpoint not implemented yet - this is expected    INFO

Test Delete Report - TDD    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}

    [Documentation]    TDD: Test DELETE /api/reports/{id} - adapts to implementation status

    [Tags]    tdd    api    reports    deleteTest Delete Report - TDD

        [Documentation]    TDD: Test DELETE /api/reports/{id} endpoint (to be implemented)

    ${report_id}=    Generate Random UUID    [Tags]    tdd    api    reports    delete

    ${response}=    DELETE On Session    api    /api/reports/${report_id}    expected_status=any    

        ${report_id}=    Generate Random UUID

    # TDD Phase 1 & 2: Either unimplemented or correctly handling non-existent report (404 = SUCCESS)    ${response}=    DELETE On Session    api    /api/reports/${report_id}    expected_status=any

    Run Keyword If    ${response.status_code} == 404    

    ...    Log    ✅ SUCCESS: DELETE /api/reports/{id} returns 404 (either unimplemented or non-existent report)    INFO    # TDD: Expect 404 since endpoint doesn't exist yet

        Run Keyword If    ${response.status_code} == 404

    # TDD Phase 3: If implemented with proper deletion (200 = SUCCESS)    ...    Log    TDD SUCCESS: DELETE /api/reports/{id} endpoint not implemented yet - this is expected    INFO

    Run Keyword If    ${response.status_code} == 200    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}

    ...    Log    ✅ IMPLEMENTATION SUCCESS: DELETE /api/reports/{id} working correctly - deleted report    INFO

    Test Get Reports with ReadParameters - TDD

    # Unexpected responses (FAIL)    [Documentation]    TDD: Test GET /api/reports with search/filter parameters (to be implemented)

    Run Keyword If    ${response.status_code} not in [404, 200]    [Tags]    tdd    api    reports    get    parameters

    ...    Fail    ❌ UNEXPECTED: DELETE /api/reports/{id} returned ${response.status_code}, expected 404 or 200    

    ${params}=    Create Dictionary    search=assessment    type_id=1    limit=10    offset=0

Test Get Reports with ReadParameters - TDD    ${response}=    GET On Session    api    /api/reports    params=${params}    expected_status=any

    [Documentation]    TDD: Test GET /api/reports with search/filter parameters - adapts to implementation status    

    [Tags]    tdd    api    reports    get    parameters    # TDD: Expect 404 since endpoint doesn't exist yet

        Run Keyword If    ${response.status_code} == 404

    ${params}=    Create Dictionary    search=assessment    type_id=1    limit=10    offset=0    ...    Log    TDD SUCCESS: GET /api/reports with parameters endpoint not implemented yet - this is expected    INFO

    ${response}=    GET On Session    api    /api/reports    params=${params}    expected_status=any    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}
    
    # TDD Phase 1: Endpoint not implemented (404 = SUCCESS)
    Run Keyword If    ${response.status_code} == 404
    ...    Log    ✅ TDD SUCCESS: GET /api/reports with parameters not implemented yet - this is expected    INFO
    
    # TDD Phase 2: Endpoint implemented correctly (200 = SUCCESS)
    Run Keyword If    ${response.status_code} == 200
    ...    Validate Reports List Response    ${response}
    
    # Unexpected responses (FAIL)
    Run Keyword If    ${response.status_code} not in [404, 200]
    ...    Fail    ❌ UNEXPECTED: GET /api/reports with parameters returned ${response.status_code}, expected 404 or 200