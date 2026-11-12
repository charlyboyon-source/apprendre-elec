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
<linearGradient id="icta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d949c"/><stop offset=".3" stop-color="#dfe3e7"/><stop offset="1" stop-color="#6b727a"/></linearGradient>
<linearGradient id="tpc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b02020"/><stop offset=".3" stop-color="#ff6b5e"/><stop offset="1" stop-color="#8e1414"/></linearGradient>
<linearGradient id="irl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aab1b9"/><stop offset=".3" stop-color="#f1f3f5"/><stop offset="1" stop-color="#8d949c"/></linearGradient>
<linearGradient id="terre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a877"/><stop offset="1" stop-color="#a98557"/></linearGradient>
<pattern id="vj" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="16" height="16" fill="#2e9e4f"/><rect width="7" height="16" fill="#f2d21a"/></pattern>
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

def disj(s,x,y,k=1.0,marque="C16",boite=None,levee=True,ombre=True):
    """Disjoncteur phase + neutre, 1 module, vu de face. Origine en haut à gauche, 70 x 240 à l'échelle 1."""
    my=150 if levee else 178
    g=[f'<g transform="translate({x} {y}) scale({k})"'+(' filter="url(#ombre)"' if ombre else '')+'>',
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
print("module 10 : 7 images")

# =====================================================================
# MODULE 11 — le tableau électrique et ses différentiels
# =====================================================================
def idiff(s,x,y,k=1.0,cal="40 A",typ="A",ombre=True):
    """Interrupteur différentiel 2 modules, vu de face : 140 x 240 à l'échelle 1."""
    onde='<path d="M24 232 q4 -10 8 0 t8 0" fill="none" stroke="#1c2530" stroke-width="1.4"/>'
    if typ=="A": onde+='<path d="M24 240 q4 -8 8 0 M40 240 h0" fill="none" stroke="#1c2530" stroke-width="1.4"/><path d="M42 232 h8" stroke="#1c2530" stroke-width="1.4"/>'
    g=[f'<g transform="translate({x} {y}) scale({k})"'+(' filter="url(#ombre)"' if ombre else '')+'>',
       '<rect width="140" height="240" rx="6" fill="url(#corps)" stroke="#b3b9c0"/>',
       '<rect y="60" width="140" height="120" fill="url(#nez)" stroke="#c5cad0"/>',
       '<use href="#borne" x="35" y="30"/><use href="#borne" x="105" y="30"/><use href="#borne" x="35" y="210"/><use href="#borne" x="105" y="210"/>',
       '<rect x="20" y="72" width="34" height="62" rx="4" fill="#d5d9de" stroke="#b3b9c0"/><rect x="24" y="72" width="26" height="34" rx="4" fill="url(#manette)"/>',
       '<rect x="76" y="72" width="46" height="24" rx="4" fill="#f2a20c" stroke="#b97a05"/><text x="99" y="89" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2a00">TEST</text>',
       f'<text x="99" y="120" text-anchor="middle" font-size="18" font-weight="800" fill="{INK}">{cal}</text>',
       f'<text x="99" y="141" text-anchor="middle" font-size="16" font-weight="800" fill="{BLUE}">30 mA</text>',
       f'<g transform="translate(0 -84)"><rect x="18" y="222" width="38" height="24" rx="3" fill="none" stroke="{INK}" stroke-width="1.4"/>{onde}</g>',
       f'<text x="99" y="166" text-anchor="middle" font-size="14" font-weight="800" fill="{INK}">type {typ}</text>',
       '</g>']
    s.a("".join(g))
def agcp(s,x,y,k=1.0,texte="AGCP"):
    """Disjoncteur de branchement, vu de face : 124 x 172 à l'échelle 1."""
    s.a(f'<g transform="translate({x} {y}) scale({k})" filter="url(#ombre)"><rect width="124" height="172" rx="8" fill="url(#corps)" stroke="#b3b9c0"/>'
        '<rect y="34" width="124" height="104" fill="url(#nez)" stroke="#c5cad0"/>'
        '<use href="#borne" x="26" y="17"/><use href="#borne" x="98" y="17"/><use href="#borne" x="26" y="155"/><use href="#borne" x="98" y="155"/>'
        '<rect x="38" y="46" width="48" height="66" rx="6" fill="#d5d9de" stroke="#b3b9c0"/><rect x="43" y="50" width="38" height="36" rx="5" fill="url(#manette)"/>'
        '<rect x="94" y="50" width="24" height="18" rx="4" fill="#f2a20c" stroke="#b97a05"/><text x="106" y="63" text-anchor="middle" font-size="11" font-weight="800" fill="#3a2a00">T</text>'
        f'<text x="62" y="131" text-anchor="middle" font-size="15" font-weight="800" fill="{INK}">{texte}</text></g>')
def module_vide(s,x,y,k,n=1):
    s.a(f'<g transform="translate({x} {y}) scale({k})"><rect width="{70*n}" height="240" rx="6" fill="url(#corps)" stroke="#b3b9c0"/><rect y="60" width="{70*n}" height="120" fill="url(#nez)" stroke="#c5cad0"/></g>')
def prise_mod(s,x,y,k):
    s.a(f'<g transform="translate({x} {y}) scale({k})"><rect width="140" height="240" rx="6" fill="url(#corps)" stroke="#b3b9c0"/><rect y="60" width="140" height="120" fill="url(#nez)" stroke="#c5cad0"/>'
        '<circle cx="70" cy="120" r="48" fill="#e4e7ea" stroke="#b3b9c0" stroke-width="3"/><circle cx="50" cy="124" r="8" fill="#1f2428"/><circle cx="90" cy="124" r="8" fill="#1f2428"/><rect x="65" y="84" width="10" height="20" rx="5" fill="#c9a03a"/></g>')
def libre(s,x,y,k,n=1):
    s.a(f'<rect x="{x+1.5}" y="{y+1.5}" width="{70*n*k-3}" height="{240*k-3}" rx="4" fill="#e6f6ec" stroke="{GRN}" stroke-width="2" stroke-dasharray="6 4"/>')
def rail(s,x,y,w,k):
    s.a(f'<rect x="{x}" y="{y+102*k}" width="{w}" height="{36*k}" fill="url(#acierH)" stroke="#9aa1a9" stroke-width=".6"/>')
def coffret(s,x,y,w,h):
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#f7f8f9" stroke="#c5cad0"/></g>')

# ---------- 11.1 le tableau de répartition
s=S("Le tableau : des rangées de modules","Le tableau de répartition : des rangées de modules sur rail, avec en tête de chaque rangée un interrupteur différentiel suivi de ses disjoncteurs")
K=0.3; M=70*K
coffret(s,150,42,306,306)
for r,(typ,nb,marques) in enumerate((("A",6,["C32","C20","C20","C16","C16","C10"]),("AC",7,["C10","C10","C16","C16","C16","C20","C2"]))):
    y=58+r*96; rail(s,160,y,286,K)
    idiff(s,166,y,K,"63 A",typ,False)
    for i in range(nb): disj(s,166+2*M+i*M,y,K,marques[i],None,True,False)
y=58+2*96; rail(s,160,y,286,K)
for i in range(3): module_vide(s,166+i*M,y,K)
libre(s,166+3*M,y,K,10)
s.a(f'<text x="{166+8*M}" y="{y+41}" text-anchor="middle" font-size="16" font-weight="800" fill="{GRN}">réserve</text>')
s.t(470,100,"type A",13,True,INK,"start"); s.t(470,196,"type AC",13,True,INK,"start"); s.t(470,292,"réserve",13,True,GRN,"start")
s.t(8,84,"interrupteur",12,True,INK,"start"); s.t(8,105,"différentiel",12,True,INK,"start"); s.t(8,126,"en tête",12,False,GR,"start")
s.a(f'<path d="M118 100 H160" stroke="{INK}" stroke-width="2"/><polygon points="158,94 170,100 158,106" fill="{INK}"/>')
s.t(8,188,"ses",12,False,GR,"start"); s.t(8,209,"disjoncteurs",12,True,INK,"start"); s.t(8,230,"à la suite",12,False,GR,"start")
s.a(f'<path d="M118 204 H200" stroke="{INK}" stroke-width="2"/><polygon points="198,198 210,204 198,210" fill="{INK}"/>')
s.t(320,378,"Un interrupteur différentiel en tête, ses disjoncteurs à la suite",12,True)
s.ecrire("c11-tableau.svg")

# ---------- 11.2 de l'AGCP aux circuits
s=S("De l'AGCP aux circuits","De l'AGCP aux circuits : le disjoncteur de branchement alimente les interrupteurs différentiels, qui alimentent chacun leurs disjoncteurs divisionnaires, d'où partent les circuits",640,430)
def ligne(d):
    s.a(f'<path d="{d}" fill="none" stroke="{RED}" stroke-width="4" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="{BLUE}" stroke-width="4" stroke-linejoin="round" transform="translate(5 5)"/>')
ligne("M330 112 V132 H170 V150"); ligne("M330 132 H480 V150")
for cx in (170,480):
    ligne(f"M{cx} 252 V268 H{cx-42} V282"); ligne(f"M{cx} 268 V282"); ligne(f"M{cx} 268 H{cx+42} V282")
agcp(s,294,42,0.6,"AGCP")
s.t(384,84,"AGCP",13,True,INK,"start")
idiff(s,140,150,0.43,"40 A","AC"); idiff(s,450,150,0.43,"40 A","A")
s.t(212,186,"interrupteur",12,True,INK,"start"); s.t(212,207,"différentiel",12,True,INK,"start"); s.t(212,229,"30 mA · type AC",11.5,False,GR,"start")
s.t(628,186,"interrupteur",12,True,INK,"end"); s.t(628,207,"différentiel",12,True,INK,"end"); s.t(628,229,"30 mA · type A",11.5,False,GR,"end")
for cx,ms in ((170,("C10","C16","C16")),(480,("C32","C20","C20"))):
    for i,mq in enumerate(ms): disj(s,cx-42-13+i*42,282,0.37,mq)
# conducteur de terre : il descend tout droit, sans appareil
for i in range(15):
    s.a(f'<rect x="38" y="{58+i*20}" width="8" height="20" fill="{"#2e9e4f" if i%2==0 else "#f2d21a"}"/>')
s.a('<rect x="22" y="358" width="40" height="14" rx="3" fill="url(#cuivreH)" stroke="#8f4f17"/><circle cx="32" cy="365" r="3.5" fill="url(#vis)"/><circle cx="52" cy="365" r="3.5" fill="url(#vis)"/>')
s.t(54,52,"terre",12,True,GRN,"start")
s.t(340,392,"disjoncteurs divisionnaires : un par circuit",12,True)
s.t(340,418,"La terre, elle, ne passe par aucun appareil de coupure",11.5,False,GR)
s.ecrire("c11-arborescence.svg")

# ---------- 11.3 combien et lesquels
s=S("Au moins deux interrupteurs différentiels","Au moins deux interrupteurs différentiels 30 mA : un de type AC pour l'éclairage et les prises, un de type A pour la plaque de cuisson et le lave-linge")
s.panneau(16,44,296,290); s.panneau(328,44,296,290)
for px,typ,l1,l2,l3 in ((16,"AC","éclairage","prises de courant","circuits ordinaires"),(328,"A","plaque de cuisson","lave-linge","électronique de puissance")):
    s.t(px+148,72,"TYPE "+typ,15,True,AMB if typ=="AC" else BLUE)
    idiff(s,px+16,90,0.72,"40 A",typ)
    s.t(px+134,128,"30 mA",15,True,BLUE,"start")
    s.t(px+134,164,l1,12,False,INK,"start"); s.t(px+134,188,l2,12,False,INK,"start")
    s.t(px+148,306,l3,12.5,False,GR)
s.a(f'<rect x="90" y="346" width="460" height="42" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,374,"Minimum : 1 type AC + 1 type A",14,True)
s.ecrire("c11-types.svg")

# ---------- 11.4 huit disjoncteurs au maximum
s=S("8 disjoncteurs au maximum par différentiel","Huit disjoncteurs au maximum derrière un même interrupteur différentiel")
K=0.62; M=70*K; x0=320-(10*M)/2
s.a(f'<rect x="{x0-22}" y="{66+102*K}" width="{10*M+44}" height="{36*K}" fill="url(#acierH)" stroke="#9aa1a9"/>')
idiff(s,x0,66,K,"63 A","AC")
for i,mq in enumerate(("C10","C10","C16","C16","C16","C16","C20","C20")):
    disj(s,x0+2*M+i*M,66,K,mq)
    s.t(round(x0+2*M+i*M+M/2,1),246,str(i+1),13,True)
s.t(round(x0+M,1),246,"ID 30 mA",11,True,BLUE)
bx=x0+2*M
s.a(f'<path d="M{bx} 262 v10 H{bx+8*M} v-10" fill="none" stroke="{INK}" stroke-width="2.5"/>')
s.t(round(bx+4*M,1),300,"8 disjoncteurs maximum",15,True)
s.a(f'<rect x="40" y="330" width="560" height="50" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,351,"Répartis l'éclairage et les prises",12,True); s.t(320,372,"sur plusieurs différentiels",12,True)
s.ecrire("c11-huit.svg")

# ---------- 11.5 méthode amont
s=S("Méthode amont : au moins le calibre de l'AGCP","Méthode amont : le calibre de l'interrupteur différentiel est au moins égal à celui du disjoncteur de branchement. Exemple : AGCP réglé sur 45 A, interrupteur différentiel de 63 A",640,420)
agcp(s,84,70,1.0,"45 A"); s.t(146,60,"AGCP",13,True); s.t(146,274,"45 A",17,True)
idiff(s,424,62,0.74,"63 A","A"); s.t(476,52,"interrupteur diff.",12,True); s.t(476,274,"63 A",17,True)
for y,c in ((150,RED),(166,BLUE)):
    s.a(f'<path d="M210 {y} H420" stroke="{c}" stroke-width="7"/>')
s.a(f'<circle cx="316" cy="158" r="30" fill="#fff" stroke="{INK}" stroke-width="2.5"/><text x="316" y="172" text-anchor="middle" font-size="40" font-weight="800" fill="{INK}">≤</text>')
s.a(f'<rect x="30" y="296" width="580" height="42" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,323,"calibre du différentiel ≥ calibre de l'AGCP",12.5,True)
s.t(320,368,"Calibres courants : 25 A · 40 A · 63 A",13,True)
s.t(320,396,"40 A serait trop faible pour un AGCP de 45 A",12.5,False,GR)
s.ecrire("c11-amont.svg")

# ---------- 11.6 méthode aval
s=S("Méthode aval : la somme divisée par 2","Méthode aval : on additionne les calibres des disjoncteurs placés derrière l'interrupteur différentiel et on divise par deux ; le chauffage, le chauffe-eau et la recharge de véhicule comptent en entier. Exemple : 10 + 16 + 20 + 20 = 66, divisé par 2 = 33 A, donc un interrupteur différentiel de 40 A")
for i,mq in enumerate(("C10","C16","C20","C20")):
    disj(s,26+i*50,46,0.4,mq)
    if i<3: s.a(f'<text x="{26+i*50+39}" y="100" text-anchor="middle" font-size="18" font-weight="800" fill="{INK}">+</text>')
s.t(240,66,"1 · ADDITIONNER",13,True,AMB,"start"); s.t(240,94,"10 + 16 + 20 + 20 = 66 A",15,True,INK,"start"); s.t(240,118,"les calibres des disjoncteurs en aval",11.5,False,GR,"start")
s.a(f'<path d="M20 152 H620" stroke="#e3dccf" stroke-width="2"/><path d="M20 246 H620" stroke="#e3dccf" stroke-width="2"/>')
s.a(f'<circle cx="112" cy="199" r="34" fill="#fff1c2" stroke="{YEL}" stroke-width="2"/><text x="112" y="210" text-anchor="middle" font-size="30" font-weight="800" fill="{INK}">÷ 2</text>')
s.t(240,178,"2 · DIVISER PAR 2",13,True,AMB,"start"); s.t(240,206,"66 / 2 = 33 A",15,True,INK,"start"); s.t(240,230,"tout ne fonctionne pas en même temps",11.5,False,GR,"start")
idiff(s,84,254,0.37,"40 A","AC")
s.t(240,272,"3 · CHOISIR",13,True,AMB,"start"); s.t(240,300,"interrupteur différentiel 40 A",14.5,True,INK,"start"); s.t(240,324,"le calibre courant juste au-dessus",11.5,False,GR,"start")
s.a(f'<rect x="30" y="346" width="580" height="48" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,366,"Chauffage, chauffe-eau, recharge de véhicule :",11.5,True); s.t(320,386,"leur calibre compte EN ENTIER, sans diviser",11.5,True)
s.ecrire("c11-aval.svg")

# ---------- 11.7 la réserve
s=S("Prévoir la suite : la réserve","Dans le tableau : 20 % de réserve, dont 6 modules libres consécutifs, et 2 prises de courant modulaires")
K=0.335; M=70*K
coffret(s,22,42,13*M+28,300)
for r in range(3):
    y=58+r*92; rail(s,30,y,13*M+12,K)
    if r==0:
        idiff(s,36,y,K,"63 A","A",False)
        for i,mq in enumerate(("C32","C20","C20","C16","C16")): disj(s,36+(2+i)*M,y,K,mq,None,True,False)
        idiff(s,36+7*M,y,K,"40 A","AC",False)
        for i in range(4): disj(s,36+(9+i)*M,y,K,"C16",None,True,False)
    elif r==1:
        idiff(s,36,y,K,"63 A","AC",False)
        for i,mq in enumerate(("C10","C10","C16","C16","C16","C16","C2")): disj(s,36+(2+i)*M,y,K,mq,None,True,False)
        prise_mod(s,36+9*M,y,K); prise_mod(s,36+11*M,y,K)
    else:
        idiff(s,36,y,K,"40 A","AC",False)
        for i,mq in enumerate(("C10","C10","C16")): disj(s,36+(2+i)*M,y,K,mq,None,True,False)
        for i in range(8): libre(s,36+(5+i)*M,y,K)
y=58+2*92
s.a(f'<path d="M{36+7*M} {y+240*K+8} v8 H{36+13*M} v-8" fill="none" stroke="{GRN}" stroke-width="2.5"/>')
s.t(374,94,"20 %",21,True,GRN,"start"); s.t(374,120,"de réserve au minimum",12,False,INK,"start")
s.t(374,186,"2 PRISES",14,True,INK,"start"); s.t(374,210,"de courant modulaires",12,False,INK,"start")
s.t(374,276,"6 MODULES",14,True,GRN,"start"); s.t(374,300,"libres consécutifs",12,False,INK,"start")
s.t(320,362,"Exemple : 39 modules, donc 8 libres au minimum",12,False,GR)
s.t(320,388,"Un tableau plein dès le premier jour est un tableau mal conçu",11.5,True)
s.ecrire("c11-reserve.svg")
print("module 11 : 7 images")

# =====================================================================
# VUE EN COUPE — le disjoncteur magnétothermique (remplace l'image 10.3)
# =====================================================================
s=S("Un disjoncteur, deux déclencheurs","Vue en coupe d'un disjoncteur magnétothermique : le courant traverse les contacts, puis l'électroaimant, magnétique, qui déclenche instantanément sur court-circuit, puis le bilame, thermique, qui déclenche après un temps sur surcharge",640,440)
# boîtier
s.a('<g filter="url(#ombre)"><path d="M186 66 H454 a8 8 0 0 1 8 8 V350 a8 8 0 0 1 -8 8 H186 a8 8 0 0 1 -8 -8 V232 h-10 v-44 h10 V74 a8 8 0 0 1 8 -8 Z" fill="#eef0f2" stroke="#b3b9c0" stroke-width="2"/></g>')
s.a('<rect x="190" y="78" width="260" height="268" rx="6" fill="#fbfbfc" stroke="#d5d9de"/>')
# bornes (cage en laiton + vis)
for y in (86,296):
    s.a(f'<rect x="198" y="{y}" width="58" height="42" rx="4" fill="#d9b25a" stroke="#8a6416"/><rect x="206" y="{y+12}" width="30" height="18" rx="2" fill="#5a4310"/><circle cx="244" cy="{y+21}" r="8" fill="url(#vis)" stroke="#6b7078"/><rect x="238" y="{y+19.8}" width="12" height="2.4" fill="#5a616a" transform="rotate(-25 244 {y+21})"/>')
# contact fixe, contact mobile, tresse
s.a('<path d="M256 100 H306 V118" fill="none" stroke="url(#cuivreH)" stroke-width="8" stroke-linejoin="round"/><rect x="299" y="116" width="14" height="8" rx="2" fill="#e8eaed" stroke="#8d949c"/>')
s.a('<path d="M306 132 L376 158" stroke="url(#cuivreH)" stroke-width="9" stroke-linecap="round"/><rect x="299" y="125" width="14" height="8" rx="2" fill="#e8eaed" stroke="#8d949c"/><circle cx="376" cy="158" r="9" fill="url(#vis)" stroke="#6b7078"/>')
s.a('<path d="M380 164 q14 6 10 18 q-3 8 6 14" fill="none" stroke="#c9782f" stroke-width="5" stroke-dasharray="3 2"/>')
# manette et sa biellette
s.a('<g transform="rotate(18 392 96)"><rect x="380" y="34" width="26" height="70" rx="7" fill="url(#manette)"/></g><circle cx="392" cy="98" r="7" fill="#7d858e"/><path d="M392 98 L376 158" stroke="#7d858e" stroke-width="3"/>')
# électroaimant : bobine + noyau
s.a('<rect x="352" y="206" width="92" height="14" rx="2" fill="url(#acierH)" stroke="#7d858e"/>')
for i in range(7):
    s.a(f'<rect x="{358+i*11.5:.1f}" y="190" width="10" height="46" rx="5" fill="url(#cuivreV)" stroke="#7a4513" stroke-width=".8"/>')
s.a(f'<path d="M356 232 V262 H330" fill="none" stroke="url(#cuivreH)" stroke-width="6" stroke-linejoin="round"/>')
# bilame (deux métaux) et liaison à la borne aval
s.a('<path d="M330 259 Q290 256 250 268" fill="none" stroke="#aab1b9" stroke-width="5" stroke-linecap="round"/><path d="M330 264.5 Q290 261.5 251 273.5" fill="none" stroke="#c9782f" stroke-width="5" stroke-linecap="round"/><rect x="326" y="252" width="12" height="20" rx="2" fill="url(#acierH)" stroke="#7d858e"/>')
s.a('<path d="M250 271 H232 V296" fill="none" stroke="url(#cuivreH)" stroke-width="6" stroke-linejoin="round"/>')
for i in range(3):
    s.a(f'<path d="M{268+i*22} 300 q4 -6 0 -11 q-4 -6 0 -11" fill="none" stroke="#e8590c" stroke-width="2" stroke-linecap="round"/>')
# repères
def repere(x1,y1,x2,y2,c=INK): s.a(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{c}" stroke-width="1.6"/><circle cx="{x1}" cy="{y1}" r="3" fill="{c}"/>')
repere(402,60,476,60); s.t(482,65,"manette",11.5,True,INK,"start")
repere(306,125,170,125); s.t(164,130,"contacts",11.5,True,INK,"end")
repere(204,107,170,90); s.t(164,95,"borne",11.5,False,GR,"end")
repere(204,330,170,348); s.t(164,353,"borne",11.5,False,GR,"end")
repere(444,213,476,190,BLUE)
s.t(482,176,"ÉLECTROAIMANT",11.5,True,BLUE,"start"); s.t(482,197,"magnétique :",11.5,False,INK,"start"); s.t(482,218,"court-circuit,",11.5,True,INK,"start"); s.t(482,239,"instantané",11.5,False,GR,"start")
repere(262,268,170,232,AMB)
s.t(164,222,"BILAME",11.5,True,AMB,"end"); s.t(164,243,"thermique :",11.5,False,INK,"end"); s.t(164,264,"surcharge,",11.5,True,INK,"end"); s.t(164,285,"temporisé",11.5,False,GR,"end")
s.t(444,338,"vue en coupe",10,False,GR,"end")
s.t(320,392,"L'un ou l'autre ouvre les contacts : le courant est coupé",11.5,False,GR)
s.t(320,420,"Après un déclenchement : chercher la cause, puis réarmer",12.5,True)
s.ecrire("c10-magnetothermique.svg")
print("vue en coupe du disjoncteur")

# =====================================================================
# MODULE 12 — conducteurs et câbles
# =====================================================================
BLEU="#3d9be9"; MARRON="#7a4a22"; NOIR="#2b3036"
def fil(s,x,y,L,d,coul,cu=44,dc=None,brins=0):
    """Conducteur horizontal dénudé à droite. coul : couleur ou 'vj' (vert/jaune)."""
    dc=dc or d*0.55; fill="url(#vj)" if coul=="vj" else coul
    s.a(f'<rect x="{x+L-2}" y="{y-dc/2}" width="{cu}" height="{dc}" fill="url(#cuivreH)"/><ellipse cx="{x+L+cu-2}" cy="{y}" rx="{dc/5:.1f}" ry="{dc/2}" fill="#f3c592" stroke="#8f4f17" stroke-width=".8"/>')
    for i in range(brins):
        yy=y-dc/2+dc*(i+1)/(brins+1)
        s.a(f'<path d="M{x+L} {yy:.1f} H{x+L+cu-4}" stroke="#7a4513" stroke-width=".8" opacity=".7"/>')
    s.a(f'<rect x="{x}" y="{y-d/2}" width="{L}" height="{d}" rx="{d/5:.1f}" fill="{fill}"/><rect x="{x}" y="{y-d/2+d*0.14:.1f}" width="{L}" height="{d*0.2:.1f}" fill="#fff" opacity=".28"/><ellipse cx="{x+L}" cy="{y}" rx="{d/6:.1f}" ry="{d/2}" fill="{fill}" stroke="#00000033"/>')
def carte(s,x,y,w,h): s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#f6f2ea" stroke="#e3dccf"/>')
def code(s,cx,y,txt,taille=46): s.a(f'<text x="{cx}" y="{y}" text-anchor="middle" font-size="{taille}" font-weight="800" fill="{INK}">{txt}</text>')

# ---------- 12.1 conducteur isolé ou câble
s=S("Conducteur isolé ou câble ?","Un conducteur isolé : une âme en cuivre entourée d'un isolant. Un câble : plusieurs conducteurs isolés réunis sous une gaine commune")
s.panneau(16,44,296,340); s.panneau(328,44,296,340)
s.t(164,72,"CONDUCTEUR ISOLÉ",14,True,AMB); s.t(476,72,"CÂBLE",14,True,BLUE)
fil(s,40,150,170,34,RED,66,19)
s.a(f'<path d="M244 140 V112" stroke="{INK}" stroke-width="1.6"/><circle cx="244" cy="141" r="3" fill="{INK}"/><path d="M120 167 V196" stroke="{INK}" stroke-width="1.6"/><circle cx="120" cy="166" r="3" fill="{INK}"/>')
s.t(214,106,"l'âme en cuivre",12,True); s.t(120,216,"+ son isolant",12,True)
s.t(164,300,"un seul conducteur",13,True)
s.t(164,340,"toujours sous conduit",11.5,False,GR); s.t(164,360,"ou goulotte",11.5,False,GR)
# câble : gaine + trois conducteurs
for dy,c in ((-34,RED),(0,BLEU),(34,"vj")):
    s.a(f'<path d="M470 150 C500 150 500 {150+dy} 524 {150+dy}" fill="none" stroke="{"url(#vj)" if c=="vj" else c}" stroke-width="15"/>')
    fil(s,520,150+dy,40,15,c,30,8)
s.a('<g filter="url(#ombre)"><rect x="344" y="118" width="134" height="64" rx="12" fill="#dfe2e6" stroke="#aab1b9"/></g><rect x="344" y="128" width="134" height="12" fill="#fff" opacity=".45"/><ellipse cx="478" cy="150" rx="9" ry="32" fill="#c3c8ce" stroke="#aab1b9"/>')
s.a(f'<path d="M410 184 V208" stroke="{INK}" stroke-width="1.6"/><circle cx="410" cy="183" r="3" fill="{INK}"/>')
s.t(410,228,"la gaine",12,True)
s.t(476,300,"plusieurs conducteurs",13,True); s.t(476,324,"sous une gaine commune",12.5)
s.ecrire("c12-anatomie.svg")

# ---------- 12.2 l'âme
s=S("Trois types d'âme","Trois types d'âme : rigide massive, un seul brin, lettre U ; rigide câblée, plusieurs gros brins, lettre R ; souple, de nombreux brins fins, lettre K")
import math as _m
def coupe(s,cx,cy,points,r):
    s.a(f'<circle cx="{cx}" cy="{cy}" r="46" fill="{RED}"/><circle cx="{cx}" cy="{cy}" r="46" fill="none" stroke="#a81d1d" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="33" fill="#5a2a12"/>')
    for (dx,dy) in points:
        s.a(f'<circle cx="{cx+dx:.1f}" cy="{cy+dy:.1f}" r="{r}" fill="#e9a25f" stroke="#8f4f17" stroke-width=".8"/>')
hexa=[(0,0)]+[(21*_m.cos(k*_m.pi/3),21*_m.sin(k*_m.pi/3)) for k in range(6)]
fins=[(0,0)]+[(9*_m.cos(k*_m.pi/3),9*_m.sin(k*_m.pi/3)) for k in range(6)]+[(18*_m.cos(k*_m.pi/6),18*_m.sin(k*_m.pi/6)) for k in range(12)]+[(27*_m.cos(k*_m.pi/9+.17),27*_m.sin(k*_m.pi/9+.17)) for k in range(18)]
for cx,lettre,pts,r,brins,l1,l2 in ((110,"U",[(0,0)],32,0,"rigide massive","un seul brin"),(320,"R",hexa,10.5,6,"rigide câblée","quelques gros brins"),(530,"K",fins,4,13,"souple","nombreux brins fins")):
    s.a(f'<rect x="{cx-24}" y="46" width="48" height="40" rx="10" fill="{INK}"/><text x="{cx}" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">{lettre}</text>')
    coupe(s,cx,146,pts,r)
    fil(s,cx-78,226,96,30,RED,56,17,brins)
    s.t(cx,280,l1,13,True); s.t(cx,303,l2,12,False,GR)
s.a(f'<rect x="30" y="330" width="580" height="50" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,351,"Même section, même courant admis :",12,True); s.t(320,372,"seule la souplesse change",12,True)
s.ecrire("c12-ame.svg")

# ---------- 12.3 H07V-U
s=S("Lire une désignation : H07V-U","Lire H07V-U : H pour harmonisé, 07 pour une tension de 450/750 V, V pour un isolant en PVC, U pour une âme rigide massive")
fil(s,60,78,440,36,RED,70,20)
for x in (150,360):
    s.a(f'<text x="{x}" y="85" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" letter-spacing="2">H07V-U</text>')
for i,(c,cat,l1,l2) in enumerate((("H","NORME","harmonisée","européenne"),("07","TENSION","450 / 750 V",""),("V","ISOLANT","PVC",""),("U","ÂME","rigide","massive"))):
    x=22+152*i; cx=x+70
    carte(s,x,122,140,216); code(s,cx,182,c)
    s.a(f'<path d="M{cx} 104 V120" stroke="{INK}" stroke-width="2"/>')
    s.t(cx,222,cat,12.5,True,AMB); s.t(cx,256,l1,12,True if not l2 else False,INK)
    if l2: s.t(cx,279,l2,12)
s.t(320,374,"Le fil rigide des tableaux et des conduits",13,True)
s.ecrire("c12-h07vu.svg")

# ---------- 12.4 3G2,5
s=S("Lire un câble : 3G2,5","Lire 3G2,5 : 3 conducteurs, G signifie que l'un d'eux est le vert-jaune, 2,5 est la section en millimètres carrés")
for dy,c in ((-22,RED),(0,BLEU),(22,"vj")):
    s.a(f'<path d="M402 78 C432 78 432 {78+dy} 452 {78+dy}" fill="none" stroke="{"url(#vj)" if c=="vj" else c}" stroke-width="13"/>')
    fil(s,448,78+dy,56,13,c,36,7)
s.a('<g filter="url(#ombre)"><rect x="70" y="52" width="340" height="52" rx="10" fill="#dfe2e6" stroke="#aab1b9"/></g><rect x="70" y="60" width="340" height="10" fill="#fff" opacity=".45"/><ellipse cx="410" cy="78" rx="8" ry="26" fill="#c3c8ce" stroke="#aab1b9"/>')
s.a(f'<text x="230" y="86" text-anchor="middle" font-size="20" font-weight="800" fill="{INK}" letter-spacing="2">3G2,5</text>')
for i,(c,cat,l1,l2) in enumerate((("3","NOMBRE","de conducteurs","dans le câble"),("G","TERRE","avec un","vert/jaune"),("2,5","SECTION","en mm²","de chaque âme"))):
    x=24+202*i; cx=x+94
    carte(s,x,124,188,190); code(s,cx,182,c)
    s.t(cx,220,cat,12.5,True,AMB); s.t(cx,252,l1,12); s.t(cx,275,l2,12,i==1,GRN if i==1 else INK)
s.a(f'<rect x="30" y="328" width="580" height="50" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,349,"5G1,5 : 5 conducteurs dont le vert/jaune,",12,True); s.t(320,370,"en 1,5 mm²",12,True)
s.ecrire("c12-3g25.svg")

# ---------- 12.5 couleurs
s=S("Les couleurs ne se choisissent pas au hasard","Couleurs des conducteurs : phase en rouge, marron ou noir ; neutre toujours en bleu clair ; conducteur de protection toujours en vert-jaune")
for r,(titre,coul,l1,l2,fils) in enumerate((("PHASE",RED,"rouge, marron ou noir","toute couleur sauf bleu clair et vert/jaune",(RED,MARRON,NOIR)),("NEUTRE",BLUE,"bleu clair","couleur réservée au neutre",(BLEU,)),("PROTECTION",GRN,"vert/jaune","couleur réservée à la terre",("vj",)))):
    y=48+r*94; carte(s,16,y,608,84)
    if len(fils)==3:
        for i,c in enumerate(fils): fil(s,34,y+20+i*22,120,17,c,34,9)
    else: fil(s,34,y+42,120,26,fils[0],34,14)
    s.t(214,y+28,titre,13,True,coul,"start"); s.t(214,y+51,l1,12.5,True,INK,"start"); s.t(214,y+72,l2,10.5,False,GR,"start")
s.a(f'<rect x="30" y="338" width="580" height="46" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,367,"Bleu clair et vert/jaune : jamais pour autre chose",12,True)
s.ecrire("c12-couleurs.svg")

# ---------- 12.6 sections
s=S("Trois sections à connaître par cœur","Sections courantes : 1,5 mm² pour l'éclairage, disjoncteur 16 A au plus ; 2,5 mm² pour les prises, 20 A au plus ; 6 mm² pour la plaque de cuisson, 32 A au plus")
for cx,sec,usage,cal,d in ((110,"1,5 mm²","éclairage","16 A maximum",11),(320,"2,5 mm²","prises de courant","20 A maximum",14),(530,"6 mm²","plaque de cuisson","32 A maximum",22)):
    carte(s,cx-98,44,196,286)
    if cx==110:   # ampoule
        s.a(f'<circle cx="{cx}" cy="84" r="24" fill="#fff1c2" stroke="{YEL}" stroke-width="2.5"/><path d="M{cx-8} 92 q4 -12 8 0 q4 12 8 0" fill="none" stroke="#e8590c" stroke-width="2"/><rect x="{cx-11}" y="106" width="22" height="16" rx="3" fill="url(#acierH)" stroke="#7d858e"/>')
    elif cx==320: # prise
        s.a(f'<rect x="{cx-30}" y="58" width="60" height="60" rx="8" fill="url(#nez)" stroke="#b3b9c0"/><circle cx="{cx}" cy="88" r="22" fill="#e4e7ea" stroke="#b3b9c0"/><circle cx="{cx-9}" cy="90" r="3.6" fill="#1f2428"/><circle cx="{cx+9}" cy="90" r="3.6" fill="#1f2428"/><rect x="{cx-2.5}" y="71" width="5" height="10" rx="2.5" fill="#c9a03a"/>')
    else:         # plaque de cuisson
        s.a(f'<rect x="{cx-40}" y="58" width="80" height="62" rx="6" fill="#23272c" stroke="#000"/>'+"".join(f'<circle cx="{cx+dx}" cy="{89+dy}" r="{rr}" fill="none" stroke="#d9480f" stroke-width="2"/>' for dx,dy,rr in ((-19,-13,11),(19,-13,9),(-19,14,9),(19,14,11))))
    g=d+10
    s.a(f'<g filter="url(#ombre)"><rect x="{cx-g/2}" y="178" width="{g}" height="62" fill="url(#gaineV)"/></g><ellipse cx="{cx}" cy="178" rx="{g/2}" ry="{g/7:.1f}" fill="#f06a6a" stroke="#a81d1d" stroke-width=".8"/>'
        f'<rect x="{cx-d/2}" y="140" width="{d}" height="38" fill="url(#cuivreV)"/><ellipse cx="{cx}" cy="178" rx="{d/2}" ry="{d/7:.1f}" fill="#9a5a1f"/><ellipse cx="{cx}" cy="140" rx="{d/2}" ry="{d/7:.1f}" fill="#f3c592" stroke="#8f4f17" stroke-width=".8"/>')
    s.t(cx,270,sec,15,True); s.t(cx,294,usage,12); s.t(cx,317,cal,12,True,AMB)
s.t(320,366,"Plus le courant est fort, plus la section est grosse",13,True)
s.ecrire("c12-sections.svg")

# ---------- 12.7 chute de tension
s=S("La chute de tension : attention aux longueurs","La chute de tension : plus la ligne est longue et le fil fin, plus la tension baisse à l'arrivée. Limites : 3 % pour l'éclairage, 5 % pour les autres usages")
coffret(s,24,62,104,120)
rail(s,32,84,88,0.3); idiff(s,36,84,0.3,"40 A","AC",False)
for i in range(2): disj(s,36+42+i*21,84,0.3,"C10",None,True,False)
s.t(76,208,"230 V",15,True)
for y,c in ((116,RED),(126,BLEU)):
    s.a(f'<path d="M128 {y} H180 q14 0 14 14 v14 q0 14 14 14 H430 q14 0 14 -14 v-14 q0 -14 14 -14 H520" fill="none" stroke="{c}" stroke-width="4"/>')
s.a(f'<path d="M150 196 H500" stroke="{GR}" stroke-width="1.6"/><polygon points="150,191 140,196 150,201" fill="{GR}"/><polygon points="500,191 510,196 500,201" fill="{GR}"/>')
s.t(326,222,"longue ligne, fil trop fin",12,False,GR)
s.a(f'<circle cx="556" cy="112" r="30" fill="#fff6d6" stroke="#e0c25a" stroke-width="2.5"/><path d="M546 122 q5 -16 10 0 q5 16 10 0" fill="none" stroke="#b9882a" stroke-width="2"/><rect x="544" y="140" width="24" height="18" rx="3" fill="url(#acierH)" stroke="#7d858e"/>')
s.t(556,208,"moins",15,True,AMB)
carte(s,30,246,280,84); carte(s,330,246,280,84)
s.t(170,278,"ÉCLAIRAGE",13,True,AMB); s.t(170,310,"3 % au maximum",15,True)
s.t(470,278,"AUTRES USAGES",13,True,AMB); s.t(470,310,"5 % au maximum",15,True)
s.t(320,372,"Ligne très longue : on passe à la section supérieure",12.5,True)
s.ecrire("c12-chute.svg")
print("module 12 : 7 images")

# =====================================================================
# MODULE 13 — conduits et modes de pose
# =====================================================================
def annele(s,x,y,L,d,grad="icta",pas=9):
    for i in range(int(L/pas)):
        s.a(f'<rect x="{x+i*pas}" y="{y-d/2}" width="{pas-1.3}" height="{d}" rx="3" fill="url(#{grad})" stroke="#00000022"/>')
def annele_arc(s,cx,cy,R,a0,a1,d,grad="icta",pas=9):
    n=int(abs(a1-a0)*math.pi/180*R/pas)
    for i in range(n+1):
        a=a0+(a1-a0)*i/n; px=cx+R*math.cos(math.radians(a)); py=cy+R*math.sin(math.radians(a))
        s.a(f'<rect x="{-(pas-1.3)/2}" y="{-d/2}" width="{pas-1.3}" height="{d}" rx="3" fill="url(#{grad})" stroke="#00000022" transform="translate({px:.1f} {py:.1f}) rotate({a-90:.1f})"/>')
def lisse(s,x,y,L,d):
    s.a(f'<rect x="{x}" y="{y-d/2}" width="{L}" height="{d}" rx="2" fill="url(#irl)" stroke="#7d858e"/>')
def collier(s,x,y,d):
    s.a(f'<rect x="{x-7}" y="{y-d/2-5}" width="14" height="{d+10}" rx="4" fill="#5b6673"/><rect x="{x-12}" y="{y+d/2+3}" width="24" height="7" rx="2" fill="#5b6673"/><circle cx="{x}" cy="{y+d/2+6.5}" r="2.4" fill="#e8eaed"/>')
def fleche(s,x1,y,x2,c=INK):
    sg=1 if x2>x1 else -1
    s.a(f'<path d="M{x1} {y} H{x2-sg*8}" stroke="{c}" stroke-width="3"/><polygon points="{x2-sg*10},{y-6} {x2},{y} {x2-sg*10},{y+6}" fill="{c}"/>')

# ---------- 13.1 à quoi sert un conduit
s=S("Un conduit : deux rôles","Un conduit a deux rôles : protéger mécaniquement les conducteurs, et permettre de les remplacer sans casser le mur")
s.panneau(16,44,296,296); s.panneau(328,44,296,296)
s.t(164,72,"PROTÉGER",15,True,AMB); s.t(476,72,"REMPLACER",15,True,BLUE)
for dy,c in ((-12,RED),(0,BLEU),(12,"vj")): fil(s,214,162+dy,44,9,c,20,5)
annele(s,36,162,186,40)
s.a('<g transform="translate(150 132) rotate(38)"><rect x="-5" y="-46" width="10" height="40" rx="3" fill="#8a5a2b" stroke="#5e3b17"/><rect x="-16" y="-8" width="32" height="16" rx="3" fill="url(#acierH)" stroke="#6b7078"/></g>')
s.a(f'<polygon points="{etoile(132,140,13,5,8,.2)}" fill="{YEL}" stroke="#e8590c" stroke-width="1.5"/>')
s.t(164,222,"les conducteurs isolés",12,True); s.t(164,243,"n'ont que leur isolant",12)
s.t(164,281,"le conduit encaisse",12,True); s.t(164,302,"les chocs et les frottements",11.5)
# remplacer : un fil sort, un autre entre
fil(s,560,150,36,10,MARRON,14,5); annele(s,376,150,186,40)
s.a(f'<rect x="340" y="145" width="40" height="10" rx="3" fill="{RED}"/>')
fleche(s,340,122,376,RED); fleche(s,566,122,606,MARRON)
s.t(360,110,"neuf",11,True,RED); s.t(586,110,"usé",11,True,MARRON)
s.t(476,222,"un fil abîmé ou trop fin",12,True); s.t(476,243,"doit pouvoir être retiré",12)
s.t(476,281,"on le tire et on en repasse",12,True); s.t(476,302,"un autre, sans casser le mur",11.5)
s.a(f'<rect x="24" y="350" width="592" height="40" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,376,"Des conducteurs isolés ne se posent jamais sans protection",11.5,True)
s.ecrire("c13-role.svg")

# ---------- 13.2 ICTA
s=S("Le conduit ICTA, lettre par lettre","ICTA : Isolant, Cintrable, Transversalement élastique, Annelé. La gaine annelée que l'on encastre dans les murs et les dalles")
for dy,c in ((-10,RED),(0,BLEU),(10,"vj")): fil(s,548,80+dy,40,8,c,18,4.5)
annele(s,40,80,512,38)
for i,(c,cat,l1,l2) in enumerate((("I","ISOLANT","en matière","plastique"),("C","CINTRABLE","se courbe","à la main"),("T","TRANSV.","reprend sa forme","après écrasement"),("A","ANNELÉ","paroi","en anneaux"))):
    x=22+152*i; cx=x+70
    carte(s,x,118,140,206); code(s,cx,176,c)
    s.t(cx,214,cat,12.5,True,AMB); s.t(cx,248,l1,10.5); s.t(cx,270,l2,10.5)
s.a(f'<rect x="24" y="336" width="592" height="52" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,358,"La « gaine annelée » des murs,",12,True); s.t(320,379,"des cloisons et des dalles",12,True)
s.ecrire("c13-icta.svg")

# ---------- 13.3 tiers et rayon de cintrage
s=S("Remplissage et cintrage","Deux règles pour l'ICTA : les conducteurs occupent au plus un tiers de la section intérieure du conduit ; le rayon de cintrage vaut au moins six fois le diamètre du conduit",640,370)
s.panneau(16,44,296,310); s.panneau(328,44,296,310)
s.t(164,72,"REMPLISSAGE",15,True,AMB); s.t(476,72,"CINTRAGE",15,True,BLUE)
s.a('<circle cx="164" cy="176" r="78" fill="url(#icta)" stroke="#6b727a" stroke-width="2"/><circle cx="164" cy="176" r="63" fill="#fbfbfc" stroke="#6b727a"/>')
for cx,cy,c in ((143,216,RED),(185,216,BLEU),(164,180,"url(#vj)")):
    s.a(f'<circle cx="{cx}" cy="{cy}" r="20" fill="{c}" stroke="#00000033"/><circle cx="{cx}" cy="{cy}" r="10" fill="#e9a25f" stroke="#8f4f17"/>')
s.t(164,292,"1/3 maximum",15,True); s.t(164,316,"de la section intérieure",12,False,GR)
# cintrage : R = 6 x diamètre (dessiné à l'échelle)
annele(s,344,128,60,18,"icta",8); annele_arc(s,404,236,108,-90,0,18,"icta",8)
for i in range(4): s.a(f'<rect x="503" y="{240+i*8}" width="18" height="6.7" rx="3" fill="url(#icta)" stroke="#00000022" transform="rotate(0)"/>')
s.a(f'<path d="M404 236 L{404+108*math.cos(math.radians(-45)):.1f} {236+108*math.sin(math.radians(-45)):.1f}" stroke="{BLUE}" stroke-width="2.5"/><circle cx="404" cy="236" r="4" fill="{BLUE}"/>')
s.a(f'<text x="428" y="196" font-size="22" font-weight="800" fill="{BLUE}">R</text>')
s.t(476,300,"R ≥ 6 × diamètre",14,True); s.t(476,326,"ICTA 20 → 120 mm",12.5,True,BLUE)
s.ecrire("c13-tiers.svg")

# ---------- 13.4 IRL
s=S("Le conduit IRL, lettre par lettre","IRL : Isolant, Rigide, Lisse. Le tube rigide de la pose apparente, fixé par des colliers")
lisse(s,40,78,470,26); collier(s,150,78,26); collier(s,400,78,26)
s.a('<path d="M510 65 H536 a26 26 0 0 1 26 26 V112 H536 V96 a5 5 0 0 0 -5 -5 H510 Z" fill="url(#irl)" stroke="#7d858e"/>')
for i,(c,cat,l1,l2) in enumerate((("I","ISOLANT","en matière","plastique"),("R","RIGIDE","ne se courbe pas","à la main"),("L","LISSE","paroi","sans anneaux"))):
    x=24+202*i; cx=x+94
    carte(s,x,124,188,196); code(s,cx,182,c)
    s.t(cx,220,cat,12.5,True,AMB); s.t(cx,254,l1,12); s.t(cx,277,l2,12)
s.a(f'<rect x="24" y="334" width="592" height="52" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,356,"Le tube de la pose apparente :",12,True); s.t(320,377,"garage, cave, atelier",12,True)
s.ecrire("c13-irl.svg")

# ---------- 13.5 TPC enterré (coupe du sol, à l'échelle : 1 cm = 3,8 px)
s=S("Le TPC : la canalisation enterrée","Canalisation enterrée : le conduit TPC rouge est posé à 50 cm de profondeur au moins, 85 cm sous une voie accessible aux véhicules, avec un grillage avertisseur rouge 20 cm au-dessus",640,410)
s.a('<rect x="30" y="74" width="580" height="250" rx="6" fill="url(#terre)"/><rect x="30" y="66" width="580" height="12" rx="4" fill="#4f9a3a"/>')
for i in range(29): s.a(f'<path d="M{40+i*20} 66 l-3 -9 M{46+i*20} 66 l2 -11 M{52+i*20} 66 l5 -8" stroke="#4f9a3a" stroke-width="2" stroke-linecap="round"/>')
for i in range(40): s.a(f'<circle cx="{44+(i*97)%560}" cy="{92+(i*53)%220}" r="{1.5+(i%3)}" fill="#8f6f45" opacity=".5"/>')
# grillage avertisseur : 20 cm au-dessus du conduit
s.a(f'<rect x="60" y="184" width="380" height="9" fill="{RED}" opacity=".9"/>')
for i in range(38): s.a(f'<rect x="{62+i*10}" y="186" width="5" height="5" fill="url(#terre)"/>')
annele(s,60,277,380,26,"tpc")
s.t(250,176,"grillage avertisseur rouge",11.5,True,"#8e1414"); s.t(250,316,"TPC rouge · courant fort",11.5,True,"#8e1414")
s.t(44,100,"sol",11.5,True,INK,"start")
# cotes
def cote(x,y1,y2,l1,l2):
    s.a(f'<path d="M{x} {y1} V{y2}" stroke="{INK}" stroke-width="2"/><path d="M{x-7} {y1} h14 M{x-7} {y2} h14" stroke="{INK}" stroke-width="2"/>')
    s.t(x+12,(y1+y2)/2+1,l1,13,True,INK,"start")
    if l2: s.t(x+12,(y1+y2)/2+22,l2,11,False,INK,"start")
cote(548,76,264,"50 cm","au moins"); cote(456,188,264,"20 cm","")
s.a(f'<rect x="24" y="340" width="592" height="52" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,362,"85 cm au moins sous une voie",12,True); s.t(320,383,"accessible aux véhicules",12,True)
s.ecrire("c13-tpc.svg")

# ---------- 13.6 trois façons d'encastrer
s=S("Trois façons d'encastrer","Trois méthodes d'encastrement : traditionnelle, les conduits passent par des boîtes de dérivation ; pieuvre, les conduits rayonnent depuis une boîte centrale ; tableau, chaque circuit repart directement du tableau")
def tab(x,y): s.a(f'<rect x="{x}" y="{y}" width="26" height="36" rx="3" fill="#fff" stroke="#7d858e" stroke-width="1.5"/><rect x="{x+4}" y="{y+8}" width="18" height="5" fill="#3a3f46"/><rect x="{x+4}" y="{y+20}" width="18" height="5" fill="#3a3f46"/>')
def boite(x,y): s.a(f'<rect x="{x-9}" y="{y-9}" width="18" height="18" rx="3" fill="#e8eaed" stroke="#5b6673" stroke-width="2"/>')
def point(x,y): s.a(f'<circle cx="{x}" cy="{y}" r="8" fill="#fff" stroke="{INK}" stroke-width="2"/><circle cx="{x-3}" cy="{y}" r="1.6" fill="{INK}"/><circle cx="{x+3}" cy="{y}" r="1.6" fill="{INK}"/>')
def gaine(d): s.a(f'<path d="{d}" fill="none" stroke="#7d858e" stroke-width="6" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="#dfe3e7" stroke-width="3.5" stroke-dasharray="4 3" stroke-linejoin="round"/>')
for i,(nom,l1,l2) in enumerate((("TRADITIONNELLE","de boîte en boîte,","dans des saignées"),("PIEUVRE","une boîte centrale,","des conduits en étoile"),("TABLEAU","chaque circuit part","droit du tableau"))):
    x=24+202*i; cx=x+94
    carte(s,x,44,188,286); s.t(cx,70,nom,12.5,True,AMB)
    s.a(f'<rect x="{x+12}" y="84" width="164" height="150" rx="6" fill="#fff" stroke="#d5d9de"/>')
    pts=[(x+70,212),(x+118,212),(x+158,212)]
    if i==0:
        gaine(f"M{x+33} 180 V104 H{x+158}"); 
        for (px,py) in pts: gaine(f"M{px} 104 V{py-8}")
        for (px,py) in pts: boite(px,104)
    elif i==1:
        gaine(f"M{x+33} 180 V140 L{x+104} 110")
        for (px,py) in pts: gaine(f"M{x+104} 110 L{px} {py-8}")
        boite(x+104,110)
    else:
        for k,(px,py) in enumerate(pts): gaine(f"M{x+27+k*6} 180 V{100+k*12} H{px} V{py-8}")
    tab(x+20,180)
    for (px,py) in pts: point(px,py)
    s.t(cx,270,l1,11.5); s.t(cx,294,l2,11.5)
s.a(f'<rect x="24" y="340" width="592" height="50" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,361,"Dans tous les cas : des tracés droits,",12,True); s.t(320,382,"horizontaux ou verticaux",12,True)
s.ecrire("c13-encastre.svg")

# ---------- 13.7 choisir selon la pose
s=S("À chaque pose son conduit","Choisir le conduit selon la pose : encastré, ICTA ; apparent, IRL ou goulotte ; enterré, TPC rouge")
for r,(titre,val,desc) in enumerate((("ENCASTRÉ","ICTA","dans les murs, les cloisons, les dalles"),("APPARENT","IRL ou goulotte","garage, cave, rénovation"),("ENTERRÉ","TPC rouge","dans une tranchée, avec grillage avertisseur"))):
    y=48+r*94; carte(s,16,y,608,84)
    if r==0: annele(s,34,y+42,162,30)
    elif r==1: lisse(s,34,y+38,162,24); collier(s,76,y+38,24); collier(s,156,y+38,24)
    else: annele(s,34,y+42,162,30,"tpc")
    s.t(214,y+28,titre,13,True,AMB,"start"); s.t(214,y+52,val,13.5,True,INK,"start"); s.t(214,y+73,desc,10.5,False,GR,"start")
s.a(f'<rect x="30" y="338" width="580" height="46" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
s.t(320,367,"Le conduit se choisit avant le fil",13,True)
s.ecrire("c13-choix.svg")
print("module 13 : 7 images")

# =====================================================================
# MODULE 14 — GTL et circuits du logement
# =====================================================================
def ampoule(s,cx,cy,r=20):
    s.a(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff1c2" stroke="{YEL}" stroke-width="2.5"/><path d="M{cx-r*.35:.1f} {cy+r*.3:.1f} q{r*.17:.1f} -{r*.5:.1f} {r*.35:.1f} 0 q{r*.17:.1f} {r*.5:.1f} {r*.35:.1f} 0" fill="none" stroke="#e8590c" stroke-width="2"/><rect x="{cx-r*.45:.1f}" y="{cy+r*.9:.1f}" width="{r*.9:.1f}" height="{r*.65:.1f}" rx="3" fill="url(#acierH)" stroke="#7d858e"/>')
def prise_ic(s,cx,cy,t=30):
    s.a(f'<rect x="{cx-t/2}" y="{cy-t/2}" width="{t}" height="{t}" rx="{t/7:.1f}" fill="url(#nez)" stroke="#b3b9c0"/><circle cx="{cx}" cy="{cy}" r="{t*.37:.1f}" fill="#e4e7ea" stroke="#b3b9c0"/><circle cx="{cx-t*.15:.1f}" cy="{cy+t*.04:.1f}" r="{t*.06:.1f}" fill="#1f2428"/><circle cx="{cx+t*.15:.1f}" cy="{cy+t*.04:.1f}" r="{t*.06:.1f}" fill="#1f2428"/><rect x="{cx-t*.04:.1f}" y="{cy-t*.28:.1f}" width="{t*.08:.1f}" height="{t*.17:.1f}" rx="1.5" fill="#c9a03a"/>')
def plaque_ic(s,cx,cy,w=64):
    h=w*.78
    s.a(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="5" fill="#23272c" stroke="#000"/>'+"".join(f'<circle cx="{cx+dx*w:.1f}" cy="{cy+dy*h:.1f}" r="{rr*w:.1f}" fill="none" stroke="#d9480f" stroke-width="2"/>' for dx,dy,rr in ((-.24,-.21,.14),(.24,-.21,.11),(-.24,.23,.11),(.24,.23,.14))))
def lavelinge_ic(s,cx,cy,w=52):
    h=w*1.2
    s.a(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="5" fill="url(#nez)" stroke="#aab1b9"/><rect x="{cx-w/2+4}" y="{cy-h/2+4}" width="{w-8}" height="9" rx="2" fill="#d5d9de"/><circle cx="{cx+w/2-10}" cy="{cy-h/2+8.5}" r="3" fill="#5b6673"/><circle cx="{cx}" cy="{cy+6}" r="{w*.32:.1f}" fill="#cfe3f7" stroke="#7d858e" stroke-width="3"/>')
def vmc_ic(s,cx,cy,w=56):
    s.a(f'<rect x="{cx-w/2}" y="{cy-w/2}" width="{w}" height="{w}" rx="8" fill="url(#nez)" stroke="#aab1b9"/><circle cx="{cx}" cy="{cy}" r="{w*.36:.1f}" fill="#eef0f2" stroke="#7d858e" stroke-width="2"/>'+"".join(f'<ellipse cx="{cx}" cy="{cy-w*.17:.1f}" rx="{w*.08:.1f}" ry="{w*.17:.1f}" fill="#7d858e" transform="rotate({a} {cx} {cy})"/>' for a in (0,72,144,216,288))+f'<circle cx="{cx}" cy="{cy}" r="4" fill="#3a3f46"/>')
def linky(s,x,y,w,h):
    s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{w*.1:.1f}" fill="#c5d93a" stroke="#93a51f"/><rect x="{x+w*.14:.1f}" y="{y+h*.14:.1f}" width="{w*.72:.1f}" height="{h*.24:.1f}" rx="3" fill="#1f3a2a"/><circle cx="{x+w*.32:.1f}" cy="{y+h*.56:.1f}" r="{w*.08:.1f}" fill="#93a51f"/><circle cx="{x+w*.68:.1f}" cy="{y+h*.56:.1f}" r="{w*.08:.1f}" fill="#93a51f"/><rect x="{x+w*.14:.1f}" y="{y+h*.72:.1f}" width="{w*.72:.1f}" height="{h*.18:.1f}" rx="3" fill="#b3c62c"/>')
def bande(s,y,h,lignes,taille=12):
    s.a(f'<rect x="24" y="{y}" width="592" height="{h}" rx="12" fill="#fff1c2" stroke="{YEL}"/>')
    for i,l in enumerate(lignes): s.t(320,y+(h-21*(len(lignes)-1))/2+6+21*i,l,taille,True)

# ---------- 14.1 la GTL
s=S("Tout au même endroit : l'ETEL","L'espace technique électrique du logement regroupe le panneau de contrôle avec le compteur et l'AGCP, le tableau de répartition et le tableau de communication")
s.a('<rect x="24" y="44" width="592" height="8" fill="#d5d9de"/><rect x="24" y="336" width="592" height="8" fill="#b9bfc6"/>')
s.a('<g filter="url(#ombre)"><rect x="96" y="52" width="150" height="284" fill="#f4f5f7" stroke="#c5cad0"/></g>')
# panneau de contrôle
s.a('<rect x="108" y="64" width="126" height="84" rx="6" fill="#fff" stroke="#b3b9c0"/>'); linky(s,116,72,48,68)
s.a('<rect x="174" y="76" width="50" height="60" rx="5" fill="url(#corps)" stroke="#b3b9c0"/><rect x="188" y="88" width="22" height="26" rx="4" fill="url(#manette)"/><rect x="214" y="80" width="8" height="7" rx="2" fill="#f2a20c"/>')
# tableau de répartition
s.a('<rect x="108" y="158" width="126" height="92" rx="6" fill="#fff" stroke="#b3b9c0"/>')
for r in range(2):
    y=166+r*40; rail(s,112,y,118,0.15)
    idiff(s,114,y,0.15,"40 A","AC",False)
    for i in range(8): disj(s,135+i*10.5,y,0.15,"",None,True,False)
# tableau de communication
s.a('<rect x="108" y="260" width="126" height="64" rx="6" fill="#fff" stroke="#b3b9c0"/><rect x="118" y="272" width="106" height="18" rx="3" fill="#3a3f46"/>')
for i in range(8): s.a(f'<rect x="{122+i*12.6:.1f}" y="276" width="9" height="10" rx="1.5" fill="#9bd0ff"/>')
s.a('<rect x="118" y="298" width="50" height="16" rx="3" fill="#e4e7ea" stroke="#aab1b9"/><circle cx="126" cy="306" r="2.5" fill="#1e9e5a"/><circle cx="134" cy="306" r="2.5" fill="#1e9e5a"/>')
for y,t1,t2 in ((106,"panneau de contrôle","le compteur et l'AGCP"),(204,"tableau de répartition","les protections des circuits"),(292,"tableau de communication","téléphone, internet, télévision")):
    s.a(f'<path d="M236 {y} H280" stroke="{INK}" stroke-width="1.8"/><circle cx="236" cy="{y}" r="3" fill="{INK}"/>')
    s.t(288,y-3,t1,12.5,True,INK,"start"); s.t(288,y+18,t2,10.5,False,GR,"start")
s.t(60,200,"ETEL",12,True,AMB); 
bande(s,352,38,["Courant fort et communication, réunis"],12.5)
s.ecrire("c14-gtl.svg")

# ---------- 14.2 dimensions et distances de l'ETEL
s=S("L'ETEL : ses dimensions, ses distances","Dimensions de l'ETEL : 60 cm de large, 25 cm de profondeur, du sol au plafond. Distances à respecter : 10 cm d'une canalisation de gaz, 40 cm d'une source de chaleur, 60 cm d'un point d'eau")
s.panneau(16,44,296,340); s.panneau(328,44,296,340)
# colonne en volume
s.a('<rect x="24" y="74" width="280" height="6" fill="#c5cad0"/><rect x="24" y="334" width="280" height="6" fill="#aab1b9"/>')
s.a('<polygon points="262,80 282,70 282,324 262,334" fill="#cfd4da" stroke="#aab1b9"/><g filter="url(#ombre)"><rect x="182" y="80" width="80" height="254" fill="#f7f8f9" stroke="#b3b9c0"/></g>')
s.a('<rect x="192" y="96" width="60" height="44" rx="4" fill="#fff" stroke="#b3b9c0"/><rect x="192" y="150" width="60" height="50" rx="4" fill="#fff" stroke="#b3b9c0"/><rect x="192" y="210" width="60" height="34" rx="4" fill="#fff" stroke="#b3b9c0"/>')
s.a(f'<path d="M182 62 H262" stroke="{AMB}" stroke-width="2.5"/><path d="M182 56 v12 M262 56 v12" stroke="{AMB}" stroke-width="2.5"/>')
s.a(f'<path d="M266 64 L284 55" stroke="{BLUE}" stroke-width="2.5"/><path d="M263 59 l6 10 M281 50 l6 10" stroke="{BLUE}" stroke-width="2.5"/>')
s.a(f'<path d="M296 80 V334" stroke="{GRN}" stroke-width="2.5"/><path d="M290 80 h12 M290 334 h12" stroke="{GRN}" stroke-width="2.5"/>')
s.t(28,112,"60 cm",15,True,AMB,"start"); s.t(28,133,"de large",11,False,INK,"start"); s.t(28,152,"au minimum",11,False,GR,"start")
s.t(28,196,"25 cm",15,True,BLUE,"start"); s.t(28,217,"de profondeur",11,False,INK,"start"); s.t(28,236,"au minimum",11,False,GR,"start")
s.t(28,280,"toute",13,True,GRN,"start"); s.t(28,300,"la hauteur",13,True,GRN,"start"); s.t(28,321,"du sol au plafond",10.5,False,GR,"start")
s.t(476,72,"Et il se tient à distance de :",11.5,True)
# gaz
s.a('<rect x="346" y="118" width="62" height="12" rx="3" fill="#f2c200" stroke="#b08900"/><rect x="368" y="110" width="16" height="28" rx="3" fill="#d9a900" stroke="#b08900"/><rect x="362" y="100" width="28" height="8" rx="3" fill="#d92b2b"/>')
# radiateur
for i in range(6): s.a(f'<rect x="{348+i*10}" y="192" width="8" height="50" rx="3" fill="url(#nez)" stroke="#aab1b9"/>')
for i in range(3): s.a(f'<path d="M{358+i*18} 188 q4 -6 0 -11 q-4 -6 0 -10" fill="none" stroke="#e8590c" stroke-width="2" stroke-linecap="round"/>')
# robinet
s.a('<path d="M352 300 H386 a10 10 0 0 1 10 10 V322" fill="none" stroke="url(#acierH)" stroke-width="10"/><path d="M352 300 H386 a10 10 0 0 1 10 10 V322" fill="none" stroke="#7d858e" stroke-width="1"/><rect x="364" y="284" width="6" height="14" fill="#7d858e"/><rect x="356" y="280" width="22" height="6" rx="3" fill="#5b6673"/><path d="M396 332 q-7 10 0 14 q7 -4 0 -14" fill="#3d9be9"/>')
for y,v,l in ((112,"10 cm","d'une canalisation de gaz"),(204,"40 cm","d'une source de chaleur"),(298,"60 cm","d'un point d'eau")):
    s.t(424,y+8,v,15,True,INK,"start"); s.t(424,y+30,l,10.5,False,GR,"start")
s.ecrire("c14-etel.svg")

# ---------- 14.3 hauteurs de pose (1 m = 133 px)
s=S("À quelle hauteur ? Il faut pouvoir l'atteindre","Hauteur des organes de manœuvre du panneau de contrôle : 1,80 m au maximum ; entre 0,90 m et 1,30 m quand l'accessibilité aux personnes à mobilité réduite est exigée",640,410)
SOL=336; H=lambda m: SOL-m*133
s.a(f'<rect x="96" y="{H(1.30):.0f}" width="230" height="{H(0.90)-H(1.30):.0f}" fill="#e3f5ea" stroke="{GRN}" stroke-dasharray="6 4"/>')
s.a(f'<rect x="24" y="{SOL}" width="592" height="8" fill="#b9bfc6"/>')
for m,lab in ((1.80,"1,80 m"),(1.30,"1,30 m"),(0.90,"0,90 m")):
    s.a(f'<path d="M92 {H(m):.0f} H326" stroke="{INK}" stroke-width="1.6" stroke-dasharray="{"0" if m==1.8 else "5 4"}"/>')
    s.t(86,H(m)+5,lab,11.5,True,INK,"end")
s.t(86,SOL+2,"sol",11,False,GR,"end")
s.a(f'<path d="M96 {SOL} V{H(1.8):.0f}" stroke="{INK}" stroke-width="2"/>')
# panneau de contrôle : la manette de l'AGCP sous 1,80 m
s.a('<g filter="url(#ombre)"><rect x="196" y="104" width="116" height="92" rx="6" fill="#fff" stroke="#b3b9c0"/></g>'); linky(s,204,112,44,72)
s.a('<rect x="258" y="116" width="46" height="64" rx="5" fill="url(#corps)" stroke="#b3b9c0"/><rect x="270" y="126" width="22" height="26" rx="4" fill="url(#manette)"/>')
# personne debout
s.a('<circle cx="146" cy="126" r="15" fill="#5b6673"/><path d="M124 150 q22 -10 44 0 v84 h-10 v96 h-10 v-90 h-4 v90 h-10 v-96 h-10 z" fill="#5b6673"/><path d="M166 156 L206 136" stroke="#5b6673" stroke-width="10" stroke-linecap="round"/>')
s.t(350,112,"1,80 m au maximum",13,True,INK,"start"); s.t(350,134,"dans tous les logements",11,False,GR,"start")
s.t(350,190,"0,90 m à 1,30 m",13,True,GRN,"start"); s.t(350,212,"accessibilité aux personnes",11,False,GR,"start"); s.t(350,231,"à mobilité réduite (PMR)",11,False,GR,"start")
bande(s,358,40,["Hauteur des organes de manœuvre, depuis le sol fini"],11.5)
s.ecrire("c14-hauteurs.svg")

# ---------- 14.4 circuit d'éclairage
s=S("Le circuit d'éclairage","Un circuit d'éclairage : conducteurs de 1,5 mm², disjoncteur de 16 A au maximum, 8 points lumineux au maximum ; au moins deux circuits dans un logement de plus de 35 m²",640,420)
for dy,c in ((0,RED),(6,BLEU)):
    s.a(f'<path d="M60 {150+dy} V{68+dy} H580" fill="none" stroke="{c}" stroke-width="3.5" stroke-linejoin="round"/>')
for i in range(8):
    cx=146+62*i
    s.a(f'<path d="M{cx-3} 70 V100" stroke="{RED}" stroke-width="3"/><path d="M{cx+3} 76 V100" stroke="{BLUE}" stroke-width="3"/>'); ampoule(s,cx,118,18)
    s.t(cx,172,str(i+1),11.5,True)
disj(s,34,84,0.5,"C16")
for i,(v,l1,l2) in enumerate((("1,5 mm²","la section","des conducteurs"),("16 A","le disjoncteur","au maximum"),("8 points","lumineux","par circuit, au plus"))):
    x=24+202*i; cx=x+94
    carte(s,x,214,188,96); s.t(cx,246,v,16,True); s.t(cx,270,l1,11); s.t(cx,291,l2,11)
bande(s,322,40,["Au moins 2 circuits au-delà de 35 m²"],12.5)
s.t(320,386,"Un circuit en panne ne doit pas plonger",10.5,False,GR); s.t(320,405,"tout le logement dans le noir",10.5,False,GR)
s.ecrire("c14-eclairage.svg")

# ---------- 14.5 circuits de prises
s=S("Les circuits de prises 16 A","Circuits de prises de courant : en 1,5 mm² avec un disjoncteur de 16 A, 8 prises au maximum ; en 2,5 mm² avec un disjoncteur de 20 A, 12 prises au maximum")
for px,sec,mq,cal,nb,rangs in ((16,"EN 1,5 mm²","C16","disjoncteur 16 A","8 prises",2),(328,"EN 2,5 mm²","C20","disjoncteur 20 A","12 prises",3)):
    s.panneau(px,44,296,268); s.t(px+148,72,sec,14,True,AMB)
    disj(s,px+22,92,0.42,mq)
    for r in range(rangs):
        for c in range(4): prise_ic(s,px+100+c*46,104+r*40,32)
    s.t(px+148,244,cal,12); s.t(px+148,272,nb,16,True); s.t(px+148,295,"au maximum",11,False,GR)
bande(s,324,58,["Cuisine : un circuit dédié de 6 prises,","dont 4 au-dessus du plan de travail"],12)
s.ecrire("c14-prises.svg")

# ---------- 14.6 circuits spécialisés
s=S("Les circuits spécialisés : un appareil, un circuit","Circuits spécialisés : plaque de cuisson en 6 mm² sous 32 A ; lave-linge, four, lave-vaisselle et chauffe-eau en 2,5 mm² sous 20 A chacun ; VMC en 1,5 mm² sous 2 A")
for r,(titre,val,desc,mq) in enumerate((("PLAQUE DE CUISSON","6 mm² · disjoncteur 32 A","","C32"),("LAVE-LINGE, FOUR…","2,5 mm² · disjoncteur 20 A","lave-vaisselle, sèche-linge, chauffe-eau","C20"),("VMC","1,5 mm² · disjoncteur 2 A","","C2"))):
    y=48+r*94; carte(s,16,y,608,84)
    if r==0: plaque_ic(s,70,y+42,72)
    elif r==1: lavelinge_ic(s,70,y+42,52)
    else: vmc_ic(s,70,y+42,58)
    s.a(f'<path d="M108 {y+42} H140" stroke="{RED}" stroke-width="{(7,5,3.5)[r]}"/>')
    disj(s,140,y+7,0.29,mq,None,True,False)
    dy=0 if desc else 9
    s.t(182,y+27+dy,titre,12.5,True,AMB,"start"); s.t(182,y+50+dy,val,12.5,True,INK,"start")
    if desc: s.t(182,y+71,desc,10.5,False,GR,"start")
bande(s,338,46,["Au moins 4 circuits spécialisés par logement"],12)
s.ecrire("c14-specialises.svg")

# ---------- 14.7 alimentation d'un chantier
s=S("Le courant sur un chantier","Alimentation d'un chantier : le coffret de branchement provisoire, qui relève de la NF C 14-100, alimente le coffret de chantier équipé d'un interrupteur différentiel 30 mA",640,410)
# réseau : poteau et lignes
s.a('<rect x="104" y="52" width="12" height="136" rx="2" fill="#8a5a2b" stroke="#5e3b17"/><rect x="74" y="64" width="72" height="8" rx="2" fill="#6b4520"/>')
for x in (80,104,128,140): s.a(f'<rect x="{x}" y="56" width="5" height="9" rx="2" fill="#dfe3e7" stroke="#7d858e"/>')
s.a(f'<path d="M30 60 Q70 70 82 58 M30 66 Q80 76 106 58" fill="none" stroke="{INK}" stroke-width="1.6"/><path d="M142 60 Q200 96 262 110" fill="none" stroke="{INK}" stroke-width="3"/>')
# branchement provisoire : coffret gris sur pied
s.a('<rect x="312" y="150" width="14" height="38" fill="#7d858e"/><g filter="url(#ombre)"><rect x="262" y="58" width="116" height="96" rx="6" fill="#e4e7ea" stroke="#9aa1a9"/></g>'); linky(s,272,68,42,62)
s.a('<rect x="322" y="70" width="46" height="60" rx="5" fill="url(#corps)" stroke="#b3b9c0"/><rect x="334" y="80" width="22" height="24" rx="4" fill="url(#manette)"/>')
s.a(f'<path d="M378 124 Q420 150 470 130" fill="none" stroke="{INK}" stroke-width="5"/>')
# coffret de chantier : jaune, prises bleues, différentiel
s.a('<rect x="516" y="158" width="10" height="30" fill="#5b6673"/><rect x="544" y="158" width="10" height="30" fill="#5b6673"/><g filter="url(#ombre)"><rect x="470" y="56" width="130" height="106" rx="8" fill="#f2b90c" stroke="#b98a05"/></g>')
s.a('<rect x="480" y="66" width="110" height="38" rx="4" fill="#fff" stroke="#b3b9c0"/>'); idiff(s,484,69,0.135,"40 A","A",False)
for i in range(5): disj(s,506+i*9.6,69,0.135,"",None,True,False)
for i in range(3): s.a(f'<circle cx="{494+i*40}" cy="134" r="14" fill="#2f6fd0" stroke="#1d4a94" stroke-width="2"/><circle cx="{494+i*40}" cy="134" r="7" fill="#17376e"/>')
s.a(f'<rect x="24" y="188" width="592" height="6" fill="#b9bfc6"/>')
for cx,t,l1,l2,c in ((110,"RÉSEAU","le distributeur","alimente",INK),(320,"BRANCHEMENT","provisoire","NF C 14-100",BLUE),(535,"COFFRET","de chantier","différentiel 30 mA",AMB)):
    s.t(cx,220,t,12.5,True,c); s.t(cx,241,l1,11); s.t(cx,261,l2,11,True if cx>200 else False)
s.t(320,298,"Toutes les prises du chantier sont protégées en 30 mA",11.5,True)
s.t(320,321,"Rallonges déroulées, matériel en bon état, à l'abri de l'eau",10.5,False,GR)
bande(s,340,46,["Un chantier est un milieu mouillé : tension limite 25 V"],11.5)
s.ecrire("c14-provisoire.svg")
print("module 14 : 7 images")
