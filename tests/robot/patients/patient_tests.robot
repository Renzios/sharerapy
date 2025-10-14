*** Settings ***
Documentation    Patient API TDD tests - Direct function calls using Supabase
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

Validate Patient Update Response
    [Documentation]    Validate successful patient update response
    [Arguments]    ${patient_result}    ${expected_data}
    
    Should Contain    ${patient_result}    id
    Should Be Equal    ${patient_result}[first_name]    ${expected_data}[first_name]
    Log    IMPLEMENTATION SUCCESS: Patient update working correctly - updated patient    INFO

*** Test Cases ***
Test Get Patient By ID - TDD
    [Documentation]    TDD: Test get patient by ID using direct function calls
    [Tags]    tdd    patients    get
    
    ${patient_id}=    Generate Random UUID
    ${patient}=    Get Patient By ID    ${patient_id}
    
    Should Be Equal    ${patient}    ${None}
    Log    SUCCESS: Get Patient By ID correctly returned None for non-existent patient    INFO

Test Get All Patients - TDD  
    [Documentation]    TDD: Test get all patients using direct function calls
    [Tags]    tdd    patients    get
    
    TRY
        ${result}=    Get All Patients
        Validate Patients List Response    ${result}
    EXCEPT    *    AS    ${error}
        Fail    Get All Patients failed: ${error}
    END

Test Get Patients with ReadParameters - TDD
    [Documentation]    TDD: Test get patients with search/filter parameters using direct function calls
    [Tags]    tdd    patients    get    parameters
    
    TRY
        ${result}=    Get All Patients    search=TestPatient    page=0    page_size=10
        Log    SUCCESS: Get patients with parameters working - returned ${result}[count] patients    INFO
        Should Be True    ${result}[count] >= 0
    EXCEPT    *    AS    ${error}
        Fail    Get All Patients with parameters failed: ${error}
    END

Test Create Patient - TDD
    [Documentation]    TDD: Test create patient using direct function calls
    [Tags]    tdd    patients    post
    
    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=TDDTest
    
    TRY
        ${created_patient}=    Create Patient    ${patient_data}
        Validate Created Patient Response    ${created_patient}    ${patient_data}
    EXCEPT    *    AS    ${error}
        Fail    Create Patient failed: ${error}
    END

Test Update Patient - TDD
    [Documentation]    TDD: Test update patient using direct function calls
    [Tags]    tdd    patients    put
    
    ${patient_id}=    Generate Random UUID
    ${patient_data}=    Create Dictionary    &{PATIENT_TEMPLATE}
    Set To Dictionary    ${patient_data}    first_name=Updated
    
    ${updated_patient}=    Update Patient    ${patient_id}    ${patient_data}
    
    Should Be Equal    ${updated_patient}    ${None}
    Log    SUCCESS: Update Patient correctly returned None for non-existent patient    INFO

Test Delete Patient - TDD
    [Documentation]    TDD: Test delete patient using direct function calls
    [Tags]    tdd    patients    delete
    
    ${patient_id}=    Generate Random UUID
    ${result}=    Delete Patient    ${patient_id}
    
    Should Be Equal    ${result}    ${False}
    Log    SUCCESS: Delete Patient correctly returned False for non-existent patient    INFO