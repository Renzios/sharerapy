*** Settings ***
Documentation     Therapist API TDD tests - Direct function calls using Supabase
Resource          ../resources/common.robot
Resource          ../resources/test_data.robot
Library           ../resources/therapist_functions.py

Suite Setup       Setup Test Environment
Suite Teardown    Cleanup Test Environment

*** Keywords ***
Validate Created Therapist Response
    [Arguments]    ${therapist_result}    ${expected_data}
    Should Contain    ${therapist_result}    id
    Should Be Equal    ${therapist_result}[first_name]    ${expected_data}[first_name]
    Should Be Equal    ${therapist_result}[specialization]    ${expected_data}[specialization]
    Log    IMPLEMENTATION SUCCESS: Therapist creation working correctly - created therapist with ID ${therapist_result}[id]    INFO

Validate Therapists List Response
    [Arguments]    ${result}
    ${therapists}=    Set Variable    ${result}[data]
    Should Not Be Empty    ${therapists}
    Log    IMPLEMENTATION SUCCESS: Therapist list retrieval working correctly - returned ${result}[count] therapists    INFO


*** Test Cases ***
Test Get All Therapists - TDD
    [Documentation]    TDD: Get all therapists (list retrieval)
    [Tags]    tdd    therapists    get
    
    TRY
        ${result}=    Get All Therapists
        Validate Therapists List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: GET therapists not implemented - implement this to make test pass: ${error}
    END


Test Create Therapist - TDD
    [Documentation]    TDD: Create therapist (happy path) using direct function calls
    [Tags]    tdd    therapists    post
    
    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}
    Set To Dictionary    ${therapist_data}    first_name=TDDTest
    
    TRY
        ${created_therapist}=    Create Therapist    ${therapist_data}
        Validate Created Therapist Response    ${created_therapist}    ${therapist_data}
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: POST therapists not implemented - implement this to make test pass: ${error}
    END


Test Update Therapist - TDD
    [Documentation]    TDD: Update therapist with random/non-existent ID (expect None)
    [Tags]    tdd    therapists    put
    
    ${therapist_id}=    Generate Random UUID
    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}
    Set To Dictionary    ${therapist_data}    first_name=Updated
    
    TRY
        ${updated_therapist}=    Update Therapist    ${therapist_id}    ${therapist_data}
        Should Be Equal    ${updated_therapist}    ${None}
        Log    SUCCESS: Update Therapist correctly returned None for non-existent therapist    INFO
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: PUT therapists not implemented - implement this to make test pass: ${error}
    END


Test Delete Therapist - TDD
    [Documentation]    TDD: Delete therapist with random/non-existent ID (expect False)
    [Tags]    tdd    therapists    delete
    
    ${therapist_id}=    Generate Random UUID
    
    TRY
        ${result}=    Delete Therapist    ${therapist_id}
        Should Be Equal    ${result}    ${False}
        Log    SUCCESS: Delete Therapist correctly returned False for non-existent therapist    INFO
    EXCEPT    *    AS    ${error}
        Fail    TDD FAIL: DELETE therapists not implemented - implement this to make test pass: ${error}
    END
Test Therapist Lifecycle - TDD (happy path)
    [Documentation]    TDD: Create, Read, Update, Delete therapist lifecycle (happy path)
    [Tags]    tdd    therapists    lifecycle

    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}
    Set To Dictionary    ${therapist_data}    first_name=HappyPathTherapist

    # Create
    ${created}=    Create Therapist    ${therapist_data}
    Validate Created Therapist Response    ${created}    ${therapist_data}
    ${therapist_id}=    Set Variable    ${created}[id]

    # Read
    ${read}=    Get Therapist By ID    ${therapist_id}
    Should Not Be Equal    ${read}    ${None}
    Should Be Equal    ${read}[first_name]    ${therapist_data}[first_name]

    # Update
    Set To Dictionary    ${therapist_data}    first_name=HappyPathUpdated
    ${updated}=    Update Therapist    ${therapist_id}    ${therapist_data}
    Validate Created Therapist Response    ${updated}    ${therapist_data}

    # Delete
    ${deleted}=    Delete Therapist    ${therapist_id}
    Should Be True    ${deleted}
