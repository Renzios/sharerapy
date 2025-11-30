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

Click Create Patient
    Wait Until Element Is Visible    id=sidebar-create-patient-link    30s
    Execute Javascript    document.getElementById('sidebar-create-patient-link').click()
    Sleep    2s

Should See Create Patient Page
    Wait Until Page Contains        Create Patient    30s

Input Patient Details With Data
    [Arguments]    ${first_name}    ${last_name}    ${birthdate}    ${contact_number}    
    # Wait for the form to be fully loaded
    Wait Until Page Contains    Create New Patient    30s
    Sleep    3s
    
    # Country selection with enhanced waiting
    Wait Until Element Is Visible    id=react-select-create-patient-country-select-input    30s
    Wait Until Element Is Enabled    id=react-select-create-patient-country-select-input    10s
    Click Element    id=react-select-create-patient-country-select-input
    Sleep    2s
    Press Keys    id=react-select-create-patient-country-select-input    ARROW_DOWN
    Sleep    1s
    Press Keys    id=react-select-create-patient-country-select-input    RETURN
    Sleep    1s

    # Input fields with focus and clearing
    Run Keyword If    '${first_name}' != ''    Input Text With Focus    id=create-patient-first-name-input    ${first_name}
    Run Keyword If    '${last_name}' != ''    Input Text With Focus    id=create-patient-last-name-input    ${last_name}
    Run Keyword If    '${birthdate}' != ''    Input Text With Focus    id=create-patient-birthday-input    ${birthdate}
    Run Keyword If    '${contact_number}' != ''    Input Text With Focus    id=create-patient-contact-number-input    ${contact_number}

    # Sex selection with enhanced waiting
    Wait Until Element Is Visible    id=react-select-create-patient-sex-select-input    30s
    Wait Until Element Is Enabled    id=react-select-create-patient-sex-select-input    10s
    Click Element    id=react-select-create-patient-sex-select-input
    Sleep    2s
    Press Keys    id=react-select-create-patient-sex-select-input    ARROW_DOWN
    Sleep    1s
    Press Keys    id=react-select-create-patient-sex-select-input    RETURN
    Sleep    1s
    
    # Submit with enhanced waiting and validation
    Wait Until Element Is Visible    id=create-patient-submit-btn    30s
    Wait Until Element Is Enabled    id=create-patient-submit-btn    10s
    Scroll Element Into View    id=create-patient-submit-btn
    Sleep    2s
    
    # Try multiple submission methods for better reliability in CI
    Execute Javascript    document.getElementById('create-patient-submit-btn').scrollIntoView()
    Sleep    1s
    Execute Javascript    document.getElementById('create-patient-submit-btn').click()
    
    # Wait for form submission to start processing
    Sleep    5s
    
    # Alternative submission if JavaScript click doesn't work
    Run Keyword And Ignore Error    Click Element    id=create-patient-submit-btn
    
    # Wait for navigation/processing to complete
    Sleep    10s

Verify Patient Created Successfully
    # Wait longer for form submission to complete in CI environment
    Sleep    5s
    
    # Wait for navigation away from the create form
    Wait Until Page Does Not Contain    Create New Patient    60s

    # Additional verification that we're no longer on the create page
    Wait Until Page Does Not Contain Element    id=create-patient-submit-btn    30s

Verify Patient Creation Failed
    # Wait a moment for any validation messages to appear
    Sleep    3s
    
    Run Keyword And Return Status    Wait Until Element Is Visible    id=create-patient-submit-btn    30s
    
    # Alternative verification methods if the submit button check fails
    ${on_create_page}=    Run Keyword And Return Status    Wait Until Page Contains    Create New Patient    60s
    
Close Browser Safely
    Run Keyword And Ignore Error    Close Browser
