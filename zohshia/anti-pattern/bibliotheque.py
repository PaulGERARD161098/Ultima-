#!/usr/bin/env python3
"""Catalogue local : sélection de guides, jamais exécution d'une expertise."""
import argparse
import json
from pathlib import Path
import unicodedata

ROOT = Path(__file__).resolve().parent
CATALOGUE = ROOT / 'points-de-vue.json'

def normaliser(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s).casefold() if not unicodedata.combining(c)).strip()

def resoudre(data, cle):
    matches = [p for p in data['points_de_vue'] if normaliser(cle) in
               {normaliser(p['id']), normaliser(p['alias']), normaliser(p['nom'])}]
    if len(matches) != 1:
        raise ValueError('Point de vue inconnu ou ambigu : ' + cle)
    return matches[0]

def selectionner(data, cles, nature='tache', complexe=False):
    if nature not in {'tache', 'plan', 'retroplanning'}:
        raise ValueError('Nature inconnue')
    points = [resoudre(data, c) for c in cles]
    if len({p['id'] for p in points}) != len(points):
        raise ValueError('Deux invocations du même angle ne comptent pas deux fois')
    minimum = 4 if nature in {'plan', 'retroplanning'} else 3 if complexe else 2
    if len(points) < minimum:
        raise ValueError(f'Couverture insuffisante : {len(points)} / {minimum}')
    return {'minimum': minimum, 'points_de_vue': points,
            'portee': 'Fiches sélectionnées seulement ; application et apport distinct à vérifier sur le sujet réel.',
            'familles': sorted({p['famille'] for p in points})}

def valider(data):
    points = data['points_de_vue']
    if len(points) != 100 or len({p['famille'] for p in points}) != 10:
        raise ValueError('100 points de vue et 10 familles requis')
    for champ in ('id', 'alias', 'nom', 'question'):
        if len({normaliser(p[champ]) for p in points}) != 100:
            raise ValueError('Doublon : ' + champ)
    for i, p in enumerate(points, 1):
        if p['id'] != f'PDV-{i:03}':
            raise ValueError('Identifiant manquant ou déplacé')
        for champ in ('id', 'alias', 'nom', 'famille', 'question', 'preuve', 'limite', 'origine'):
            if not isinstance(p.get(champ), str) or not p[champ].strip():
                raise ValueError('Champ vide : ' + champ)
        for cle in (p['id'], p['alias'], p['nom']):
            if resoudre(data, cle)['id'] != p['id']:
                raise ValueError('Invocation incohérente')
    for nom, cles in data['packs'].items():
        selectionner(data, cles, nom if nom in {'plan', 'retroplanning'} else 'tache', nom != 'calcul')
    return {'ok': True, 'fiches': 100, 'familles': 10, 'invocations_resolues': 300,
            'packs': len(data['packs']), 'limite': 'Doublons textuels contrôlés ; diversité sémantique à apprécier sur chaque sujet.'}

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--id', help='Identifiant, alias ou nom exact')
    mode.add_argument('--search', help='Recherche insensible aux accents')
    mode.add_argument('--pack', help='calcul, complexe, plan, retroplanning, diagnostic ou decision')
    mode.add_argument('--selection', nargs='+', help='Liste explicite de points de vue')
    mode.add_argument('--validate', action='store_true')
    parser.add_argument('--type', choices=['tache', 'plan', 'retroplanning'], default='tache')
    parser.add_argument('--complexe', action='store_true')
    args = parser.parse_args(argv)
    try:
        data = json.loads(CATALOGUE.read_text())
        if args.validate:
            result = valider(data)
        elif args.id:
            result = resoudre(data, args.id)
        elif args.search:
            query = normaliser(args.search)
            if not query:
                raise ValueError('Recherche vide')
            result = [p for p in data['points_de_vue'] if query in normaliser(' '.join(p[k] for k in ('id','alias','nom','famille','question')))]
        elif args.pack:
            if args.pack not in data['packs']:
                raise ValueError('Pack inconnu')
            nature = args.pack if args.pack in {'plan','retroplanning'} else args.type
            result = selectionner(data, data['packs'][args.pack], nature, args.complexe or args.pack in {'complexe','diagnostic','decision'})
        else:
            result = selectionner(data, args.selection, args.type, args.complexe)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, KeyError, OSError, TypeError) as exc:
        parser.exit(2, str(exc) + '\n')

if __name__ == '__main__':
    raise SystemExit(main())
