#!/usr/bin/env python3
"""Essai réel du moteur dans un répertoire temporaire, sans accès métier."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import time
import xml.etree.ElementTree as ET
import fitz

ROOT = Path(__file__).resolve().parents[2]
kit = ROOT/'zohshia/presentations-claires'
spec = importlib.util.spec_from_file_location('composer', kit/'scripts/composer.py')
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
example = json.loads((kit/'assets/exemple.json').read_text())
results = []

def check(name, predicate):
    if not predicate:
        raise AssertionError(name)
    results.append(name)

def rejected(name, data, path):
    try:
        engine.compose(data, path)
    except ValueError:
        check(name, not path.exists())
    else:
        raise AssertionError('Refus absent : '+name)

with tempfile.TemporaryDirectory(prefix='compositions-') as tmp:
    tmp = Path(tmp)
    start = time.perf_counter()
    result = engine.compose(example, tmp/'valide')
    duration = time.perf_counter()-start
    doc = fitz.open(tmp/'valide/compositions.pdf')
    check('dix-pages-non-vides', len(doc)==10 and all(len(p.get_text())>100 for p in doc))
    check('formats-et-geometrie', all(abs(p.rect.width/p.rect.height-16/9)<.001 for p in doc))
    svg = list((tmp/'valide').glob('*.svg'))
    check('dix-svg-editables', len(svg)==10 and all(len(ET.parse(p).findall('.//{http://www.w3.org/2000/svg}text'))>4 for p in svg))
    try:
        engine.compose(example,tmp/'valide')
    except ValueError:
        check('sortie-existante-preservee', fitz.open(tmp/'valide/compositions.pdf').page_count==10)
    else:
        raise AssertionError('Écrasement permis')
    data=copy.deepcopy(example);data['slides'][0]['titre']='T'*111
    rejected('titre-trop-long',data,tmp/'long')
    data=copy.deepcopy(example);data['slides'][0]['titre']='W'*65
    rejected('mot-qui-deborde',data,tmp/'mot')
    data=copy.deepcopy(example);data['slides'][0]['layout']='inconnue'
    rejected('composition-inconnue',data,tmp/'layout')
    data=copy.deepcopy(example);data['slides'][0]['code']='du code inattendu'
    rejected('champ-inattendu',data,tmp/'champ')
    data=copy.deepcopy(example);data['slides']=[]
    rejected('liste-vide',data,tmp/'vide')
    data=copy.deepcopy(example);data['slides'][0]['titre']='<svg onload="alert(1)">'
    engine.compose(data,tmp/'echappe')
    xml=ET.parse(tmp/'echappe/page-01.svg')
    check('texte-externe-echappe', not any('onload' in e.attrib for e in xml.iter()) and '<svg onload=' in ' '.join(xml.getroot().itertext()))
    check('aucun-resultat-natif-invente', result['nativePresentation'] is False and result['visualReview']=='required')
print(json.dumps({'checks':len(results),'passed':results,'renderSeconds':round(duration,3),'visualReview':'separate'},ensure_ascii=False,indent=2))
