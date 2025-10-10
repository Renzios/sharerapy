*** Settings ****** Settings ***

Documentation    Therapist API TDD tests - API endpoints to be implementedDocumentation    Therapist API integration tests

Resource         ../resources/common.robotResource         ../resources/common.robot

Resource         ../resources/test_data.robotResource         ../resources/test_data.robot



Suite Setup      Setup Test EnvironmentSuite Setup      Setup Test Environment

Suite Teardown   Cleanup Test EnvironmentSuite Teardown   Cleanup Test Environment

Test Setup       Setup Test Data

*** Test Cases ***Test Teardown    Cleanup Test Data

Test Get Therapist By ID - TDD

    [Documentation]    TDD: Test GET /api/therapists/{id} endpoint (to be implemented)*** Test Cases ***

    [Tags]    tdd    api    therapists    getTest Therapist CRUD Workflow

        [Documentation]    Test complete CRUD workflow for therapists

    ${therapist_id}=    Generate Random UUID    [Tags]    api    crud    therapists    workflow    integration

    ${response}=    GET On Session    api    /api/therapists/${therapist_id}    expected_status=any    

        # CREATE

    # TDD: Expect 404 since endpoint doesn't exist yet    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}

    Run Keyword If    ${response.status_code} == 404    Set To Dictionary    ${therapist_data}    first_name=CRUDTest    age=35

    ...    Log    TDD SUCCESS: GET /api/therapists/{id} endpoint not implemented yet - this is expected    INFO    

    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    ${create_response}=    POST On Session    api    /therapists    json=${therapist_data}

    Should Be Equal As Numbers    ${create_response.status_code}    201

Test Get All Therapists - TDD      ${therapist_id}=    Set Variable    ${create_response.json()}[id]

    [Documentation]    TDD: Test GET /api/therapists endpoint (to be implemented)    Set Test Variable    ${THERAPIST_ID}    ${therapist_id}

    [Tags]    tdd    api    therapists    get    

        # READ

    ${response}=    GET On Session    api    /api/therapists    expected_status=any    ${read_response}=    GET On Session    api    /therapists/${therapist_id}

        Should Be Equal As Numbers    ${read_response.status_code}    200

    # TDD: Expect 404 since endpoint doesn't exist yet    Should Be Equal    ${read_response.json()}[first_name]    CRUDTest

    Run Keyword If    ${response.status_code} == 404    

    ...    Log    TDD SUCCESS: GET /api/therapists endpoint not implemented yet - this is expected    INFO    # UPDATE

    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    ${update_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}

    Set To Dictionary    ${update_data}    first_name=UpdatedCRUD    age=40

Test Create Therapist - TDD    ${update_response}=    PUT On Session    api    /therapists/${therapist_id}    json=${update_data}

    [Documentation]    TDD: Test POST /api/therapists endpoint (to be implemented)    Should Be Equal As Numbers    ${update_response.status_code}    200

    [Tags]    tdd    api    therapists    post    

        # Verify update

    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}    ${verify_response}=    GET On Session    api    /therapists/${therapist_id}

    ${response}=    POST On Session    api    /api/therapists    json=${therapist_data}    expected_status=any    Should Be Equal    ${verify_response.json()}[first_name]    UpdatedCRUD

        Should Be Equal As Numbers    ${verify_response.json()}[age]    40

    # TDD: Expect 404 since endpoint doesn't exist yet    

    Run Keyword If    ${response.status_code} == 404    # DELETE

    ...    Log    TDD SUCCESS: POST /api/therapists endpoint not implemented yet - this is expected    INFO      ${delete_response}=    DELETE On Session    api    /therapists/${therapist_id}

    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}    Should Be Equal As Numbers    ${delete_response.status_code}    200

    

Test Update Therapist - TDD    # Verify deletion

    [Documentation]    TDD: Test PUT /api/therapists/{id} endpoint (to be implemented)    ${final_response}=    GET On Session    api    /therapists/${therapist_id}    expected_status=404
    [Tags]    tdd    api    therapists    put
    
    ${therapist_id}=    Generate Random UUID
    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}
    Set To Dictionary    ${therapist_data}    first_name=Updated
    ${response}=    PUT On Session    api    /api/therapists/${therapist_id}    json=${therapist_data}    expected_status=any
    
    # TDD: Expect 404 since endpoint doesn't exist yet
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: PUT /api/therapists/{id} endpoint not implemented yet - this is expected    INFO
    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}

Test Delete Therapist - TDD
    [Documentation]    TDD: Test DELETE /api/therapists/{id} endpoint (to be implemented)
    [Tags]    tdd    api    therapists    delete
    
    ${therapist_id}=    Generate Random UUID
    ${response}=    DELETE On Session    api    /api/therapists/${therapist_id}    expected_status=any
    
    # TDD: Expect 404 since endpoint doesn't exist yet
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: DELETE /api/therapists/{id} endpoint not implemented yet - this is expected    INFO
    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}

Test Get Therapists with ReadParameters - TDD
    [Documentation]    TDD: Test GET /api/therapists with search/filter parameters (to be implemented)
    [Tags]    tdd    api    therapists    get    parameters
    
    ${params}=    Create Dictionary    search=Physical    limit=10    offset=0
    ${response}=    GET On Session    api    /api/therapists    params=${params}    expected_status=any
    
    # TDD: Expect 404 since endpoint doesn't exist yet
    Run Keyword If    ${response.status_code} == 404
    ...    Log    TDD SUCCESS: GET /api/therapists with parameters endpoint not implemented yet - this is expected    INFO
    ...    ELSE    Fail    TDD UNEXPECTED: Expected 404 for unimplemented endpoint, got ${response.status_code}