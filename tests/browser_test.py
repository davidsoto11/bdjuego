"""Prueba de navegador: python3 tests/browser_test.py [URL]. Requiere Playwright."""
import json
from pathlib import Path
import subprocess
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4173'
ROOMS = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./content.js").ROOMS))'], cwd=ROOT))
OUT = Path('/tmp/bdjuego-qa')
OUT.mkdir(exist_ok=True)


def start(page, name='Lucía Muñoz García'):
    page.goto(URL)
    page.locator('#enter-button').click()
    page.locator('#student-name').fill(name)
    page.locator('#student-group').fill('1.º DAM · A')
    page.locator('#start-form button').click()
    assert page.locator('#room-title').inner_text() == 'El archivo'


def answer_room(page, room, wrong=False):
    for q in room['questions']:
        if q.get('type') == 'match':
            for i, answer in enumerate(q['answer']):
                value = next(option for option in q['options'] if option != answer) if wrong else answer
                page.locator(f'#{q["id"]}-{i}').select_option(value)
        else:
            answer = next(option for option in q['options'] if option != q['answer']) if wrong else q['answer']
            page.locator(f'#card-{q["id"]}').get_by_role('radio', name=answer, exact=True).check()


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    page.screenshot(path=str(OUT / 'inicio-desktop.png'), full_page=True)
    page.locator('#help-button').click()
    assert page.locator('#help-dialog').is_visible()
    page.keyboard.press('Escape')
    start(page)
    page.locator('#room-form button[type=submit]').click()
    assert 'Responde todas' in page.locator('#room-error').inner_text()
    assert page.locator('#next-button').count() == 0
    page.locator('[data-hint=q1]').click()
    page.locator('#q1-0').select_option('Entidad fuerte')
    page.reload()
    page.locator('#resume-button').click()
    assert page.locator('#q1-0').input_value() == 'Entidad fuerte'
    assert page.locator('#hint-q1').is_visible()
    page.screenshot(path=str(OUT / 'sala-desktop.png'), full_page=True)
    page.locator('[data-open-plan]').first.click()
    assert page.locator('.plan-dialog').is_visible()
    assert page.locator('.plan-zoom img').evaluate('(img) => img.naturalWidth') == 1100
    page.screenshot(path=str(OUT / 'plano-ampliado.png'))
    page.keyboard.press('Escape')
    page.locator('.plan-dialog').wait_for(state='detached')
    for i, room in enumerate(ROOMS):
        assert page.locator('.plan-image').count() == len(room['diagrams'])
        page.locator('.plan-image').evaluate_all('(imgs) => Promise.all(imgs.map(img => img.decode()))')
        assert page.locator('.plan-image').evaluate_all('(imgs) => imgs.every(img => img.complete && img.naturalWidth === 1100)')
        page.locator('.case-file').screenshot(path=str(OUT / f'plano-sala-{i+1}.png'))
        answer_room(page, room)
        # Una respuesta errónea y una pista: nota esperada 9,25 / 10.
        if i == 0:
            q = room['questions'][1]
            wrong = next(option for option in q['options'] if option != q['answer'])
            page.locator('#card-q2').get_by_role('radio', name=wrong, exact=True).check()
        page.locator('#room-form button[type=submit]').click()
        assert page.locator('#unlocked').is_visible()
        assert page.locator('#room-form input:not(:disabled), #room-form select:not(:disabled)').count() == 0
        assert page.locator('.feedback').count() == 4
        if i == 0:
            page.reload()
            page.locator('#resume-button').click()
            assert page.locator('#unlocked').is_visible()
            assert page.locator('#room-form button[type=submit]').count() == 0
        page.locator('#next-button').click()
    assert page.locator('.grade-number').inner_text() == '9,25 / 10'
    assert '19 de 20' in page.locator('.grade-details').inner_text()
    page.screenshot(path=str(OUT / 'resultado-desktop.png'), full_page=True)
    with page.expect_download() as info:
        page.locator('#download-button').click()
    download = info.value
    download.save_as(OUT / 'informe-prueba.pdf')
    assert (OUT / 'informe-prueba.pdf').stat().st_size < 3_000_000
    assert download.suggested_filename.startswith('Informe_ER_Lucia_Munoz_Garcia_')
    text = subprocess.check_output(['pdftotext', '-layout', str(OUT / 'informe-prueba.pdf'), '-']).decode()
    assert 'NOTA FINAL: 9,25 / 10' in text
    assert 'Lucía Muñoz García' in text
    assert 'Pistas usadas: 1' in text
    assert '20. Reprograma la última restricción' in text
    assert text.count('Descripción del plano:') == 6
    image_list = subprocess.check_output(['pdfimages', '-list', str(OUT / 'informe-prueba.pdf')]).decode()
    assert sum(' image ' in line for line in image_list.splitlines()) >= 6
    assert text.count('Respuesta del alumno:') == 20
    assert text.count('Respuesta correcta:') == 20
    assert '0,25 / 0,5' in text
    page.reload()
    page.locator('#resume-button').click()
    assert page.locator('.grade-number').inner_text() == '9,25 / 10'
    page.locator('#restart-button').click()
    page.get_by_role('button', name='Conservar mi partida').click()
    assert page.locator('.grade-number').inner_text() == '9,25 / 10'
    page.locator('#restart-button').click()
    page.get_by_role('button', name='Empezar de nuevo', exact=True).click()
    assert page.locator('#start-panel').is_visible()
    assert page.evaluate('localStorage.getItem("protocolo-er-v2")') is None
    assert not errors, errors
    print('OK: validación, pistas, nota mixta, cierre de respuestas, recarga, PDF completo, reinicio.')

    mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = mobile.new_page()
    page.goto(URL)
    page.screenshot(path=str(OUT / 'inicio-mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    start(page)
    page.screenshot(path=str(OUT / 'sala-mobile.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    for room in ROOMS:
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        page.locator('[data-open-plan]').first.click()
        assert page.locator('.plan-zoom').evaluate('(el) => el.scrollWidth > el.clientWidth')
        page.locator('[data-close-plan]').click()
        answer_room(page, room, wrong=True)
        page.locator('#room-form button[type=submit]').click()
        page.locator('#next-button').click()
    assert page.locator('.grade-number').inner_text() == '0 / 10'
    assert page.locator('#download-button').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    print('OK: móvil sin desbordamiento y recorrido con todas las respuestas incorrectas.')

    corrupt = browser.new_context()
    page = corrupt.new_page()
    page.goto(URL)
    page.evaluate('localStorage.setItem("protocolo-er-v2", "{bad JSON")')
    page.reload()
    assert 'no se puede recuperar' in page.locator('.storage-warning[role=status]').inner_text()
    start(page, '<script>alert(1)</script>')
    assert '<script>alert(1)</script>' in page.locator('.agent-name').inner_text()
    assert page.locator('.agent-name script').count() == 0
    print('OK: partida corrupta y texto del alumno escapado.')

    blocked = browser.new_context()
    blocked.add_init_script('Object.defineProperty(window, "localStorage", {get() {throw new DOMException("blocked", "SecurityError");}})')
    page = blocked.new_page()
    start(page)
    assert page.locator('[data-storage-warning]').is_visible()
    answer_room(page, ROOMS[0])
    page.locator('#room-form button[type=submit]').click()
    assert page.locator('#next-button').is_visible()
    print('OK: se puede jugar sin almacenamiento local.')
    legacy = browser.new_context()
    page = legacy.new_page()
    page.goto(URL.rstrip('/') + '/version-1/')
    page.locator('#enter-button').click()
    page.locator('#student-name').fill('Intento anterior')
    page.locator('#student-group').fill('1.º DAM')
    page.locator('#start-form button').click()
    page.locator('#q1-0').select_option('Entidad')
    old_save = page.evaluate('localStorage.getItem("protocolo-er-v1")')
    page.goto(URL)
    assert page.locator('.legacy-notice').is_visible()
    page.locator('.legacy-notice a').click()
    page.locator('#resume-button').click()
    assert page.locator('#q1-0').input_value() == 'Entidad'
    assert page.evaluate('localStorage.getItem("protocolo-er-v1")') == old_save
    print('OK: la edición anterior conserva sus partidas y es accesible desde la nueva.')
    browser.close()
