"""
Build Matrixify-compatible collections CSV.
8 collections with smart rules based on existing product tags.
"""
import csv

# Each row: handle, title, body_html, sort_order, conditions
COLLECTIONS = [
    {
        'handle': 'bestsellers',
        'title': 'Bestsellers',
        'desc': 'Our most-loved products — hand-picked weekly from real customer reviews. 100% natural, ETKO Cosmos certified.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Bestsellers',
    },
    {
        'handle': 'personal-care',
        'title': 'Personal Care',
        'desc': 'Daily essentials for skin, hair and body — gentle formulas with plant-derived actives. No SLS, no parabens, no synthetic fragrances.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Personal Care',
    },
    {
        'handle': 'mom-baby-care',
        'title': 'Mom & Baby Care',
        'desc': 'Safe enough for newborns, gentle enough for sensitive mums. Pregnancy-safe, dermatologically tested, fragrance-friendly.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Mom & Baby Care',
    },
    {
        'handle': 'sun-care',
        'title': 'Sun Care',
        'desc': 'Non-nano mineral sunscreen for the whole family. SPF50, reef-safe, suitable for sensitive skin — even in pregnancy.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Sun Care',
    },
    {
        'handle': 'must-haves',
        'title': 'Must Haves',
        'desc': 'The INature edit — the products we use daily and recommend to every new customer.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Must Haves',
    },
    {
        'handle': 'sale',
        'title': 'Sale',
        'desc': 'Limited-time offers across the INCIA range. Free UK shipping on orders over £20.',
        'sort': 'price-descending',
        'rule_field': 'tag',
        'rule_value': 'On Sale',
    },
    {
        'handle': 'home-care',
        'title': 'Home Care',
        'desc': 'Plant-derived cleaning essentials for a naturally clean home — laundry, dishes, hand soap. Safe around babies and pets.',
        'sort': 'best-selling',
        'rule_field': 'tag',
        'rule_value': 'Home Care',
    },
    {
        'handle': 'lip-balms',
        'title': 'Lip Balms',
        'desc': 'Our complete lip balm collection — coconut, cinnamon, orange, bergamot-lemon and kids flavours. 100% natural beeswax & shea base.',
        'sort': 'manual',
        'rule_field': 'title',
        'rule_value': 'Lip Balm',
        'rule_op': 'contains',
    },
]

# Matrixify Collections CSV columns
HEADERS = [
    'ID',
    'Handle',
    'Command',
    'Title',
    'Body HTML',
    'Sort Order',
    'Template Suffix',
    'Published',
    'Published Scope',
    'Smart Rule: Column',
    'Smart Rule: Relation',
    'Smart Rule: Condition',
    'Smart Rules: Apply Disjunctively',
    'Row #',
    'Top Row',
]

rows = []
for i, c in enumerate(COLLECTIONS, start=1):
    rule_op = c.get('rule_op', 'equals')
    if c['rule_field'] == 'tag':
        smart_col = 'Tag'
    elif c['rule_field'] == 'title':
        smart_col = 'Title'
    else:
        smart_col = 'Tag'
    rows.append([
        '',                       # ID (blank for new)
        c['handle'],
        'MERGE',                  # Command: upsert by handle
        c['title'],
        f"<p>{c['desc']}</p>",
        c['sort'],
        '',                       # Template Suffix
        'TRUE',
        'global',
        smart_col,
        rule_op,
        c['rule_value'],
        'FALSE',                  # Disjunctive (AND not OR)
        i,
        'TRUE',
    ])

out = '/Users/boraesen/Desktop/inaturaltd/shopify-collections-import.csv'
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    w.writerow(HEADERS)
    w.writerows(rows)

print(f'Wrote {len(rows)} collections to {out}')
for c in COLLECTIONS:
    op = c.get('rule_op', 'equals')
    print(f"  {c['handle']:<18} -> rule: {c['rule_field']} {op} '{c['rule_value']}'")
