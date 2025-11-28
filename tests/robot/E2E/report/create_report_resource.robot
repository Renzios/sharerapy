*** Settings ***
Library    SeleniumLibrary
Library    Process

*** Variables ***
${URL}        https://sharerapy-staging.vercel.app/
${BROWSER}    Chrome
${HEADLESS}    headless
${VALID_USERNAME}   testuser@email.com
${VALID_PASSWORD}   testuserpw

*** Keywords ***
Open Sharerapy Login Page
    Open Browser    ${URL}    ${BROWSER}    
    ...    options=add_argument("--headless");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-gpu");add_argument("--window-size=1920,1080");add_argument("--disable-web-security");add_argument("--allow-running-insecure-content")
    Set Window Size    1920    1080 

Login With Valid Credentials
    Input Text      css=input[type="email"]    ${VALID_USERNAME}
    Input Text      css=input[type="password"]     ${VALID_PASSWORD}
    Click Element   css=button[type="submit"]

Should See Landing Page
    Wait Until Page Contains    Share Knowledge     30s

Click Reports From Landing
    Wait Until Page Contains    Reports    30s
    Sleep    3s
    Execute Javascript    document.getElementById('landing-reports-btn').click()

Should See Reports Page
    Wait Until Page Contains        Create Report    30s

Click Create Report
    Wait Until Element Is Visible    id=sidebar-create-report-link    30s
    Execute Javascript    document.getElementById('sidebar-create-report-link').click()
    Sleep    2s

Input Report Details With Data
    [Arguments]    ${first_name}    ${last_name}    ${birthdate}    ${contact_number}    ${report_title}    ${report_description}    ${report_content}
    # Wait for the form to be fully loaded
    Wait Until Page Contains    Patient Details    30s
    Sleep    2s
    
    # Country selection
    Wait Until Element Is Visible    id=react-select-create-edit-report-country-select-input    10s
    Click Element    id=react-select-create-edit-report-country-select-input
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-country-select-input    ARROW_DOWN
    Press Keys    id=react-select-create-edit-report-country-select-input    RETURN
    
    # Only input fields if they are not empty
    Run Keyword If    '${first_name}' != ''    Input Text    id=create-edit-report-first-name-input    ${first_name}
    Run Keyword If    '${last_name}' != ''    Input Text    id=create-edit-report-last-name-input    ${last_name}
    Run Keyword If    '${birthdate}' != ''    Input Text    id=create-edit-report-birthday-input    ${birthdate}
    Run Keyword If    '${contact_number}' != ''    Input Text    id=create-edit-report-contact-number-input    ${contact_number}
    
    # Select sex (first option)
    Wait Until Element Is Visible    id=react-select-create-edit-report-sex-select-input    10s
    Click Element    id=react-select-create-edit-report-sex-select-input
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-sex-select-input    ARROW_DOWN
    Press Keys    id=react-select-create-edit-report-sex-select-input    RETURN
    
    Run Keyword If    '${report_title}' != ''    Input Text    id=create-edit-report-title-input    ${report_title}
    Run Keyword If    '${report_description}' != ''    Input Text    id=create-edit-report-description-textarea    ${report_description}
    
    # Select language (English)
    Wait Until Element Is Visible    id=react-select-create-edit-report-language-select-input    10s
    Click Element    id=react-select-create-edit-report-language-select-input
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-language-select-input    English
    Sleep    0.5s
    Press Keys    id=react-select-create-edit-report-language-select-input    RETURN
    
    # Select therapy type (first option)
    Wait Until Element Is Visible    id=react-select-create-edit-report-therapy-type-select-input    10s
    Click Element    id=react-select-create-edit-report-therapy-type-select-input
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-therapy-type-select-input    ARROW_DOWN
    Press Keys    id=react-select-create-edit-report-therapy-type-select-input    RETURN
    
    # Add report content to rich text editor if not empty
    Run Keyword If    '${report_content}' != ''    Wait Until Element Is Visible    css=.bn-inline-content    10s
    Run Keyword If    '${report_content}' != ''    Click Element    css=.bn-inline-content
    Run Keyword If    '${report_content}' != ''    Sleep    1s
    Run Keyword If    '${report_content}' != ''    Input Text    css=.bn-inline-content    ${report_content}
    
    # Submit the report
    Wait Until Element Is Visible    id=create-edit-report-submit-btn    10s
    Click Element    id=create-edit-report-submit-btn

Verify Report Created Successfully
    Sleep    3s
    Wait Until Page Does Not Contain    Patient Details    30s
    Wait Until Page Does Not Contain    Report Details    10s
    Wait Until Page Does Not Contain    Report Content    10s

Verify Report Creation Failed
    Sleep    3s
    Wait Until Page Contains    Patient Details    30s
    Wait Until Page Contains    Report Details    10s
    Wait Until Page Contains    Report Content    10s

Close Browser Safely
    Run Keyword And Ignore Error    Close Browser

Verify Report Created And View It
    [Arguments]    ${report_title}
    [Documentation]    Verify report was created and then view it to check title and description are displayed
    Sleep    3s
    Reload Page
    Sleep    2s
    # Scroll to top of page to ensure reports are visible
    Execute Javascript    window.scrollTo(0, 0)
    Sleep    1s
    # First check if any E2E test report exists on the page
    Wait Until Page Contains    [E2E_TEST]    30s
    # Look for any report card containing E2E_TEST in the title and click it
    Wait Until Element Is Visible    xpath=//h1[contains(text(), '[E2E_TEST]')]    30s
    Click Element    xpath=//h1[contains(text(), '[E2E_TEST]')]/ancestor::a
    Sleep    3s
    # Verify we're on the report view page with E2E_TEST title and description
    Wait Until Page Contains    [E2E_TEST]    30s
    Wait Until Page Contains    description    30s

Cleanup All E2E Test Data
    [Documentation]    Run the Node.js cleanup script to remove all E2E test data from Supabase
    Log    Starting E2E test data cleanup...
    ${script_path}=    Set Variable    ${CURDIR}${/}..${/}..${/}..${/}scripts${/}cleanup-e2e-test-data.js
    ${workspace_path}=    Set Variable    ${CURDIR}${/}..${/}..${/}..${/}..
    ${result}=    Run Process    node    ${script_path}    cwd=${workspace_path}    shell=True
    Log    Cleanup script output: ${result.stdout}
    Run Keyword If    ${result.rc} != 0    Log    Cleanup script failed with exit code ${result.rc}. Error: ${result.stderr}    WARN
    Run Keyword If    ${result.rc} != 0    Log    Continuing test execution despite cleanup failure...    WARN
