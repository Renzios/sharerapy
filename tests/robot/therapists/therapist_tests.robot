*** Settings ***
Documentation     Therapist tests - Direct function calls using Supabase
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

Get Therapist By ID Should Be None
    [Documentation]    Fail if Get Therapist By ID returns a value (used for retries after delete)
    [Arguments]    ${therapist_id}
    ${read}=    Get Therapist By ID    ${therapist_id}
    Should Be Equal    ${read}    ${None}


*** Test Cases ***
Get Therapist By ID (non-existent)
    [Documentation]    Get therapist by random/non-existent ID (expect None)
    [Tags]    therapists    get
    ${therapist_id}=    Generate Random UUID
    
    TRY
        ${therapist}=    Get Therapist By ID    ${therapist_id}
        Should Be Equal    ${therapist}    ${None}
        Log    SUCCESS: Get therapist By ID correctly returned None for non-existent therapist    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET therapist: ${error}
    END

Get All Therapists
    [Documentation]    Get all therapists (list retrieval)
    [Tags]    therapists    get
    
    TRY
        ${result}=    Get All Therapists
        Validate Therapists List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET therapists: ${error}
    END

Get Therapists with Parameters
    [Documentation]    Test get therapists with parameters using direct function calls
    [Tags]    therapists    get    parameters

    TRY
    ${result}=    Get All Therapists    clinicID=1    countryID=1    limit=10    offset=0
        Validate Therapists List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    FAIL: GET therapists: ${error}
    END

Update Therapist (non-existent)
    [Documentation]    Update therapist with random/non-existent ID (expect None)
    [Tags]    therapists    put
    
    ${therapist_id}=    Generate Random UUID
    ${therapist_data}=    Create Dictionary    &{THERAPIST_TEMPLATE}
    Set To Dictionary    ${therapist_data}    first_name=Updated
    
    TRY
        ${updated_therapist}=    Update Therapist    ${therapist_id}    ${therapist_data}
        Should Be Equal    ${updated_therapist}    ${None}
        Log    SUCCESS: Update Therapist correctly returned None for non-existent therapist    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: PUT therapists: ${error}
    END


Delete Therapist (non-existent)
    [Documentation]    Delete therapist with random/non-existent ID (expect False)
    [Tags]    therapists    delete
    
    ${therapist_id}=    Generate Random UUID
    
    TRY
        ${result}=    Delete Therapist    ${therapist_id}
        Should Be Equal    ${result}    ${False}
        Log    SUCCESS: Delete Therapist correctly returned False for non-existent therapist    INFO
    EXCEPT    *    AS    ${error}
        Fail    FAIL: DELETE therapists: ${error}
    END

Therapist Lifecycle (happy path)
    [Documentation]    Create, Read, Update, Delete therapist lifecycle (happy path)
    [Tags]    therapists    lifecycle

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

    # Delete and verify by reading until absent
    ${deleted}=    Delete Therapist    ${therapist_id}
    Wait Until Keyword Succeeds    5 times    1s    Get Therapist By ID Should Be None    ${therapist_id}
