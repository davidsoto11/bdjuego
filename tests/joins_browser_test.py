"""Recorrido real del laboratorio JOIN: python3 tests/joins_browser_test.py [URL_BASE]."""
import json
from pathlib import Path
import subprocess
import sys
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4173').rstrip('/')+'/'
URL=BASE+'joins/'
ROOMS=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./joins/content.js").ROOMS))'],cwd=ROOT))
OUT=Path('/tmp/bdjuego-joins-qa'); OUT.mkdir(exist_ok=True)

def start(page):
    page.goto(URL)
    page.locator('#enter-button').click()
    page.locator('#student-name').fill('María López Núñez')
    page.locator('#student-group').fill('1.º DAM · SQL')
    page.locator('#start-form button').click()
    expect(page.locator('#room-title')).to_have_text('El emparejador')

def fill_room(page,room,wrong=False):
    for q in room['questions']:
        if q.get('type')=='sql': page.locator(f'#sql-{q["id"]}').fill('SELECT 1;' if wrong else q['answer'])
        elif q.get('type')=='match':
            for i,answer in enumerate(q['answer']):
                value=next(v for v in q['options'] if v!=answer) if wrong else answer
                page.locator(f'#{q["id"]}-{i}').select_option(value)
        else:
            value=next(v for v in q['options'] if v!=q['answer']) if wrong else q['answer']
            page.locator(f'#card-{q["id"]}').get_by_role('radio',name=value,exact=True).check()

with sync_playwright() as p:
    browser=p.chromium.launch()
    context=browser.new_context(viewport={'width':1440,'height':1100},accept_downloads=True)
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE)
    page.get_by_role('link',name='⋈ Laboratorio SQL JOIN Nuevo').click()
    expect(page.locator('.mission-label')).to_contain_text('Academia')
    page.screenshot(path=str(OUT/'inicio-desktop.png'),full_page=True)
    start(page)
    page.locator('[data-table=profesor]').click()
    expect(page.locator('#source-table tbody tr')).to_have_count(6)
    expect(page.locator('#source-table')).to_contain_text('Irene')
    page.locator('#sql-j2').fill('SELECT FROM curso;')
    page.locator('[data-run-sql=j2]').click()
    expect(page.locator('#sql-output-j2 .sql-error')).to_be_visible(timeout=20000)
    assert page.locator('#next-button').count()==0
    page.locator('#sql-j2').fill("SELECT '<img src=x onerror=alert(1)>' AS texto;")
    page.locator('[data-run-sql=j2]').click()
    expect(page.locator('#sql-output-j2 table')).to_be_visible(timeout=20000)
    expect(page.locator('#sql-output-j2')).to_contain_text('<img src=x onerror=alert(1)>')
    assert page.locator('#sql-output-j2 img').count()==0
    page.locator('#sql-j2').fill('WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n) SELECT COUNT(*) FROM n;')
    page.locator('[data-run-sql=j2]').click()
    expect(page.locator('#sql-output-j2')).to_contain_text('Consulta detenida',timeout=20000)
    q2=ROOMS[0]['questions'][1]
    page.locator('#sql-j2').fill(q2['answer'].replace('ON c.CodProf = p.CodProf','USING (CodProf)'))
    page.locator('[data-run-sql=j2]').click()
    expect(page.locator('#sql-output-j2 tbody tr')).to_have_count(6,timeout=20000)
    page.locator('[data-hint=j2]').click()
    page.screenshot(path=str(OUT/'sala-desktop.png'),full_page=True)
    page.reload(); page.locator('#resume-button').click()
    assert 'USING (CodProf)' in page.locator('#sql-j2').input_value()
    assert page.locator('#hint-j2').is_visible()
    for i,room in enumerate(ROOMS):
        fill_room(page,room)
        if i==0:
            q=room['questions'][3]
            wrong=next(v for v in q['options'] if v!=q['answer'])
            page.locator('#card-j4').get_by_role('radio',name=wrong,exact=True).check()
            # Una carga fallida del motor debe permitir reintentar sin consumir la sala.
            page.route('**/sql-worker.js',lambda route:route.abort())
            page.locator('#room-form button[type=submit]').click()
            expect(page.locator('#room-error')).to_contain_text('No se pudo iniciar',timeout=20000)
            assert page.locator('#next-button').count()==0
            assert not page.locator('#room-form').evaluate('(el)=>el.inert')
            page.unroute('**/sql-worker.js')
        page.locator('#room-form button[type=submit]').click()
        expect(page.locator('#unlocked')).to_be_visible(timeout=20000)
        assert page.locator('#room-form textarea:not(:disabled)').count()==0
        assert page.locator('#room-form .feedback').count()==4
        if i==0:
            page.reload(); page.locator('#resume-button').click()
            expect(page.locator('#unlocked')).to_be_visible()
            expect(page.locator('#sql-output-j2 tbody tr')).to_have_count(6)
        page.locator('#next-button').click()
    expect(page.locator('.grade-number')).to_have_text('9,25 / 10')
    page.screenshot(path=str(OUT/'resultado-desktop.png'),full_page=True)
    with page.expect_download(timeout=20000) as info: page.locator('#download-button').click()
    info.value.save_as(OUT/'informe-join.pdf')
    assert info.value.suggested_filename.startswith('Informe_JOIN_Maria_Lopez_Nunez_')
    assert (OUT/'informe-join.pdf').stat().st_size<3_000_000
    text=subprocess.check_output(['pdftotext','-layout',str(OUT/'informe-join.pdf'),'-']).decode()
    assert 'PROTOCOLO JOIN' in text and 'María López Núñez' in text
    assert 'NOTA FINAL: 9,25 / 10' in text
    assert text.count('Respuesta del alumno:')==20
    assert text.count('Resultado ejecutado (')==10
    assert '20. Planifica toda la oferta' in text
    assert 'LEFT JOIN' in text and 'NULL' in text
    page.reload(); page.locator('#resume-button').click()
    expect(page.locator('.grade-number')).to_have_text('9,25 / 10')
    # La partida ER debe seguir separada de la de JOIN.
    page.goto(BASE)
    assert page.locator('#resume-button').count()==0
    assert page.evaluate('localStorage.getItem("protocolo-joins-v1")') is not None
    assert not errors,errors
    print('OK: consultas reales, errores, timeout, SQL equivalente, NULL, guardado, fallo recuperable del motor, nota, PDF y separación de actividades.')

    mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,accept_downloads=True)
    page=mobile.new_page(); start(page)
    page.screenshot(path=str(OUT/'sala-mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    for room in ROOMS:
        fill_room(page,room,wrong=True)
        if room['id']=='parejas': page.locator('#sql-j2').fill('SELECT FROM;')
        page.locator('#room-form button[type=submit]').click()
        expect(page.locator('#next-button')).to_be_visible(timeout=20000)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.locator('#next-button').click()
    expect(page.locator('.grade-number')).to_have_text('0 / 10')
    with page.expect_download(timeout=20000) as info: page.locator('#download-button').click()
    info.value.save_as(OUT/'informe-errores.pdf')
    text=subprocess.check_output(['pdftotext','-layout',str(OUT/'informe-errores.pdf'),'-']).decode()
    assert 'Error de ejecución:' in text and 'SELECT FROM;' in text
    print('OK: móvil, errores SQL que puntúan cero y PDF descargable con nota cero.')
    browser.close()
