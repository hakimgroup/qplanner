"""
Port a standalone UYPP Q4 stylesheet into a scoped SCSS partial for the planner.

Every rule is nested under a wrapper class so it cannot leak into the planner's
global styles or collide with Mantine's reset. @font-face and @keyframes cannot be
nested, so they are hoisted to the top level; keyframe names are prefixed `uyppQ4`
to avoid clashing with any planner animations. Asset URLs are rewritten to the
public path. This mirrors what was done for Q3 — see _uypp/uypp-home.scss.
"""
import re, sys

def port(src_path, wrapper, out_path, header):
    css = open(src_path, encoding="utf8").read()

    # 1. asset URLs -> public path
    css = re.sub(r'assets/(?:q4|brand)/', '/landing-assets/uypp-q4/img/', css)
    css = re.sub(r'assets/fonts/', '/landing-assets/uypp-q4/fonts/', css)

    # 2. hoist @font-face
    fonts = re.findall(r'@font-face\s*\{[^}]*\}', css)
    css = re.sub(r'@font-face\s*\{[^}]*\}\n?', '', css)

    # 3. hoist @keyframes, prefixing the names
    kf_names = []
    def take_kf(m):
        kf_names.append(m.group(1)); return ''
    keyframes = []
    for m in re.finditer(r'@keyframes\s+([\w-]+)\s*\{(?:[^{}]|\{[^{}]*\})*\}', css):
        keyframes.append(m.group(0)); kf_names.append(m.group(1))
    for k in keyframes:
        css = css.replace(k, '')
    renamed = []
    for k, name in zip(keyframes, kf_names):
        new = 'uyppQ4' + name[0].upper() + name[1:]
        renamed.append(k.replace('@keyframes ' + name, '@keyframes ' + new, 1))
        # rewrite every animation reference to the old name
        css = re.sub(r'(animation(?:-name)?\s*:[^;}]*?)\b' + re.escape(name) + r'\b',
                     lambda mm, n=new: mm.group(1) + n, css)

    # 4. :root and body both become the wrapper itself.
    #    html{} is dropped — smooth scrolling and scroll-padding are applied to the
    #    document by the useSmoothScroll hook, and restored when the page unmounts.
    css = re.sub(r'^:root\s*\{', '& {', css, flags=re.M)
    css = re.sub(r'^html\s*\{[^}]*\}\n?', '', css, flags=re.M)
    def body_rule(m):
        decls = m.group(1)
        # overflow-x:hidden must NOT come across: it breaks position:sticky on the
        # topbar inside the planner's layout. Q3 hit this too.
        decls = re.sub(r'overflow-x\s*:\s*hidden\s*;?', '', decls)
        decls = re.sub(r'margin\s*:\s*0\s*;?', '', decls)
        return '& {' + decls + '\n  min-height:100vh;\n' + \
               '  /* The planner wraps pages in `.app main { padding: 0 20px }` (10px at\n' + \
               '     <=768px). Pull back out so the coloured bands reach the screen edge. */\n' + \
               '  margin-inline:-20px;\n' + \
               '  @media (max-width:768px){ margin-inline:-10px; }\n}'
    css = re.sub(r'^body\s*\{(.*?)\}', body_rule, css, flags=re.M|re.S, count=1)

    # 5. html{} references inside media queries
    css = re.sub(r'html\s*\{\s*scroll-behavior\s*:\s*auto;?\s*\}', '', css)

    # indent the body of the wrapper
    indented = "\n".join(("\t" + l if l.strip() else l) for l in css.strip().split("\n"))

    out = [header, ""]
    out.append("/* ===================== FONTS ===================== */")
    for f in fonts: out.append(f)
    out.append("")
    if renamed:
        out.append("/* ============ KEYFRAMES (global, must not nest — prefixed) ============ */")
        for k in renamed: out.append(k.strip())
        out.append("")
    out.append("/* ===================== SCOPED ROOT ===================== */")
    out.append(f".{wrapper} {{")
    out.append(indented)
    out.append("}")
    open(out_path, "w", encoding="utf8").write("\n".join(out) + "\n")
    print(f"{out_path}: {len(fonts)} @font-face, {len(renamed)} @keyframes hoisted"
          f" ({', '.join('uyppQ4'+n[0].upper()+n[1:] for n in kf_names)})")

D="/tmp/qplanner/client/src/pages/landing/pages/_uypp-q4/"
port("home.css", "uypp-q4-home", D+"uypp-q4-home.scss",
"""/**
 * Scoped port of the standalone Q4 hub stylesheet (originally home.css).
 * Every rule is nested under `.uypp-q4-home` so it cannot leak into the planner's
 * global styles or collide with Mantine's reset. @font-face and @keyframes stay at
 * the top level — they cannot be nested — and the keyframes are prefixed `uyppQ4`
 * so they cannot clash with any planner animation.
 *
 * Do not reintroduce `overflow-x: hidden` on the wrapper: it breaks `position:
 * sticky` on the topbar inside the planner's layout.
 */""")
port("styles.css", "uypp-q4-detail", D+"uypp-q4-detail.scss",
"""/**
 * Scoped port of the standalone Q4 campaign-page stylesheet (originally styles.css).
 * Same rules as the hub sheet: everything nested under `.uypp-q4-detail`, @font-face
 * and @keyframes hoisted, keyframe names prefixed `uyppQ4`.
 *
 * Do not reintroduce `overflow-x: hidden` on the wrapper: it breaks `position:
 * sticky` on the topbar inside the planner's layout.
 */""")
