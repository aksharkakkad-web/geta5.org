from playwright.sync_api import sync_playwright
import os

os.makedirs('/tmp/ascendly_screenshots', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})  # iPhone 14 size

    # 1. Homepage
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/ascendly_screenshots/homepage.png', full_page=True)
    print('OK Homepage screenshot saved')

    # 2. Subject hub
    page.goto('http://localhost:3000/ap-psychology')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/ascendly_screenshots/subject_hub.png', full_page=True)
    print('OK Subject hub screenshot saved')

    # 3. 404 page
    page.goto('http://localhost:3000/ap-physics')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/ascendly_screenshots/not_found.png', full_page=True)
    print('OK 404 page screenshot saved')

    # 4. Desktop homepage
    page.set_viewport_size({'width': 1280, 'height': 800})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/ascendly_screenshots/homepage_desktop.png', full_page=True)
    print('OK Desktop homepage screenshot saved')

    browser.close()

print('\nAll screenshots saved to /tmp/ascendly_screenshots/')
