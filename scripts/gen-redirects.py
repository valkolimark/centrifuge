#!/usr/bin/env python3
# Maps discovered legacy URLs (Wayback + Google + Bing) to new-site destinations.
# Emits rows to append to data/redirects.csv for anything not already covered.
import json

def norm(p): return '/' + p.strip().strip('/')  # leading slash, no trailing

brands = json.load(open('data/oem-brands.json'))['brands']
bslugs = sorted([b['slug'] for b in brands], key=len, reverse=True)
newpaths = set(l.strip().rstrip('/') for l in open('/tmp/newpaths.txt') if l.strip())
covered = set(norm(k) for k in json.load(open('src/lib/redirects-data.json')).keys())
master = [p.strip() for p in open('content-migration/legacy-master.txt') if p.strip()]

# Merged brands → final target (single hop, overrides generated double-hops)
MERGED = {'/alfa-laval-sharples': '/brands/alfa-laval/', '/bird-andritz': '/brands/bird/',
          '/ketema-tolhurst': '/brands/tolhurst/'}

SERVICE = {
 '/centrifuge-repair': '/services/centrifuge-repair/', '/centrifuge-repair-services': '/services/centrifuge-repair/',
 '/industrial-centrifuge-repair': '/services/centrifuge-repair/', '/centrifuge-services': '/services/',
 '/service-and-support': '/services/', '/centrifuges': '/services/', '/custom-products-and-services': '/services/parts-fabrication/',
 '/centrifuge-rebuilding': '/services/centrifuge-rebuilds/', '/basket-centrifuge-repair': '/services/basket-centrifuge-repair/',
 '/decanter-centrifuge-repair': '/services/decanter-centrifuge-repair/', '/disc-stack-separator-repair': '/services/disc-stack-centrifuge-repair/',
 '/pusher-peeler-repair': '/services/pusher-peeler-centrifuge-repair/', '/gearbox-repair': '/services/gearbox-repair/',
 '/gearbox-repair-2': '/services/gearbox-repair/', '/sumitomo-gearbox-repair': '/services/gearbox-repair/',
 '/decanter-gearbox-parts': '/services/gearbox-repair/', '/centrifuge-parts': '/services/parts-fabrication/',
 '/centrifuge-parts-fabrication': '/services/parts-fabrication/', '/centrifuge-parts-sales-mfg': '/services/parts-fabrication/',
 '/fabrication': '/services/parts-fabrication/', '/carbide-tiles': '/services/parts-fabrication/',
 '/custom-centrifuge-manufactring': '/services/parts-fabrication/', '/centrifuge-rentals': '/services/centrifuge-rentals/',
 '/centrifuge-inspections': '/services/centrifuge-inspections/', '/centrifuge-filtration-clarification-systems': '/services/',
 '/settling-tanks': '/services/', '/warranty-options': '/about/',
}
INDUSTRY = {
 '/wastewater-treament': '/industries/wastewater-treatment/', '/beer-centrifuges': '/industries/food-beverage/',
 '/juice-fruit-centrifuge-repair-services': '/industries/food-beverage/', '/dairy-centrifuge-repair-services': '/industries/dairy/',
}
HOWTO = {
 '/how-a-basket-centrifuge-works': '/resources/how-it-works/basket/',
 '/how-a-decanter-centrifuge-works': '/resources/how-it-works/decanter/',
 '/how-a-nozzle-separator-centrifuge-works': '/resources/how-it-works/nozzle-separator/',
 '/how-a-peeler-centrifuge-works': '/resources/how-it-works/peeler/',
 '/how-a-pusher-centrifuge-works': '/resources/how-it-works/pusher/',
 '/how-a-self-cleaning-decanter-centrifuge-works': '/resources/how-it-works/self-cleaning-decanter/',
}
CATEGORY = {
 '/category/centrifuge-repair': '/services/centrifuge-repair/', '/category/fabrication': '/services/parts-fabrication/',
 '/category/gearbox': '/services/gearbox-repair/', '/category/how-it-works': '/resources/how-it-works/',
 '/category/inventory': '/inventory/', '/category/media': '/resources/videos/', '/category/oem': '/brands/',
 '/category/sales': '/used-centrifuges/', '/category/services': '/services/', '/category/uncategorized': '/resources/blog/',
}
MISC = {
 '/about-centrifuge-world': '/about/', '/contact-us': '/contact-cw/', '/text-centrifuge-world': '/contact-cw/',
 '/cw-ez-quote': '/cw-ez-quote-for-sales/', '/sell-your-centrifuge-2': '/sell-your-centrifuge/',
 '/centrifuge-inventory': '/inventory/', '/cw-media': '/resources/videos/', '/media': '/resources/videos/',
 '/sitemap': '/', '/the-joke-of-the-day': '/',
 '/cb-450-01-30-westfalia-decanter-new-never-used': '/used-centrifuges/decanter-centrifuges/',
 '/atm': '/brands/atm-delaval/', '/nx418-with-vfd': '/brands/alfa-laval/', '/lynx-decanter-centrifuge-repair': '/brands/alfa-laval/',
 '/varonesi-centrifuge-repair': '/brands/veronesi/', '/robatel-rousselet': '/brands/rousselet-robatel/',
}
SKIP = {'/.well-known/sgcaptcha', '/'}

rows, unmapped = [], []
for p in master:
    s = norm(p)
    if s in SKIP: continue
    if s.rstrip('/') in newpaths: continue        # exists on new site
    dest = None
    if s in MERGED: dest = MERGED[s]              # override even if 'covered'
    elif s in covered: continue                    # already handled
    elif s.startswith('/tag/'): dest = '/resources/blog/'
    elif s in SERVICE: dest = SERVICE[s]
    elif s in INDUSTRY: dest = INDUSTRY[s]
    elif s in HOWTO: dest = HOWTO[s]
    elif s in CATEGORY: dest = CATEGORY[s]
    elif s in MISC: dest = MISC[s]
    else:
        body = s.lstrip('/')
        m = next((bs for bs in bslugs if body == bs or body.startswith(bs + '-')), None)
        if m: dest = f'/brands/{m}/'
    if s.startswith('/tag/'): continue  # handled by a middleware prefix rule, not CSV
    if dest: rows.append((p if p.endswith('/') else p+'/', dest))
    else: unmapped.append(p)

# de-dupe rows by source
seen=set(); final=[]
for a,b in rows:
    k=norm(a)
    if k in seen: continue
    seen.add(k); final.append((a,b))

with open('/tmp/new_redirects.csv','w') as f:
    for a,b in sorted(final): f.write(f'{a},{b},discovered-search-wayback\n')
print(f'master {len(master)} | new redirects {len(final)} | unmapped {len(unmapped)}')
print('--- unmapped (need manual review) ---')
for p in unmapped: print('  ', p)
print('--- sample new redirects ---')
for a,b in final[:15]: print(f'  {a} -> {b}')
