"""Assemble the game into one self-contained page.

    python3 build.py          -> index.html (the game)
    python3 build.py --test   -> test.html  (same game plus a window.__pti hook the tests read)
"""
import sys, pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'
JS_PARTS = ['core.js', 'content1.js', 'content2.js', 'app.js', 'modes.js']

# Base styles the claude.ai artifact viewer used to supply; kept so the page looks the same anywhere.
BASE = (':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}')

def build(test=False):
    head = (SRC / 'head.html').read_text()
    css = (SRC / 'style.css').read_text()
    js = '\n'.join((SRC / f).read_text() for f in JS_PARTS)
    if not test:
        js = '\n'.join(l for l in js.split('\n') if not l.startswith('window.__pti'))
    page = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head + '<style>' + BASE + '</style>\n<style>' + css + '</style>\n</head>\n<body>\n'
            '<div id="app"></div>\n<div id="live" class="sr" aria-live="polite"></div>\n'
            '<div id="toasts" class="toasts" aria-hidden="true"></div>\n'
            "<script>\n(function(){\n'use strict';\n" + js + '\n})();\n</script>\n</body>\n</html>\n')
    out = ROOT / ('test.html' if test else 'index.html')
    out.write_text(page)
    print('wrote', out.name, len(page), 'bytes')

if __name__ == '__main__':
    build('--test' in sys.argv)
