"""Create a portable source ZIP; never include credentials or installed runtimes."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
out = root / 'artifacts' / 'Ingredi-iOS-Demo.zip'
out.parent.mkdir(exist_ok=True)
files = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'capacitor.config.json', '.gitignore', '.env.example', 'README.md']
folders = ['public', 'scripts', 'docs', 'tests', 'supabase', 'ios']
skip_parts = {'node_modules', '.git', '.tools', '.temp', 'artifacts', 'dist', 'build', 'DerivedData', 'Pods', 'xcuserdata', '__pycache__'}

with ZipFile(out, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, f'Ingredi/{name}')
    for folder in folders:
        for path in sorted((root / folder).rglob('*')):
            rel = path.relative_to(root)
            if not path.is_file() or any(part in skip_parts for part in rel.parts):
                continue
            if rel.parts[:4] == ('ios', 'App', 'App', 'public'):
                continue
            if path.name in {'capacitor.config.json', 'capacitor.plugins.json'} and rel.parts[:3] == ('ios', 'App', 'App'):
                continue
            if path.name.startswith('.env') or path.name.endswith(('.p12', '.mobileprovision', '.pem', '.key')):
                continue
            archive.write(path, 'Ingredi/' + rel.as_posix())

with ZipFile(out) as archive:
    names = archive.namelist()
    assert 'Ingredi/docs/IOS-DEMO.md' in names
    assert 'Ingredi/ios/App/App.xcodeproj/project.pbxproj' in names
    assert not any('/node_modules/' in n or '/.env' == n[-5:] for n in names)
    assert archive.testzip() is None
print(f'Created {out} ({out.stat().st_size:,} bytes, {len(names)} files).')
