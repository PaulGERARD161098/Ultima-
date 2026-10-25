#!/usr/bin/env python3
"""Composition locale PDF et SVG ; aucun appel réseau. Dépendance : reportlab.

Les entrées sont des textes, jamais du SVG ni du code. Les données d'instance
et les rendus doivent rester hors du socle neutre. Le dossier cible est neuf.
"""
import argparse
import html
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[1]
LAYOUTS = ('couverture', 'triptyque', 'chaine', 'preuves', 'comparaison',
           'offre', 'feuille-route', 'produit', 'interlude', 'decision')


def text(value, limit=240):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise ValueError('Texte vide, invalide ou trop long')
    if any(ord(c) < 32 for c in value):
        raise ValueError('Caractère de contrôle interdit')
    return value


def validate(data):
    if not isinstance(data, dict) or set(data) != {'marque', 'mention', 'slides'}:
        raise ValueError('Champs de brief attendus : marque, mention, slides')
    text(data['marque'], 45)
    text(data['mention'], 130)
    if not isinstance(data['slides'], list) or not 1 <= len(data['slides']) <= 30:
        raise ValueError('Prévoir une à trente pages')
    for s in data['slides']:
        if not isinstance(s, dict) or set(s) - {'layout', 'section', 'titre', 'texte', 'items', 'source'}:
            raise ValueError('Champ de page inattendu')
        if s.get('layout') not in LAYOUTS:
            raise ValueError('Composition inconnue')
        for k in ('section', 'titre', 'source'):
            text(s.get(k), {'section':40, 'titre':110, 'source':190}[k])
        if 'texte' in s:
            text(s['texte'], 230)
        n = {'triptyque':3, 'chaine':3, 'preuves':3, 'comparaison':4,
             'offre':2, 'feuille-route':3}.get(s['layout'], 0)
        items = s.get('items', [])
        if not isinstance(items, list) or len(items) != n:
            raise ValueError('Nombre de blocs incompatible avec la composition')
        for item in items:
            if not isinstance(item, dict) or set(item) != {'titre', 'texte'}:
                raise ValueError('Chaque bloc exige titre et texte')
            text(item['titre'], 65)
            text(item['texte'], 190)
        if s['layout'] in ('couverture', 'produit', 'decision', 'interlude'):
            text(s.get('texte'), 230)
    return data


class Page:
    def __init__(self, pdf, theme):
        self.pdf, self.t = pdf, theme
        self.w, self.h = theme['page']['width'], theme['page']['height']
        self.svg = []
        self.boxes = []

    def color(self, c):
        return self.t['colors'].get(c, c)

    def rect(self, x, y, w, h, color='paper', stroke=None, radius=0):
        c = self.color(color)
        self.pdf.setFillColor(HexColor(c))
        self.pdf.setStrokeColor(HexColor(self.color(stroke or color)))
        self.pdf.roundRect(x, self.h-y-h, w, h, radius, stroke=int(bool(stroke)), fill=1)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{c}" stroke="{self.color(stroke) if stroke else "none"}"/>')

    def line(self, x, y, xx, yy, color='line'):
        self.pdf.setStrokeColor(HexColor(self.color(color)))
        self.pdf.setLineWidth(1.5)
        self.pdf.line(x, self.h-y, xx, self.h-yy)
        self.svg.append(f'<line x1="{x}" y1="{y}" x2="{xx}" y2="{yy}" stroke="{self.color(color)}" stroke-width="1.5"/>')

    def words(self, value, x, y, width, size=24, color='ink', bold=False, lines=5):
        font = 'DejaVuSans-Bold' if bold else 'DejaVuSans'
        words, out, current = value.split(), [], ''
        for word in words:
            if pdfmetrics.stringWidth(word, font, size) > width:
                raise ValueError('Mot trop long pour la zone : ' + word[:35])
            test = (current + ' ' + word).strip()
            if current and pdfmetrics.stringWidth(test, font, size) > width:
                out.append(current)
                current = word
            else:
                current = test
        if current:
            out.append(current)
        if len(out) > lines:
            raise ValueError('Débordement de texte : ' + value[:60])
        bottom = y + (len(out)-1)*size*1.28 + size*.25
        if x < 0 or x+width > self.w or y-size < 0 or bottom > self.h:
            raise ValueError('Texte hors page')
        self.boxes.append((x, y-size, x+width, bottom, value))
        self.pdf.setFillColor(HexColor(self.color(color)))
        self.pdf.setFont(font, size)
        for i, line in enumerate(out):
            yy = y+i*size*1.28
            self.pdf.drawString(x, self.h-yy, line)
            self.svg.append(f'<text x="{x}" y="{yy}" fill="{self.color(color)}" font-size="{size}" font-weight="{700 if bold else 400}">{html.escape(line)}</text>')
        return bottom

    def illustration(self, x=860, y=250):
        # Métaphore vectorielle originale : des documents vers un dossier clair.
        for i in range(3):
            self.rect(x+14*i, y+25*i, 240, 220, 'paper', 'line', 8)
            for j in range(4):
                self.line(x+28+14*i, y+38+25*i+32*j,
                          x+185+14*i, y+38+25*i+32*j)
        self.rect(x+90, y+170, 270, 190, 'tint', 'decoration', 10)
        self.rect(x+118, y+202, 42, 8, 'decoration')
        for j in range(3):
            self.line(x+118, y+245+28*j, x+315, y+245+28*j, 'accent')

    def save_svg(self, path):
        path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}"><g font-family="DejaVu Sans, sans-serif">'+''.join(self.svg)+'</g></svg>', encoding='utf-8')


def compose(data, output):
    data = validate(data)
    theme = json.loads((ROOT/'assets/theme.json').read_text())
    # Sources système explicites ; aucune police tierce n'est redistribuée.
    for name in ('DejaVuSans', 'DejaVuSans-Bold'):
        p = Path('/usr/share/fonts/truetype/dejavu')/(name+'.ttf')
        if not p.is_file():
            raise ValueError('Police système manquante : '+str(p))
        pdfmetrics.registerFont(TTFont(name, str(p)))
    output = Path(output)
    if output.exists():
        raise ValueError('Dossier de sortie existant ; utiliser un dossier neuf')
    # Valider tous les rendus en mémoire avant de créer le dossier final.
    import io
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(1440, 810), invariant=1)
    pdf.setTitle(data['marque']+' - compositions')
    pages = []
    for idx, s in enumerate(data['slides'], 1):
        p, layout = Page(pdf, theme), s['layout']
        p.rect(0, 0, 1440, 810, 'tint' if layout=='interlude' else 'paper')
        p.words(s['section'].upper(), 90, 84, 1260, 15, 'muted', lines=1)
        if layout == 'couverture':
            end = p.words(s['titre'], 90, 285, 685, 60, bold=True, lines=4)
            p.words(s['texte'], 90, max(end+55, 535), 650, 24, 'muted', lines=4)
            p.illustration()
        elif layout == 'interlude':
            p.words(s['titre'], 90, 370, 1140, 60, bold=True, lines=2)
            p.words(s['texte'], 90, 565, 980, 28, 'muted', lines=3)
        else:
            p.words(s['titre'], 90, 145, 1260, 40.5, 'accent', True, 2)
            if layout in ('triptyque','chaine','feuille-route','offre'):
                n = len(s['items'])
                width = (1260-30*(n-1))/n
                for j, item in enumerate(s['items']):
                    x = 90+j*(width+30)
                    p.rect(x, 250, width, 402, 'tint' if j==n-1 else 'paper', 'line', 8)
                    p.words(str(j+1).zfill(2), x+28, 297, width-56, 18, 'accent', True, 1)
                    end = p.words(item['titre'], x+28, 352, width-56, 28, bold=True, lines=3)
                    p.words(item['texte'], x+28, max(457, end+42), width-56, 23, 'muted', lines=5)
                    if layout == 'chaine' and j<n-1:
                        p.words('→', x+width+3, 455, 27, 24, 'accent', lines=1)
            elif layout == 'preuves':
                for j, item in enumerate(s['items']):
                    x = 90+j*430
                    p.line(x, 290, x+390, 290, 'ink')
                    p.words(item['titre'], x, 410, 390, 72, 'accent', True, 1)
                    p.words(item['texte'], x, 485, 380, 24, 'muted', lines=5)
            elif layout == 'comparaison':
                for j, item in enumerate(s['items']):
                    y = 272+j*96
                    p.line(90, y+70, 1350, y+70)
                    p.words(item['titre'], 100, y+20, 450, 25, bold=True, lines=2)
                    p.words(item['texte'], 600, y+20, 730, 24, 'muted', lines=2)
            elif layout == 'produit':
                p.words(s['texte'], 90, 310, 600, 28, 'muted', lines=8)
                p.illustration(870, 260)
                p.words('Illustration de principe', 875, 658, 430, 18, 'muted', lines=1)
            elif layout == 'decision':
                p.rect(90, 260, 1260, 350, 'ink', radius=10)
                p.words(s['texte'], 135, 350, 1150, 38, 'paper', True, 4)
        p.words(s['source'], 90, 731, 1260, 14, 'muted', lines=2)
        p.words(data['mention'], 90, 775, 1000, 14, 'muted', lines=1)
        p.words(f'{idx:02}', 1220, 775, 130, 14, 'muted', lines=1)
        # Confrontation géométrique des zones de texte ; le vide est refusé.
        if len(p.boxes)<5:
            raise ValueError('Page presque vide')
        for a, b in ((a,b) for i,a in enumerate(p.boxes) for b in p.boxes[i+1:]):
            if min(a[2],b[2])-max(a[0],b[0])>1 and min(a[3],b[3])-max(a[1],b[1])>1:
                raise ValueError('Zones de texte superposées : '+a[4][:35]+' / '+b[4][:35])
        pages.append(p)
        pdf.showPage()
    pdf.save()
    output.mkdir(parents=True, exist_ok=False)
    (output/'compositions.pdf').write_bytes(buffer.getvalue())
    for i, p in enumerate(pages, 1):
        p.save_svg(output/f'page-{i:02}.svg')
    result = {'pages':len(pages), 'compositions':list(dict.fromkeys(s['layout'] for s in data['slides'])),
              'formats':['pdf','svg'], 'fontSubstitution':True,
              'nativePresentation':False, 'visualReview':'required'}
    (output/'rapport.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--brief', type=Path, required=True)
    parser.add_argument('--sortie', type=Path, required=True)
    args = parser.parse_args()
    try:
        raw = json.loads(args.brief.read_text(encoding='utf-8'),
                         parse_constant=lambda x: (_ for _ in ()).throw(ValueError('Nombre non fini')))
        print(json.dumps(compose(raw, args.sortie), ensure_ascii=False))
    except (ValueError, OSError, KeyError, TypeError) as err:
        parser.exit(2, 'Composition refusée : '+str(err)+'\n')
