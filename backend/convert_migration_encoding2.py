from pathlib import Path

p = Path("migration.sql")
raw = p.read_bytes()
if raw.startswith(b"\xff\xfe"):
    s = raw.decode("utf-16")
    print("Detected UTF-16 LE")
elif raw.startswith(b"\xfe\xff"):
    s = raw.decode("utf-16-be")
    print("Detected UTF-16 BE")
elif raw.startswith(b"\xef\xbb\xbf"):
    s = raw.decode("utf-8-sig")
    print("Detected UTF-8 with BOM")
else:
    try:
        s = raw.decode("utf-8")
        print("Detected UTF-8")
    except UnicodeDecodeError:
        s = raw.decode("latin-1")
        print("Decoded with latin-1 fallback")

p.write_text(s, encoding="utf-8")
print("Rewrote migration.sql as UTF-8 without BOM")
