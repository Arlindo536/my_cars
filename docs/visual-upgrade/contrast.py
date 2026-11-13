"""WCAG 2.x contrast for the my_cars token pairs (values mirror frontend/src/tokens.css). Usage: python3 -I contrast.py"""


def parse(c):
    c = c.strip()
    if c.startswith('rgba'):
        r, g, b, a = [float(x) for x in c[5:-1].split(',')]
        return (r, g, b, a)
    c = c.lstrip('#')
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), 1.0)


def over(fg, bg):
    """Composite a (possibly translucent) colour over an opaque background."""
    r, g, b, a = parse(fg) if isinstance(fg, str) else fg
    br, bgc, bb, _ = parse(bg) if isinstance(bg, str) else bg
    return (r * a + br * (1 - a), g * a + bgc * (1 - a), b * a + bb * (1 - a), 1.0)


def lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b, _ = c
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def ratio(fg, bg):
    bgc = parse(bg) if isinstance(bg, str) else bg
    fgc = over(fg, bgc)
    l1, l2 = sorted([lum(fgc), lum(bgc)], reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


LIGHT = {
    'bg-0': '#F6F4F0', 'bg-1': '#FFFFFF', 'bg-2': '#EFEBE5',
    'text': '#17181B', 'text-muted': '#5B6068', 'steel': '#5B6068',
    'brand': '#C62828', 'brand-hover': '#B71C1C', 'brand-text': '#C62828', 'brand-ui': '#C62828',
    'field-border': '#80858D',
    'success': '#137038', 'warning': '#A35A00', 'error': '#BE185D', 'info': '#1D6FB8',
    'band-0': '#1B1F25', 'band-1': '#22272E', 'band-2': '#2B313A',
    'band-text': '#F1EEE9', 'band-muted': '#A3A8B0', 'band-brand-text': '#F47A7A', 'band-brand-ui': '#F47A7A',
    'btn-ink': '#22272E', 'btn-ink-text': '#F1EEE9', 'btn-ink-hover': '#343B45',
    'placeholder-a': '#ECE8E2', 'placeholder-b': '#E0DBD3', 'placeholder-fg': '#545960',
}
DARK = {
    'bg-0': '#0F1114', 'bg-1': '#161A1F', 'bg-2': '#1E232A',
    'text': '#F1EEE9', 'text-muted': '#A3A8B0', 'steel': '#9AA3AF',
    'brand': '#C62828', 'brand-hover': '#D32F2F', 'brand-text': '#F26B6B', 'brand-ui': '#E03C3C',
    'field-border': '#6B727C',
    'success': '#4ADE80', 'warning': '#FBBF24', 'error': '#FF8A80', 'info': '#7DB7F0',
    'band-0': '#0F1114', 'band-1': '#161A1F', 'band-2': '#1E232A',
    'band-text': '#F1EEE9', 'band-muted': '#A3A8B0', 'band-brand-text': '#F47A7A', 'band-brand-ui': '#F47A7A',
    'btn-ink': '#2A3038', 'btn-ink-text': '#F1EEE9', 'btn-ink-hover': '#343B45',
    'placeholder-a': '#1E232A', 'placeholder-b': '#252B33', 'placeholder-fg': '#A3A8B0',
}
FILLS = {'on-brand': '#FFFFFF', 'success-strong': '#15803D', 'error-strong': '#BE185D'}

# (label, fg key, bg key, minimum)
PAIRS = [
    ('Text on page / card / raised', 'text', ['bg-0', 'bg-1', 'bg-2'], 4.5),
    ('Muted text on page / card / raised', 'text-muted', ['bg-0', 'bg-1', 'bg-2'], 4.5),
    ('Steel (secondary accent) on page / card', 'steel', ['bg-0', 'bg-1'], 4.5),
    ('Brand as text/icon on page / card', 'brand-text', ['bg-0', 'bg-1', 'bg-2'], 4.5),
    ('Brand UI (focus ring, borders) on page / card', 'brand-ui', ['bg-0', 'bg-1'], 3.0),
    ('Field border on page / card', 'field-border', ['bg-0', 'bg-1'], 3.0),
    ('Success text on page / card', 'success', ['bg-0', 'bg-1'], 4.5),
    ('Warning text on page / card', 'warning', ['bg-0', 'bg-1'], 4.5),
    ('Error text on page / card', 'error', ['bg-0', 'bg-1'], 4.5),
    ('Info text on page / card', 'info', ['bg-0', 'bg-1'], 4.5),
    ('Band text on band 0 / 1 / 2', 'band-text', ['band-0', 'band-1', 'band-2'], 4.5),
    ('Band muted on band 0 / 1 / 2', 'band-muted', ['band-0', 'band-1', 'band-2'], 4.5),
    ('Red text on bands (logo, hero accent) 0 / 1 / 2', 'band-brand-text', ['band-0', 'band-1', 'band-2'], 4.5),
    ('Focus ring on bands 0 / 1 / 2', 'band-brand-ui', ['band-0', 'band-1', 'band-2'], 3.0),
    ('Neutral button text on its fill / hover', 'btn-ink-text', ['btn-ink', 'btn-ink-hover'], 4.5),
    ('Photo placeholder label on its gradient', 'placeholder-fg', ['placeholder-a', 'placeholder-b'], 4.5),
    ('Text on pills / bubbles (raised)', 'text', ['bg-2'], 4.5),
    ('Error (destructive outline) on card', 'error', ['bg-1'], 4.5),
]


def washed(theme, key, alpha, surface):
    r, g, b, _ = parse(theme[key])
    return over((r, g, b, alpha), theme[surface])


def main():
    for name, t in (('LIGHT', LIGHT), ('DARK', DARK)):
        print(f'== {name}')
        for label, fg, bgs, minimum in PAIRS:
            vals = [ratio(t[fg], t[b]) for b in bgs]
            flag = '' if min(vals) >= minimum else '   <-- FAIL'
            print(f'  {label}: ' + ' / '.join(f'{v:.1f}' for v in vals) + f'  (min {minimum}){flag}')
        # Status chips: status colour as text on a tinted chip over the card
        for s in ('success', 'warning', 'error', 'info', 'brand-text'):
            chip = washed(t, s if s != 'brand-text' else 'brand', 0.14 if name == 'DARK' else 0.10, 'bg-1')
            v = ratio(t[s], chip)
            print(f'  {s} on its {"14" if name == "DARK" else "10"}% chip over card: {v:.1f}' + ('' if v >= 4.5 else '   <-- FAIL'))
        v = ratio(t['text'], washed(t, 'text', 0.06, 'bg-1'))
        print(f'  Text on neutral chip (6% text over card): {v:.1f}')
        # Scrolled nav bar: band-1 at 94% over the lightest thing that can scroll under it (a white card),
        # and the transparent bar over the hero's red glow (worst spot of the gradient)
        glass = over((*parse(t['band-1'])[:3], 0.94), '#FFFFFF')
        glow = over('rgba(198, 40, 40, %s)' % ('0.16' if name == 'DARK' else '0.22'), t['band-2'])
        for label, fg, minimum in (('text', 'band-text', 4.5), ('muted', 'band-muted', 4.5), ('red (large logo, active underline)', 'band-brand-text', 3.0)):
            vals = [ratio(t[fg], glass), ratio(t[fg], glow)]
            flag = '' if min(vals) >= minimum else '   <-- FAIL'
            print(f'  Nav {label} on scrolled glass over white / on hero glow: ' + ' / '.join(f'{v:.1f}' for v in vals) + flag)
    print('== FILLS (both themes)')
    for fill in ('#C62828', '#B71C1C', '#D32F2F', '#9F1818'):
        print(f'  White on brand {fill}: {ratio("#FFFFFF", fill):.1f}')
    print(f'  White on success-strong: {ratio("#FFFFFF", FILLS["success-strong"]):.1f}')
    print(f'  White on error-strong: {ratio("#FFFFFF", FILLS["error-strong"]):.1f}')
    print('== OLD (baseline)')
    print(f'  #c8102e on #2b2d31: {ratio("#c8102e", "#2b2d31"):.2f}')
    print(f'  #c8102e on #232529: {ratio("#c8102e", "#232529"):.2f}')
    print(f'  #ff3b55 on #2b2d31: {ratio("#ff3b55", "#2b2d31"):.2f}')


if __name__ == '__main__':
    main()
