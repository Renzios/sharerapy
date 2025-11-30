*** Settings ***
Documentation    Patient tests - Direct function calls using Supabase
Resource         ../resources/common.robot
Resource         ../resources/test_data.robot
Library          ../resources/patient_functions.py

Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment

*** Keywords ***
Validate Created Patient Response
    [Documentation]    Validate successful patient creation response
    [Arguments]    ${patient_result}    ${expected_data}
    
    Should Contain    ${patient_result}    id
    Should Be Equal    ${patient_result}[first_name]    ${expected_data}[first_name]
    Should Be Equal    ${patient_result}[last_name]    ${expected_data}[last_name]
    Log    IMPLEMENTATION SUCCESS: Patient creation working correctly - created patient with ID ${patient_result}[id]    INFO

Validate Patients List Response
    [Documentation]    Validate successful patients list response
    [Arguments]    ${result}
    
    ${patients}=    Set Variable    ${result}[data]
    Should Not Be Empty    ${patients}
    Log    IMPLEMENTATION SUCCESS: Patient list retrieval working correctly - returned ${result}[count] patients    INFO

Get Patient By ID Should Be None
    [Documentation]    Fail if Get Patient By ID returns a value (used for retries after delete)
    [Arguments]    ${patient_id}
    ${read}=    Get Patient By ID    ${patient_id}
    Should Be Equal    ${read}    ${None}

Validate Patient Update Response
    [Documentation]    Validate successful patient update response
    [Arguments]    ${patient_result}    ${expected_data}
    
    Should Contain    ${patient_result}    id
    Should Be Equal    ${patient_result}[first_name]    ${expected_data}[first_name]
    Log    IMPLEMENTATION SUCCESS: Patient update working correctly - updated patient    INFO

*** Test Cases ***
Get Patient By ID (non-existent)
    [Documentation]    Get patient by random/non-existent ID (expect None)
    [Tags]    patients    get
    
    ${patient_id}=    Generate Random UUID
    ${patient}=    Get Patient By ID    ${patient_id}
    
    Should Be Equal    ${patient}    ${None}
    Log    SUCCESS: Get Patient By ID correctly returned None for non-existent patient    INFO

Get All Patients  
    [Documentation]    Test get all patients using direct function calls
    [Tags]    patients    get
    
    TRY
        ${result}=    Get All Patients
        Validate Patients List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    FAIL: Get All Patients failed: ${error}
    END

Get Patients with ReadParameters
    [Documentation]    Test get patients with search/filter parameters using direct function calls
    [Tags]    patients    get    parameters
    
    TRY
        ${result}=    Get All Patients    search=TestPatient    page=0    page_size=10
        Log    SUCCESS: Get patients with parameters working - returned ${result}[count] patients    INFO
        Should Be True    ${result}[count] >= 0
    EXCEPT    *    AS    ${error}
        Fail    FAIL: Get All Patients with parameters failed: ${error}
    END

Update Patient (non-existent)
    [Documentation]    Update patient with random/non-existent ID (expect None)
    [Tags]    patients    put
    
    ${patient_id}=    Generate Random UUID
    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=Updated
    
    ${updated_patient}=    Update Patient    ${patient_id}    ${patient_data}
    
    Should Be Equal    ${updated_patient}    ${None}
    Log    SUCCESS: Update Patient correctly returned None for non-existent patient    INFO

Delete Patient (non-existent)
    [Documentation]    Delete patient with random/non-existent ID (expect False)
    [Tags]    patients    delete
    
    ${patient_id}=    Generate Random UUID
    ${result}=    Delete Patient    ${patient_id}
    
    Should Be Equal    ${result}    ${False}
    Log    SUCCESS: Delete Patient correctly returned False for non-existent patient    INFO

Test Patient Lifecycle (happy path)
    [Documentation]    Create, Read, Update, Delete patient lifecycle (happy path)
    [Tags]    patients    lifecycle

    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=HappyPathTest

    # Create
    ${created}=    Create Patient    ${patient_data}
    Validate Created Patient Response    ${created}    ${patient_data}
    ${patient_id}=    Set Variable    ${created}[id]

    # Read
    ${read}=    Get Patient By ID    ${patient_id}
    Should Not Be Equal    ${read}    ${None}
    Should Be Equal    ${read}[first_name]    ${patient_data}[first_name]

    # Update
    Set To Dictionary    ${patient_data}    first_name=HappyPathUpdated
    ${updated}=    Update Patient    ${patient_id}    ${patient_data}
    Validate Patient Update Response    ${updated}    ${patient_data}

    # Delete and verify by reading until absent
    ${deleted}=    Delete Patient    ${patient_id}
    Wait Until Keyword Succeeds    5 times    1s    Get Patient By ID Should Be None    ${patient_id}