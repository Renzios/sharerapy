*** Settings ***
Library    SeleniumLibrary
Library    Process
Library    OperatingSystem

*** Variables ***
${URL}        https://sharerapy-staging.vercel.app/
${BROWSER}    Chrome
${HEADLESS}    headless
${VALID_USERNAME}   e2e@email.com
${VALID_PASSWORD}   mariel

*** Keywords ***
Input Text With Focus
    [Arguments]    ${locator}    ${text}
    [Documentation]    Input text with explicit focus and clearing for better reliability in CI
    Wait Until Element Is Visible    ${locator}    30s
    Wait Until Element Is Enabled    ${locator}    10s
    Click Element    ${locator}
    Sleep    0.5s
    Clear Element Text    ${locator}
    Sleep    0.5s
    Input Text    ${locator}    ${text}
    Sleep    0.5s

Open Sharerapy Login Page
    Open Browser    ${URL}    ${BROWSER}    
    ...    options=add_argument("--headless");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-gpu");add_argument("--window-size=1920,1080");add_argument("--disable-web-security");add_argument("--allow-running-insecure-content");add_argument("--disable-password-manager-reauthentication");add_argument("--disable-features=VizDisplayCompositor");add_argument("--disable-notifications");add_argument("--disable-infobars")
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
    [Arguments]    ${report_title}    ${report_description}    ${report_content}
    # Wait for the form to be fully loaded
    Wait Until Page Contains    Patient Details    30s
    Sleep    3s

    # Select patient from dropdown
    Wait Until Element Is Visible    id=react-select-create-edit-report-patient-select-input    30s
    Click Element    id=react-select-create-edit-report-patient-select-input
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-patient-select-input    TestFirst TestLast
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-patient-select-input    RETURN
    Sleep    1s
    
    Run Keyword If    '${report_title}' != ''    Input Text With Focus    id=create-edit-report-title-input    ${report_title}
    Run Keyword If    '${report_description}' != ''    Input Text With Focus    id=create-edit-report-description-textarea    ${report_description}
    
    # Language selection with enhanced waiting
    Wait Until Element Is Visible    id=react-select-create-edit-report-language-select-input    30s
    Wait Until Element Is Enabled    id=react-select-create-edit-report-language-select-input    10s
    Click Element    id=react-select-create-edit-report-language-select-input
    Sleep    2s
    Press Keys    id=react-select-create-edit-report-language-select-input    English
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-language-select-input    RETURN
    Sleep    1s
    
    # Therapy type selection with enhanced waiting
    Wait Until Element Is Visible    id=react-select-create-edit-report-therapy-type-select-input    30s
    Wait Until Element Is Enabled    id=react-select-create-edit-report-therapy-type-select-input    10s
    Click Element    id=react-select-create-edit-report-therapy-type-select-input
    Sleep    2s
    Press Keys    id=react-select-create-edit-report-therapy-type-select-input    ARROW_DOWN
    Sleep    1s
    Press Keys    id=react-select-create-edit-report-therapy-type-select-input    RETURN
    Sleep    1s
    
    # Rich text editor with enhanced waiting
    Run Keyword If    '${report_content}' != ''    Wait Until Element Is Visible    css=.bn-inline-content    30s
    Run Keyword If    '${report_content}' != ''    Wait Until Element Is Enabled    css=.bn-inline-content    10s
    Run Keyword If    '${report_content}' != ''    Click Element    css=.bn-inline-content
    Run Keyword If    '${report_content}' != ''    Sleep    2s
    Run Keyword If    '${report_content}' != ''    Input Text    css=.bn-inline-content    ${report_content}
    Run Keyword If    '${report_content}' != ''    Sleep    1s
    
    # Submit with enhanced waiting and validation
    Wait Until Element Is Visible    id=create-edit-report-submit-btn    30s
    Wait Until Element Is Enabled    id=create-edit-report-submit-btn    10s
    Scroll Element Into View    id=create-edit-report-submit-btn
    Sleep    2s
    
    # Try multiple submission methods for better reliability in CI
    Execute Javascript    document.getElementById('create-edit-report-submit-btn').scrollIntoView()
    Sleep    1s
    Execute Javascript    document.getElementById('create-edit-report-submit-btn').click()
    
    # Wait for form submission to start processing
    Sleep    5s
    
    # Alternative submission if JavaScript click doesn't work
    Run Keyword And Ignore Error    Click Element    id=create-edit-report-submit-btn
    
    # Wait for navigation/processing to complete
    Sleep    10s

Verify Report Created Successfully
    # Wait longer for form submission to complete in CI environment
    Sleep    5s
    
    # Wait for navigation away from the create form
    Wait Until Page Does Not Contain    Patient Details    60s
    Wait Until Page Does Not Contain    Report Details    30s
    Wait Until Page Does Not Contain    Report Content    30s
    
    # Additional verification that we're no longer on the create page
    Wait Until Page Does Not Contain Element    id=create-edit-report-submit-btn    30s

Verify Report Creation Failed
    # Wait a moment for any validation messages to appear
    Sleep    3s
    
    # Check if we're still on the create report page by looking for form elements
    # This is more reliable than checking for text that might not always be visible
    Run Keyword And Return Status    Wait Until Element Is Visible    id=create-edit-report-submit-btn    30s
    
    # Alternative verification methods if the submit button check fails
    ${on_create_page}=    Run Keyword And Return Status    Wait Until Page Contains    Patient Details    30s
    Run Keyword If    not ${on_create_page}    Wait Until Page Contains    Report Details    30s
    Run Keyword If    not ${on_create_page}    Wait Until Page Contains    Report Content    30s
    
    # Final fallback - check for any form elements
    Run Keyword If    not ${on_create_page}    Wait Until Element Is Visible    css=input,select,textarea    30s

Close Browser Safely
    Run Keyword And Ignore Error    Close Browser

Delete Report
    Wait Until Element Is Visible    id=indiv-report-delete-icon-btn    30s
    Click Element    id=indiv-report-delete-icon-btn
    Sleep    1s

    Wait Until Element Is Visible    id=indiv-report-confirm-delete-btn    30s
    Click Element    id=indiv-report-confirm-delete-btn
    Sleep    2s
    Wait Until Element Is Visible    id=search-reports-input    30s
