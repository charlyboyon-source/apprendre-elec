# Générateur d'images « réalistes » (thème clair). Contrôle que chaque texte tient dans le cadre.
import math, os
F=1.3  # grossissement des textes pour rester lisible sur téléphone
INK="#1c2530"; GR="#5b6673"; RED="#d92b2b"; BLUE="#2166d1"; AMB="#b85a08"; YEL="#ffc21a"; GRN="#17804c"
OUT="/Users/charlyboyon/apprendre-elec/assets/svg/"
DEFS='''<defs>
<linearGradient id="corps" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef0f2"/><stop offset=".5" stop-color="#fdfdfd"/><stop offset="1" stop-color="#dfe2e6"/></linearGradient>
<linearGradient id="nez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9ebee"/></linearGradient>
<linearGradient id="manette" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5058"/><stop offset="1" stop-color="#23272c"/></linearGradient>
<radialGradient id="vis" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f1f2f4"/><stop offset="1" stop-color="#8d949c"/></radialGradient>
<linearGradient id="cuivreH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b77a"/><stop offset=".5" stop-color="#c9782f"/><stop offset="1" stop-color="#8f4f17"/></linearGradient>
<linearGradient id="cuivreV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f4f17"/><stop offset=".45" stop-color="#f0b77a"/><stop offset="1" stop-color="#9a5a1f"/></linearGradient>
<linearGradient id="acierH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#aab1b9"/><stop offset="1" stop-color="#7d858e"/></linearGradient>
<linearGradient id="cylH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dde1"/><stop offset=".35" stop-color="#ffffff"/><stop offset="1" stop-color="#c3c8ce"/></linearGradient>
<linearGradient id="gaineV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a81d1d"/><stop offset=".4" stop-color="#ef4a4a"/><stop offset="1" stop-color="#b02020"/></linearGradient>
<linearGradient id="chaud" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3f46"/><stop offset=".5" stop-color="#e8590c"/><stop offset="1" stop-color="#ff3b1f"/></linearGradient>
<filter id="ombre" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#1b2430" flood-opacity=".25"/></filter>
<g id="borne"><rect x="-12" y="-12" width="24" height="24" rx="4" fill="#2b3036"/><circle r="8" fill="url(#vis)"/><rect x="-6" y="-1.2" width="12" height="2.4" rx="1" fill="#5a616a" transform="rotate(-25)"/></g>
</defs>'''
class S:
    def __init__(s,titre,aria,w=640,h=400):
        s.w,s.h,s.aria=w,h,aria; s.o=[]
        s.t(w/2,26,titre,16,True)
    def a(s,x): s.o.append(x)
    def t(s,x,y,txt,size=13,bold=False,fill=INK,anchor="middle"):
        size=round(size*F,1)
        wd=len(txt)*size*(0.60 if bold else 0.54)
        x0={"middle":x-wd/2,"start":x,"end":x-wd}[anchor]
        if not (x0>=3 and x0+wd<=s.w-3 and 10<y<s.h-3): print('  DEBORDE',repr(txt),round(x0),round(x0+wd),y)
        e=txt.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
        s.a(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-weight="{800 if bold else 500}" fill="{fill}">{e}</text>')
    def panneau(s,x,y,w,h): s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#f6f2ea" stroke="#e3dccf"/>')
    def ecrire(s,nom):
        e=s.aria.replace('"',"&quot;")
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s.w} {s.h}" font-family="\'Segoe UI\',system-ui,sans-serif" role="img" aria-label="{e}">\n{DEFS}\n'+"\n".join(s.o)+"\n</svg>\n"
        open(OUT+nom,"w",encoding="utf-8").write(svg)

def disj(s,x,y,k=1.0,marque="C16",boite=None,levee=True):
    """Disjoncteur phase + neutre, 1 module, vu de face. Origine en haut à gauche, 70 x 240 à l'échelle 1."""
    my=150 if levee else 178
    g=[f'<g transform="translate({x} {y}) scale({k})" filter="url(#ombre)">',
       '<rect width="70" height="240" rx="6" fill="url(#corps)" stroke="#b3b9c0"/>',
       '<rect y="60" width="70" height="120" fill="url(#nez)" stroke="#c5cad0"/>',
       '<use href="#borne" x="20" y="30"/><use href="#borne" x="50" y="30"/><use href="#borne" x="20" y="210"/><use href="#borne" x="50" y="210"/>',
       '<rect x="18" y="72" width="34" height="56" rx="4" fill="#d5d9de" stroke="#b3b9c0"/>',
       f'<rect x="22" y="{my-78}" width="26" height="30" rx="4" fill="url(#manette)"/>',
       f'<text x="35" y="150" text-anchor="middle" font-size="17" font-weight="800" fill="{INK}">{marque}</text>']
    if boite:
        g.append(f'<rect x="14" y="157" width="42" height="17" rx="2" fill="none" stroke="{INK}" stroke-width="1.5"/><text x="35" y="170.5" text-anchor="middle" font-size="12" font-weight="800" fill="{INK}">{boite}</text>')
    else:
        g.append(f'<text x="35" y="169" text-anchor="middle" font-size="9" font-weight="500" fill="{GR}">230 V~</text>')
    g.append('</g>'); s.a("".join(g))

# ---------- 1. surcharge et court-circuit
s=S("Deux surintensités à ne pas confondre","Deux surintensités : la surcharge, un courant un peu trop fort qui dure et échauffe les conducteurs ; le court-circuit, un courant énorme et instantané")
s.panneau(16,44,296,340); s.panneau(328,44,296,340)
s.t(164,72,"SURCHARGE",15,True,AMB); s.t(476,72,"COURT-CIRCUIT",15,True,RED)
# multiprise chargée
for i in range(4):
    cx=72+46*i
    s.a(f'<path d="M{cx} 150 C{cx} 120 {cx+(-14 if i%2 else 12)} 112 {cx+(-8 if i%2 else 8)} 88" fill="none" stroke="#2b3036" stroke-width="6" stroke-linecap="round"/>')
s.a('<path d="M248 164 C286 164 292 196 268 214 C250 228 214 224 196 232" fill="none" stroke="url(#chaud)" stroke-width="9" stroke-linecap="round"/>')
for dx in (0,22,44):
    s.a(f'<path d="M{238+dx} 200 q5 -8 0 -15 q-5 -8 0 -15" fill="none" stroke="#e8590c" stroke-width="2.2" stroke-linecap="round" transform="translate(0 {-18 if dx==22 else -8})"/>')
s.a('<g filter="url(#ombre)"><rect x="40" y="136" width="210" height="56" rx="14" fill="url(#nez)" stroke="#b9bfc6"/></g>')
for i in range(4):
    cx=72+46*i
    s.a(f'<circle cx="{cx}" cy="164" r="18" fill="#e4e7ea" stroke="#b9bfc6"/><rect x="{cx-14}" y="{150}" width="28" height="28" rx="7" fill="#2b3036"/><rect x="{cx-5}" y="150" width="10" height="6" fill="#4a5058"/>')
s.t(164,252,"un peu trop de courant",13,True); s.t(164,273,"pendant longtemps",13)
s.t(164,303,"les conducteurs chauffent",13,True); s.t(164,324,"l'isolant se dégrade",12.5,False,GR)
s.t(164,353,"trop d'appareils",12.5,False,GR); s.t(164,373,"sur le même circuit",12.5,False,GR)
# court-circuit : deux conducteurs dénudés qui se touchent
s.a(f'<path d="M346 128 C390 128 420 140 452 152" fill="none" stroke="{RED}" stroke-width="13" stroke-linecap="round"/><path d="M450 151 L486 164" stroke="url(#cuivreH)" stroke-width="7" stroke-linecap="round"/>')
s.a(f'<path d="M346 204 C390 204 420 190 452 178" fill="none" stroke="{BLUE}" stroke-width="13" stroke-linecap="round"/><path d="M450 179 L486 166" stroke="url(#cuivreH)" stroke-width="7" stroke-linecap="round"/>')
def etoile(cx,cy,R,r,n=10,rot=0):
    return " ".join(f"{cx+(R if i%2==0 else r)*math.cos(rot+i*math.pi/n):.1f},{cy+(R if i%2==0 else r)*math.sin(rot+i*math.pi/n):.1f}" for i in range(2*n))
s.a(f'<polygon points="{etoile(500,165,46,20,9,.2)}" fill="{YEL}" stroke="#e8590c" stroke-width="2" stroke-linejoin="round"/><polygon points="{etoile(500,165,24,10,9,.5)}" fill="#fff"/>')
s.t(352,112,"phase",12,True,RED,"start"); s.t(352,228,"neutre",12,True,BLUE,"start")
s.t(476,252,"un courant énorme",13,True); s.t(476,273,"en une fraction de seconde",13)
s.t(476,303,"il faut couper tout de suite",12,True); s.t(476,324,"arc, fusion, incendie",12.5,False,GR)
s.t(476,353,"phase et neutre",12.5,False,GR); s.t(476,373,"en contact direct",12.5,False,GR)
s.ecrire("c10-surintensites.svg")

# ---------- 2. le fusible (cartouche en coupe)
s=S("Le fusible : il fond pour protéger","Le fusible : son élément fond quand le courant dépasse son calibre ; il ne se réarme pas, on le remplace par un fusible neuf de même calibre")
def cartouche(s,x,cy,fondu):
    L=220; x0=x-L/2
    s.a(f'<g filter="url(#ombre)"><rect x="{x0+30}" y="{cy-30}" width="{L-60}" height="60" fill="url(#cylH)" stroke="#b3b9c0"/>'
        f'<rect x="{x0}" y="{cy-32}" width="38" height="64" rx="6" fill="url(#acierH)" stroke="#7d858e"/><rect x="{x0+L-38}" y="{cy-32}" width="38" height="64" rx="6" fill="url(#acierH)" stroke="#7d858e"/></g>')
    s.a(f'<text x="{x0+64}" y="{cy-3}" text-anchor="middle" font-size="14" font-weight="800" fill="{INK}">16 A</text><text x="{x0+64}" y="{cy+13}" text-anchor="middle" font-size="9" font-weight="500" fill="{GR}">calibre</text>')
    wx=x0+92; ww=84
    s.a(f'<rect x="{wx}" y="{cy-20}" width="{ww}" height="40" rx="9" fill="#f3e6c4" stroke="#8d949c" stroke-width="1.5"/>')
    for i in range(14):
        s.a(f'<circle cx="{wx+8+(i*37)%(ww-14)}" cy="{cy-13+(i*11)%27}" r="1.2" fill="#c9b27a"/>')
    if not fondu:
        s.a(f'<path d="M{wx+2} {cy} H{wx+30} l6 -2 h10 l6 2 H{wx+ww-2}" fill="none" stroke="url(#cuivreH)" stroke-width="5"/>')
    else:
        s.a(f'<path d="M{wx+2} {cy} H{wx+24}" stroke="url(#cuivreH)" stroke-width="5"/><path d="M{wx+ww-24} {cy} H{wx+ww-2}" stroke="url(#cuivreH)" stroke-width="5"/>'
            f'<circle cx="{wx+26}" cy="{cy}" r="4.5" fill="#5a3a12"/><circle cx="{wx+ww-26}" cy="{cy}" r="4.5" fill="#5a3a12"/>'
            f'<polygon points="{etoile(wx+ww/2,cy,13,5,7,.3)}" fill="#3a3f46" opacity=".55"/>')
cartouche(s,150,150,False); cartouche(s,490,150,True)
s.a(f'<path d="M286 150 H346" stroke="{AMB}" stroke-width="4"/><polygon points="346,141 362,150 346,159" fill="{AMB}"/>')
s.t(322,134,"surintensité",12,True,AMB)
s.t(150,224,"en service",15,True,GRN); s.t(150,247,"l'élément conduit le courant",13)
s.t(490,224,"fondu",15,True,RED); s.t(490,247,"le circuit est ouvert",13)
s.a(f'<rect x="50" y="290" width="540" height="50" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,321,"Il ne se réarme pas : on le remplace, au même calibre",12,True)
s.t(320,374,"Cartouche vue en coupe : l'élément est noyé dans du sable",12,False,GR)
s.ecrire("c10-fusible.svg")

# ---------- 3. magnétothermique : bilame et électroaimant
s=S("Un disjoncteur, deux déclencheurs","Le disjoncteur magnétothermique réunit deux déclencheurs : le bilame, thermique, contre la surcharge ; l'électroaimant, magnétique, contre le court-circuit")
s.panneau(16,44,296,306); s.panneau(328,44,296,306)
s.t(164,70,"THERMIQUE",15,True,AMB); s.t(164,92,"le BILAME",13,True)
s.t(476,70,"MAGNÉTIQUE",15,True,BLUE); s.t(476,92,"l'ÉLECTROAIMANT",13,True)
# bilame : position froide (pointillés) et chaude (cintrée)
s.a('<rect x="40" y="150" width="26" height="46" rx="4" fill="url(#acierH)" stroke="#7d858e"/><circle cx="53" cy="173" r="6" fill="url(#vis)"/>')
s.a('<path d="M66 173 H250" stroke="#9aa1a9" stroke-width="10" stroke-dasharray="7 6" opacity=".7"/>')
s.a('<path d="M66 168.5 Q170 166 246 116" fill="none" stroke="#aab1b9" stroke-width="5.5" stroke-linecap="round"/><path d="M66 174 Q172 172 249 121" fill="none" stroke="#c9782f" stroke-width="5.5" stroke-linecap="round"/>')
for i in range(4):
    s.a(f'<path d="M{96+i*36} 216 q5 -8 0 -15 q-5 -8 0 -14" fill="none" stroke="#e8590c" stroke-width="2.4" stroke-linecap="round"/>')
s.a(f'<path d="M262 150 V124" stroke="{INK}" stroke-width="2"/><polygon points="256,126 262,112 268,126" fill="{INK}"/>')
s.t(96,140,"froid",11,False,GR); s.t(206,124,"chaud",11,True,AMB)
s.t(164,252,"il chauffe et se déforme",13)
s.t(164,292,"contre la SURCHARGE",13.5,True); s.t(164,314,"déclenchement temporisé",12.5,False,GR)
# électroaimant : bobine de cuivre, noyau attiré
s.a('<rect x="356" y="160" width="150" height="22" rx="3" fill="url(#acierH)" stroke="#7d858e"/>')
for i in range(11):
    s.a(f'<rect x="{364+i*12}" y="142" width="10.5" height="58" rx="5" fill="url(#cuivreV)" stroke="#7a4513" stroke-width=".8"/>')
s.a(f'<path d="M364 200 V222 H344" fill="none" stroke="url(#cuivreH)" stroke-width="5"/><path d="M490 200 V222 H512" fill="none" stroke="url(#cuivreH)" stroke-width="5"/>')
s.a('<rect x="548" y="158" width="56" height="26" rx="4" fill="url(#acierH)" stroke="#7d858e"/>')
s.a(f'<path d="M544 171 H522" stroke="{BLUE}" stroke-width="3"/><polygon points="524,163 510,171 524,179" fill="{BLUE}"/>')
for r in (26,40):
    s.a(f'<path d="M506 {171-r} Q{530+r/2} 171 506 {171+r}" fill="none" stroke="{BLUE}" stroke-width="1.6" stroke-dasharray="4 4" opacity=".7"/>')
s.t(430,130,"bobine",11,False,GR); s.t(576,150,"noyau",11,False,GR)
s.t(476,252,"il attire un noyau",13)
s.t(476,292,"contre le COURT-CIRCUIT",13.5,True); s.t(476,314,"déclenchement instantané",12.5,False,GR)
s.t(320,378,"Après un déclenchement : chercher la cause, puis réarmer",13.5,True)
s.ecrire("c10-magnetothermique.svg")

# ---------- 4. calibre et pouvoir de coupure, lus sur l'appareil
s=S("Calibre et pouvoir de coupure","Le calibre est le courant que l'appareil laisse passer en permanence, en ampères. Le pouvoir de coupure est le plus fort courant de court-circuit qu'il peut couper : 3 000 A au minimum en domestique, 4 500 A en petit tertiaire")
disj(s,277,44,1.22,"C16","3000")
s.a(f'<path d="M296 222 H254" fill="none" stroke="{AMB}" stroke-width="2"/><circle cx="296" cy="222" r="4" fill="{AMB}"/>')
s.a(f'<path d="M348 247 H398 V182 H410" fill="none" stroke="{RED}" stroke-width="2"/><circle cx="348" cy="247" r="4" fill="{RED}"/>')
s.t(16,160,"LE CALIBRE (In)",14,True,AMB,"start"); s.t(16,184,"le courant admis",13,False,INK,"start"); s.t(16,206,"en permanence",13,False,INK,"start")
s.t(16,242,"10 · 16 · 20 · 32 A",14.5,True,INK,"start"); s.t(16,264,"en ampères",12.5,False,GR,"start")
s.t(418,78,"POUVOIR DE COUPURE",13.5,True,RED,"start"); s.t(418,102,"le plus fort",13,False,INK,"start"); s.t(418,124,"court-circuit",13,False,INK,"start"); s.t(418,146,"qu'il sait couper",13,False,INK,"start")
s.t(418,188,"3 000 A",17,True,INK,"start"); s.t(418,210,"minimum en domestique",12.5,False,GR,"start")
s.t(418,250,"4 500 A",17,True,INK,"start"); s.t(418,272,"petit tertiaire,",12.5,False,GR,"start"); s.t(418,293,"moins de 36 kVA",12.5,False,GR,"start")
s.t(320,366,"Le calibre dit quand il coupe ;",12,True); s.t(320,387,"le pouvoir de coupure, s'il y survit",12,True)
s.ecrire("c10-calibre-pdc.svg")

# ---------- 5. courbes B, C, D
s=S("Courbes B, C, D : le seuil magnétique","Courbes de déclenchement magnétique : courbe B entre 3 et 5 fois In, courbe C entre 5 et 10 fois In, courbe D entre 10 et 20 fois In")
COUL={"B":GRN,"C":"#c98a00","D":"#d9480f"}
for lettre,cx,l1,l2 in (("B",120,"3 à 5 In","longues lignes"),("C",320,"5 à 10 In","usage général"),("D",520,"10 à 20 In","forts appels de courant")):
    disj(s,cx-29,40,0.82,lettre+"16")
    s.t(cx,260,f"{lettre} · {l1}",15,True,COUL[lettre]); s.t(cx,282,l2,12.5,False,GR)
X=lambda v: 60+520*math.log(v)/math.log(20)
s.a(f'<rect x="60" y="304" width="520" height="22" rx="4" fill="#ece7dc"/>')
for lettre,a,b in (("B",3,5),("C",5,10),("D",10,20)):
    s.a(f'<rect x="{X(a):.1f}" y="304" width="{X(b)-X(a)-2:.1f}" height="22" rx="4" fill="{COUL[lettre]}"/><text x="{(X(a)+X(b))/2:.1f}" y="321" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">{lettre}</text>')
for v in (1,3,5,10,20):
    s.a(f'<path d="M{X(v):.1f} 300 V331" stroke="{INK}" stroke-width="1.5"/>')
    s.t(round(X(v),1) if v>1 else 68,350,("In" if v==1 else f"{v} In"),11,True)
s.t(320,386,"In = le calibre du disjoncteur",13,True)
s.ecrire("c10-courbes.svg")

# ---------- 6. AGCP : la frontière
s=S("L'AGCP : la frontière de l'installation","L'AGCP, disjoncteur de branchement, marque la frontière : en amont le réseau du distributeur, norme NF C 14-100 ; en aval l'installation de l'électricien, norme NF C 15-100")
s.a('<rect x="16" y="40" width="304" height="262" rx="14" fill="#eef3fb" stroke="#d5deee"/><rect x="320" y="40" width="304" height="262" rx="14" fill="#f6f2ea" stroke="#e3dccf"/>')
s.t(120,64,"AMONT",15,True,BLUE); s.t(120,86,"NF C 14-100",13,True); s.t(120,107,"raccordé par Enedis",12.5,False,GR)
s.t(520,64,"AVAL",15,True,AMB); s.t(520,86,"NF C 15-100",13,True); s.t(520,107,"posé par l'électricien",12.5,False,GR)
# câbles
for y,c in ((196,RED),(212,BLUE)):
    s.a(f'<path d="M150 {y} H262" stroke="{c}" stroke-width="8"/><path d="M378 {y} H486" stroke="{c}" stroke-width="8"/>')
# compteur
s.a('<g filter="url(#ombre)"><rect x="46" y="122" width="108" height="156" rx="12" fill="#c5d93a" stroke="#93a51f"/></g><rect x="62" y="146" width="76" height="34" rx="4" fill="#1f3a2a"/><text x="100" y="169" text-anchor="middle" font-size="13" font-weight="800" fill="#9be7a8" font-family="monospace">kWh</text><circle cx="80" cy="204" r="8" fill="#93a51f"/><circle cx="120" cy="204" r="8" fill="#93a51f"/><rect x="62" y="230" width="76" height="30" rx="4" fill="#b3c62c"/>')
s.t(100,296,"compteur",12,True)
# AGCP
s.a('<g filter="url(#ombre)"><rect x="258" y="116" width="124" height="172" rx="8" fill="url(#corps)" stroke="#b3b9c0"/></g><rect x="258" y="150" width="124" height="104" fill="url(#nez)" stroke="#c5cad0"/>')
s.a('<use href="#borne" x="284" y="133"/><use href="#borne" x="356" y="133"/><use href="#borne" x="284" y="271"/><use href="#borne" x="356" y="271"/>')
s.a('<rect x="296" y="166" width="48" height="72" rx="6" fill="#d5d9de" stroke="#b3b9c0"/><rect x="301" y="170" width="38" height="38" rx="5" fill="url(#manette)"/>')
s.a(f'<rect x="352" y="170" width="24" height="18" rx="4" fill="#f2a20c" stroke="#b97a05"/><text x="364" y="183" text-anchor="middle" font-size="11" font-weight="800" fill="#3a2a00">T</text>')
s.a(f'<text x="320" y="250" text-anchor="middle" font-size="12" font-weight="800" fill="{INK}">AGCP</text>')
s.a(f'<path d="M320 44 V112 M320 292 V300" stroke="{INK}" stroke-width="2" stroke-dasharray="6 5"/>')
# tableau
s.a('<g filter="url(#ombre)"><rect x="486" y="126" width="108" height="150" rx="8" fill="#ffffff" stroke="#b3b9c0"/></g>')
for r in range(2):
    s.a(f'<rect x="496" y="{150+r*58}" width="88" height="6" fill="url(#acierH)"/>')
    for i in range(6):
        s.a(f'<rect x="{498+i*14}" y="{138+r*58}" width="12" height="30" rx="2" fill="url(#corps)" stroke="#b3b9c0"/><rect x="{501+i*14}" y="{144+r*58}" width="6" height="9" rx="1" fill="#3a3f46"/>')
s.t(540,296,"tableau",12,True)
s.t(320,326,"disjoncteur de branchement",13,True)
s.t(320,356,"Type 1 : dans le logement (moins de 30 m)",13); s.t(320,380,"Type 2 : en limite de propriété (plus de 30 m)",13)
s.ecrire("c10-agcp.svg")

# ---------- 7. section -> calibre maximal
s=S("À chaque section son calibre maximal","Calibre maximal du disjoncteur selon la section du conducteur : 1,5 mm² 16 A ; 2,5 mm² 20 A ; 6 mm² 32 A ; 10 mm² 40 A ; 16 mm² 63 A")
for (sec,cal,d),cx in zip((("1,5","16 A",11),("2,5","20 A",14),("6","32 A",22),("10","40 A",29),("16","63 A",36)),(80,200,320,440,560)):
    s.a(f'<rect x="{cx-44}" y="46" width="88" height="40" rx="9" fill="{INK}"/><text x="{cx}" y="73" text-anchor="middle" font-size="21" font-weight="800" fill="#fff">{cal}</text>')
    s.a(f'<path d="M{cx} 92 V108" stroke="{GR}" stroke-width="2"/><polygon points="{cx-5},98 {cx},90 {cx+5},98" fill="{GR}"/>')
    g=d+10
    s.a(f'<g filter="url(#ombre)"><rect x="{cx-g/2}" y="176" width="{g}" height="104" fill="url(#gaineV)"/><ellipse cx="{cx}" cy="280" rx="{g/2}" ry="{g/7:.1f}" fill="#a81d1d"/></g>'
        f'<ellipse cx="{cx}" cy="176" rx="{g/2}" ry="{g/7:.1f}" fill="#f06a6a" stroke="#a81d1d" stroke-width=".8"/>'
        f'<rect x="{cx-d/2}" y="122" width="{d}" height="54" fill="url(#cuivreV)"/><ellipse cx="{cx}" cy="176" rx="{d/2}" ry="{d/7:.1f}" fill="#9a5a1f"/>'
        f'<ellipse cx="{cx}" cy="122" rx="{d/2}" ry="{d/7:.1f}" fill="#f3c592" stroke="#8f4f17" stroke-width=".8"/>')
    s.t(cx,312,sec+" mm²",15,True)
s.t(320,337,"en bas la section du conducteur, en haut le calibre maximal",12,False,GR)
s.a(f'<rect x="30" y="350" width="580" height="38" rx="10" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,375,"Le disjoncteur protège le conducteur : jamais plus fort que lui",11.5,True)
s.ecrire("c10-sections.svg")
print("7 images écrites")
