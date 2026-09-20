import os

v228 = os.path.join('apps', 'api', 'static', 'apk', 'eleicoes-progressistas-v2.2.8.apk')
if os.path.exists(v228):
    os.remove(v228)
    print(f'Removed: {v228}')

rc_file = os.path.join('scripts', 'render-copy-assets.js')
with open(rc_file, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("eleicoes-progressistas-v2.2.7.apk", "eleicoes-progressistas-v2.2.9-beta.apk")
with open(rc_file, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated scripts/render-copy-assets.js')
