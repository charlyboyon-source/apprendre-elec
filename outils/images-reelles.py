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
s=S("Prévoir la suite : la réserve","Dans le tableau d'une maison individuelle : au moins 20 % de réserve, répartie dans les rangées sans en laisser une vide, et 2 prises de courant modulaires")
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
s.t(374,94,"20 %",21,True,GRN,"start"); s.t(374,120,"de réserve au minimum",12,False,INK,"start"); s.t(374,140,"en maison individuelle",10,False,GR,"start")
s.t(374,186,"2 PRISES",14,True,INK,"start"); s.t(374,210,"de courant modulaires",12,False,INK,"start")
s.t(374,276,"AUCUNE RANGÉE",14,True,GRN,"start"); s.t(374,300,"laissée entièrement vide",12,False,INK,"start")
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

# =====================================================================
# BLOC 4 — outils communs : symboles normalisés, appareillage, fils
# =====================================================================
ORA="#f28c28"; VIO="#7b4fc9"
def trait(s,d,c,w=4):
    if c=="blanc":
        s.a(f'<path d="{d}" fill="none" stroke="#8d949c" stroke-width="{w+2.5}" stroke-linejoin="round" stroke-linecap="round"/><path d="{d}" fill="none" stroke="#ffffff" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>')
    elif c=="vj":
        s.a(f'<path d="{d}" fill="none" stroke="#2e9e4f" stroke-width="{w}" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="#f2d21a" stroke-width="{w}" stroke-dasharray="6 6" stroke-linejoin="round"/>')
    else:
        s.a(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>')
def g_(s,x,y,rot,contenu): s.a(f'<g transform="translate({x} {y}) rotate({rot})">{contenu}</g>')
# symboles dessinés de haut en bas sur 60 px, origine en haut
def sym_inter(ferme=False,c=INK):
    lame=f'<path d="M0 20 L{0 if ferme else 14} 40" stroke="{c}" stroke-width="2.6" stroke-linecap="round"/>'
    return f'<path d="M0 0 V20 M0 40 V60" stroke="{c}" stroke-width="2.6"/>{lame}<path d="M-5 40 H5" stroke="{c}" stroke-width="2.6"/>'
def sym_bp(c=INK):
    return sym_inter(False,c)+f'<path d="M7 30 H-14" stroke="{c}" stroke-width="2" stroke-dasharray="3 2.5"/><path d="M-14 24 V36" stroke="{c}" stroke-width="2.6"/>'
def sym_lampe(on=False,r=15):
    f="#ffd23f" if on else "#ffffff"
    rays="".join(f'<path d="M{math.cos(a)*(r+5):.1f} {math.sin(a)*(r+5):.1f} L{math.cos(a)*(r+11):.1f} {math.sin(a)*(r+11):.1f}" stroke="#f2a20c" stroke-width="2.4" stroke-linecap="round"/>' for a in [k*math.pi/4 for k in range(8)]) if on else ""
    k=r*0.7
    return f'{rays}<circle r="{r}" fill="{f}" stroke="{INK}" stroke-width="2.6"/><path d="M{-k:.1f} {-k:.1f} L{k:.1f} {k:.1f} M{k:.1f} {-k:.1f} L{-k:.1f} {k:.1f}" stroke="{INK}" stroke-width="2.4"/>'
def sym_terre(c=INK): return f'<path d="M0 0 V14 M-14 14 H14 M-9 20 H9 M-4 26 H4" stroke="{c}" stroke-width="2.6"/>'
def sym_bobine(): return f'<rect x="-14" y="0" width="28" height="36" fill="#fff" stroke="{INK}" stroke-width="2.6"/>'
def sym_disj(c=INK):
    return f'<path d="M0 0 V20 M0 40 V60" stroke="{c}" stroke-width="2.6"/><path d="M0 20 L14 40" stroke="{c}" stroke-width="2.6"/><path d="M-5 35 L5 45 M5 35 L-5 45" stroke="{c}" stroke-width="2.2"/>'
def inter_mural(s,cx,cy,t=60,kind="simple"):
    s.a(f'<g filter="url(#ombre)"><rect x="{cx-t/2}" y="{cy-t/2}" width="{t}" height="{t}" rx="{t*.14:.1f}" fill="url(#nez)" stroke="#b3b9c0"/></g>')
    if kind=="double":
        for dx in (-t*.2,t*.2): s.a(f'<rect x="{cx+dx-t*.17:.1f}" y="{cy-t*.32:.1f}" width="{t*.34:.1f}" height="{t*.64:.1f}" rx="4" fill="#f4f5f7" stroke="#aab1b9"/><path d="M{cx+dx-t*.12:.1f} {cy:.1f} H{cx+dx+t*.12:.1f}" stroke="#c5cad0"/>')
    elif kind=="bp":
        s.a(f'<circle cx="{cx}" cy="{cy}" r="{t*.3:.1f}" fill="#f4f5f7" stroke="#aab1b9" stroke-width="1.5"/><circle cx="{cx}" cy="{cy}" r="{t*.1:.1f}" fill="none" stroke="#f2a20c" stroke-width="2"/>')
    else:
        s.a(f'<rect x="{cx-t*.32:.1f}" y="{cy-t*.32:.1f}" width="{t*.64:.1f}" height="{t*.64:.1f}" rx="5" fill="#f4f5f7" stroke="#aab1b9"/><path d="M{cx-t*.22:.1f} {cy:.1f} H{cx+t*.22:.1f}" stroke="#c5cad0"/>')
def dcl(s,cx,cy,on=False,fil=True):
    s.a(f'<rect x="{cx-26}" y="{cy-8}" width="52" height="14" rx="4" fill="#f4f5f7" stroke="#aab1b9"/>')
    if fil: s.a(f'<path d="M{cx} {cy+6} V{cy+22}" stroke="#5b6673" stroke-width="2.5"/><rect x="{cx-6}" y="{cy+20}" width="12" height="12" rx="2" fill="#d9b25a" stroke="#8a6416"/>')
    r=15; c="#ffd23f" if on else "#f4f5f7"
    s.a(f'<circle cx="{cx}" cy="{cy+47}" r="{r}" fill="{c}" stroke="{"#e0a800" if on else "#aab1b9"}" stroke-width="2"/>')
    if on: s.a("".join(f'<path d="M{cx+math.cos(a)*21:.1f} {cy+47+math.sin(a)*21:.1f} L{cx+math.cos(a)*28:.1f} {cy+47+math.sin(a)*28:.1f}" stroke="#f2a20c" stroke-width="2.4" stroke-linecap="round"/>' for a in [k*math.pi/4 for k in range(8)]))
def dos(s,x,y,w,h,bornes,titre=None,lg=58):
    """Mécanisme vu de dos : bornes en bas, chacune avec son fil (label, couleur, dx)."""
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#f4f5f7" stroke="#aab1b9"/></g>')
    if titre: s.t(x+w/2,y+24,titre,10.5,True,GR)
    for lab,c,dx in bornes:
        bx=x+dx
        trait(s,f"M{bx} {y+h-14} V{y+h+lg}",c,6)
        s.a(f'<rect x="{bx-13}" y="{y+h-36}" width="26" height="26" rx="4" fill="#d9b25a" stroke="#8a6416"/><circle cx="{bx}" cy="{y+h-23}" r="7" fill="url(#vis)"/>')
        s.t(bx,y+h-46,lab,11.5,True)
def rails(s,x1,x2,yp,yn,lab=True):
    trait(s,f"M{x1} {yp} H{x2}",RED,4); trait(s,f"M{x1} {yn} H{x2}",BLUE,4)
    if lab: s.t(x1,yp-10,"phase",11,True,RED,"start"); s.t(x1,yn+22,"neutre",11,True,BLUE,"start")

# =====================================================================
# MODULE 15 — lire un schéma
# =====================================================================
s=S("Le schéma : un langage commun","Un schéma réunit des symboles normalisés, des traits qui représentent les conducteurs et des repères qui nomment chaque élément")
for i,(t,l1,l2) in enumerate((("DES SYMBOLES","un dessin normalisé","par appareil"),("DES TRAITS","les conducteurs","qui les relient"),("DES REPÈRES","un nom pour","chaque élément"))):
    x=16+204*i; carte(s,x,44,196,280); s.t(x+98,74,t,13,True,AMB); s.t(x+98,262,l1,11.5); s.t(x+98,284,l2,11.5)
g_(s,70,166,0,sym_lampe()); g_(s,150,120,0,sym_inter())
for k,c in enumerate((RED,BLUE,"vj")): trait(s,f"M{246+0} {130+k*28} H{390}",c,6)
for k,lab in enumerate(("Q1","S1","E1")):
    s.a(f'<rect x="{442+k*54}" y="140" width="46" height="34" rx="6" fill="#fff" stroke="{INK}" stroke-width="2"/><text x="{465+k*54}" y="164" text-anchor="middle" font-size="17" font-weight="800" fill="{INK}">{lab}</text>')
bande(s,338,46,["Appareils dessinés au repos, installation hors tension"],11.5)
s.ecrire("c15-langage.svg")

s=S("Le schéma architectural : où ?","Schéma architectural : sur le plan du logement, l'emplacement de chaque appareil ; en pointillé, la liaison entre l'interrupteur et le point lumineux qu'il commande")
s.a('<rect x="40" y="58" width="320" height="268" fill="#fbfaf6" stroke="#3a3f46" stroke-width="10"/>')
s.a('<rect x="34" y="190" width="12" height="70" fill="#fbfaf6"/><path d="M40 190 A70 70 0 0 1 110 260" fill="none" stroke="#8d949c" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M40 190 L110 190" stroke="#3a3f46" stroke-width="3" transform="rotate(90 40 190)"/>')
s.a('<rect x="230" y="200" width="110" height="110" rx="6" fill="#ede7da" stroke="#c9bfa9"/><rect x="236" y="206" width="98" height="26" rx="5" fill="#fff" stroke="#c9bfa9"/>')
s.t(285,272,"lit",10.5,False,GR)
g_(s,200,150,0,sym_lampe(False,16))
s.a(f'<circle cx="64" cy="176" r="8" fill="#fff" stroke="{INK}" stroke-width="2.4"/><path d="M69 171 L80 160" stroke="{INK}" stroke-width="2.4"/>')
for (x,y,r) in ((210,320,0),(352,160,-90)):
    s.a(f'<g transform="translate({x} {y}) rotate({r})"><path d="M-11 0 A11 11 0 0 1 11 0" fill="none" stroke="{INK}" stroke-width="2.4"/><path d="M0 -11 V-18 M-11 0 H11" stroke="{INK}" stroke-width="2.4"/></g>')
s.a(f'<path d="M72 170 Q120 120 184 146" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="6 5"/>')
s.t(392,92,"sur le PLAN",13,True,INK,"start"); s.t(392,114,"du logement",11.5,False,INK,"start")
s.t(392,164,"l'emplacement",13,True,INK,"start"); s.t(392,186,"de chaque appareil",11.5,False,INK,"start")
s.t(392,236,"en pointillé :",13,True,INK,"start"); s.t(392,258,"qui commande quoi",11.5,False,INK,"start")
bande(s,340,46,["Il ne montre pas le câblage"],12.5)
s.ecrire("c15-architectural.svg")

s=S("Le schéma unifilaire : un trait par circuit","Schéma unifilaire : un seul trait par circuit ; des traits obliques indiquent le nombre de conducteurs ; on y lit les protections, les calibres et les sections",640,420)
trait(s,"M250 46 V86",INK,3); trait(s,"M90 86 H410",INK,3)
for cx,nom,sec,mq,fin in ((90,"éclairage","1,5 mm²","16 A","lampe"),(250,"prises","2,5 mm²","20 A","prise"),(410,"plaque","6 mm²","32 A","plaque")):
    g_(s,cx,86,0,sym_disj()); s.t(cx+20,124,mq,11,True,INK,"start")
    trait(s,f"M{cx} 146 V250",INK,3)
    for k in range(3): s.a(f'<path d="M{cx-9} {186+k*9} L{cx+9} {178+k*9}" stroke="{INK}" stroke-width="2.2"/>')
    s.t(cx+14,214,sec,10.5,False,GR,"start")
    if fin=="lampe": g_(s,cx,266,0,sym_lampe())
    elif fin=="prise": s.a(f'<g transform="translate({cx} 262)"><path d="M-14 12 A14 14 0 0 1 14 12" fill="none" stroke="{INK}" stroke-width="2.6"/><path d="M0 -12 V-2 M-14 12 H14" stroke="{INK}" stroke-width="2.6"/></g>')
    else: s.a(f'<rect x="{cx-16}" y="252" width="32" height="26" fill="#fff" stroke="{INK}" stroke-width="2.6"/><circle cx="{cx}" cy="265" r="7" fill="none" stroke="{INK}" stroke-width="2"/>')
    s.t(cx,312,nom,12,True)
s.t(466,104,"un seul trait",12,True,INK,"start"); s.t(466,126,"par circuit",11,False,INK,"start")
s.t(466,176,"3 traits obliques =",10.5,True,INK,"start"); s.t(466,198,"3 conducteurs",10.5,False,INK,"start")
s.t(466,248,"on y lit protections,",10,True,INK,"start"); s.t(466,270,"calibres et sections",10,False,INK,"start")
bande(s,346,46,["Le schéma du tableau"],12.5)
s.ecrire("c15-unifilaire.svg")

s=S("Le schéma multifilaire : tous les fils","Schéma multifilaire : un trait par conducteur, chacun à sa couleur, jusqu'aux bornes de l'appareil : ici la phase, le neutre et la protection d'une prise de courant")
coffret(s,26,60,120,170); rail(s,34,74,104,0.35); disj(s,48,74,0.35,"C20",None,True,False); idiff(s,74,74,0.35,"40 A","AC",False)
s.t(86,252,"tableau",11.5,True)
dos(s,430,64,170,130,[("L",RED,40),("N",BLUE,85),("⏚","vj",130)],"prise, vue de dos",0)
for k,(c,lab) in enumerate(((RED,"phase"),(BLUE,"neutre"),("vj","protection"))):
    bx=470+45*k; y=150+k*22
    trait(s,f"M146 {y} H{bx-0} V{180}",c,6)
    s.t(200,y-6,lab,11,True,{0:RED,1:BLUE,2:GRN}[k],"start")
for i,(l1,l2) in enumerate((("un trait","par conducteur"),("chaque fil","à sa couleur"),("le câblage réel,","borne par borne"))):
    cx=118+202*i; carte(s,cx-94,250,188,72); s.t(cx,280,l1,12,True); s.t(cx,302,l2,11)
bande(s,338,46,["Le schéma qu'on suit pour raccorder"],12.5)
s.ecrire("c15-multifilaire.svg")

s=S("Le schéma développé : comment ça marche ?","Schéma développé : la phase en haut, le neutre en bas ; entre les deux, l'interrupteur S1 puis la lampe E1, dans l'ordre où le courant les traverse")
rails(s,40,340,86,296)
g_(s,190,86,0,sym_inter(True)); s.t(212,124,"S1",13,True,INK,"start")
trait(s,"M190 146 V196",ORA,4); g_(s,190,212,0,sym_lampe(True)); s.t(220,218,"E1",13,True,INK,"start")
trait(s,"M190 228 V296",BLUE,4)
s.t(390,98,"la phase en haut,",12,True,INK,"start"); s.t(390,120,"le neutre en bas",12,True,INK,"start")
s.t(390,174,"entre les deux :",12,False,INK,"start"); s.t(390,196,"le fonctionnement",12,True,INK,"start")
s.t(390,246,"pas l'emplacement",12,False,GR,"start"); s.t(390,268,"des appareils",12,False,GR,"start")
bande(s,340,46,["Le schéma pour comprendre un montage"],12.5)
s.ecrire("c15-developpe.svg")

s=S("Quelques symboles à reconnaître","Quatre symboles à côté de l'objet réel : la lampe, un cercle et une croix ; l'interrupteur, un contact ; le bouton-poussoir, un contact à poussoir ; la terre, trois traits",640,420)
for i,(nom,desc) in enumerate((("lampe","cercle + croix"),("interrupteur","contact"),("bouton-poussoir","contact à poussoir"),("terre","trois traits"))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,280)
    if i==0: ampoule(s,cx,90,22)
    elif i==1: inter_mural(s,cx,96,58)
    elif i==2: inter_mural(s,cx,96,58,"bp")
    else: s.a(f'<rect x="{cx-40}" y="110" width="80" height="22" rx="4" fill="url(#terre)"/><rect x="{cx-4}" y="64" width="8" height="70" fill="url(#acierH)" stroke="#7d858e"/><path d="M{cx-4} 134 L{cx} 146 L{cx+4} 134" fill="#9aa1a9"/>'); trait(s,f"M{cx} 66 Q{cx+18} 56 {cx+40} 62","vj",4)
    s.a(f'<path d="M{x+16} 158 H{x+130}" stroke="#e3dccf" stroke-width="2"/>')
    if i==0: g_(s,cx,206,0,sym_lampe())
    elif i==1: g_(s,cx,176,0,sym_inter())
    elif i==2: g_(s,cx+4,176,0,sym_bp())
    else: g_(s,cx,182,0,sym_terre())
    s.t(cx,270,nom,11.5 if i!=2 else 10.5,True); s.t(cx,294,desc,10.5 if i!=2 else 9.5,False,GR)
s.t(320,354,"Un symbole désigne une fonction, pas une marque ni une forme",11,True)
s.t(320,384,"La légende du plan donne tous les symboles utilisés",10.5,False,GR)
s.ecrire("c15-symboles.svg")

s=S("Quatre schémas, quatre questions","Quatre schémas, quatre questions : architectural, où sont les appareils ; unifilaire, quels circuits et quelles protections ; multifilaire, comment raccorder ; développé, comment ça fonctionne",640,410)
for r,(t,q,d) in enumerate((("ARCHITECTURAL","Où sont les appareils ?","sur le plan du logement"),("UNIFILAIRE","Quels circuits, quelles protections ?","un trait par circuit"),("MULTIFILAIRE","Comment raccorder ?","un trait par conducteur"),("DÉVELOPPÉ","Comment ça fonctionne ?","de la phase au neutre"))):
    y=44+r*88; carte(s,16,y,608,80)
    if r==0: s.a(f'<rect x="40" y="{y+12}" width="96" height="56" fill="#fbfaf6" stroke="#3a3f46" stroke-width="5"/>'); g_(s,88,y+40,0,sym_lampe(False,10))
    elif r==1:
        trait(s,f"M88 {y+10} V{y+70}",INK,3)
        for k in range(3): s.a(f'<path d="M80 {y+36+k*7} L96 {y+30+k*7}" stroke="{INK}" stroke-width="2"/>')
    elif r==2:
        for k,c in enumerate((RED,BLUE,"vj")): trait(s,f"M40 {y+24+k*16} H136",c,5)
    else: trait(s,f"M40 {y+16} H136",RED,4); trait(s,f"M40 {y+64} H136",BLUE,4); g_(s,88,y+40,0,sym_lampe(False,10))
    s.t(162,y+26,t,12.5,True,AMB,"start"); s.t(162,y+50,q,12.5,True,INK,"start"); s.t(162,y+70,d,10.5,False,GR,"start")
s.ecrire("c15-quatre.svg")
print("module 15 : 7 images")

# =====================================================================
# MODULE 16 — simple et double allumage
# =====================================================================
s=S("Le point lumineux et sa commande","Le point lumineux, équipé d'un DCL au plafond, et son interrupteur placé à l'entrée de la pièce, entre 0,90 m et 1,30 m du sol",640,420)
SOL=330; M_=108; H=lambda m: SOL-m*M_
s.a(f'<rect x="24" y="52" width="592" height="10" fill="#d5d9de"/><rect x="24" y="{SOL}" width="592" height="10" fill="#b9bfc6"/>')
s.a(f'<rect x="60" y="{H(2.04):.0f}" width="78" height="{SOL-H(2.04):.0f}" fill="#efe6d6" stroke="#c9bfa9"/><circle cx="126" cy="{H(1.0):.0f}" r="4" fill="#8d949c"/>')
s.a(f'<rect x="150" y="{H(1.30):.0f}" width="60" height="{H(0.90)-H(1.30):.0f}" fill="#e3f5ea" stroke="{GRN}" stroke-dasharray="5 4"/>')
inter_mural(s,180,H(1.1),34)
for m,lab in ((1.30,"1,30 m"),(0.90,"0,90 m")): s.a(f'<path d="M214 {H(m):.0f} H232" stroke="{GRN}" stroke-width="2"/>'); s.t(236,H(m)+5,lab,10.5,True,GRN,"start")
dcl(s,440,64,True)
s.t(478,84,"DCL",13,True,INK,"start"); s.t(478,106,"dispositif de connexion",9.5,False,GR,"start"); s.t(478,126,"pour luminaire",9.5,False,GR,"start")
s.t(300,190,"interrupteur",12.5,True,INK,"start"); s.t(300,212,"à l'entrée de la pièce",10.5,False,INK,"start"); s.t(300,252,"entre 0,90 m",12,True,GRN,"start"); s.t(300,274,"et 1,30 m du sol",11,False,GRN,"start")
bande(s,354,48,["Un point lumineux = un emplacement","où l'on raccorde un luminaire"],11.5)
s.ecrire("c16-point.svg")

s=S("Simple allumage : le schéma développé","Simple allumage : un interrupteur S1 et un point lumineux E1. Interrupteur ouvert, la lampe est éteinte ; fermé, elle s'allume. En orange, le retour lampe",640,420)
for px,ferme,txt in ((16,False,"S1 ouvert : éteint"),(328,True,"S1 fermé : allumé")):
    s.panneau(px,44,296,288); cx=px+148
    rails(s,px+20,px+276,82,286,px==16)
    g_(s,cx,82,0,sym_inter(ferme)); s.t(cx+22,120,"S1",12,True,INK,"start")
    trait(s,f"M{cx} 142 V194",ORA,4); g_(s,cx,210,0,sym_lampe(ferme)); s.t(cx+30,216,"E1",12,True,INK,"start")
    trait(s,f"M{cx} 225 V286",BLUE,4)
    s.t(cx,316,txt,12.5,True,GRN if ferme else GR)
s.t(170,356,"1 interrupteur · 1 point lumineux",11,True); s.t(482,356,"en orange : le retour lampe",11,True,ORA)
bande(s,372,40,["Le courant traverse la commande avant le récepteur"],11.5)
s.ecrire("c16-simple-dev.svg")

s=S("Simple allumage : le câblage","Câblage du simple allumage : la phase va du tableau à l'interrupteur, le retour lampe de l'interrupteur à la lampe ; le neutre et la protection vont directement du tableau à la lampe",640,420)
coffret(s,24,74,110,150); rail(s,32,90,94,0.33); disj(s,44,90,0.33,"C16",None,True,False); idiff(s,68,90,0.33,"40 A","AC",False)
trait(s,"M134 118 H272",RED,5); inter_mural(s,300,118,56)
trait(s,"M328 118 H514 V72",ORA,5)
trait(s,"M134 192 H532 V72",BLUE,5); trait(s,"M134 208 H548 V72","vj",5)
dcl(s,532,64,True,False)
s.t(79,248,"tableau",11.5,True); s.t(300,176,"interrupteur",11.5,True); s.t(600,140,"lampe",11.5,True,INK,"end")
s.t(200,108,"phase",11,True,RED); s.t(420,108,"retour lampe",11,True,ORA)
s.t(334,240,"neutre et protection : directs",11,True,INK)
carte(s,24,272,290,84); s.t(169,304,"2 fils à l'interrupteur",12,True); s.t(169,328,"phase + retour",11)
carte(s,326,272,290,84); s.t(471,304,"3 fils à la lampe",12,True); s.t(471,328,"retour, neutre, protection",10.5)
s.t(320,394,"Tout le circuit est en 1,5 mm²",11,False,GR)
s.ecrire("c16-simple-cablage.svg")

s=S("L'interrupteur coupe la phase, jamais le neutre","Interrupteur sur la phase : ouvert, la douille est hors tension. Interrupteur sur le neutre : la lampe est éteinte mais la douille reste sous tension",640,420)
def douille(cx,cy,danger):
    if danger: s.a(f'<circle cx="{cx}" cy="{cy+10}" r="30" fill="#ff5c5c" opacity=".22"/>')
    s.a(f'<rect x="{cx-12}" y="{cy-14}" width="24" height="22" rx="3" fill="#d9b25a" stroke="#8a6416"/><circle cx="{cx}" cy="{cy+22}" r="14" fill="#f4f5f7" stroke="#aab1b9" stroke-width="2"/>')
for px,sur_phase in ((16,True),(328,False)):
    s.panneau(px,44,296,346); x0=px+20; y=128
    s.t(px+148,72,"SUR LA PHASE" if sur_phase else "SUR LE NEUTRE",14,True,GRN if sur_phase else RED)
    if sur_phase:
        trait(s,f"M{x0} {y} H{x0+40}",RED,4); g_(s,x0+40,y,-90,sym_inter(False)); trait(s,f"M{x0+100} {y} H{x0+126}",ORA,4)
        douille(x0+138,y,False); trait(s,f"M{x0+150} {y} H{x0+256}",BLUE,4)
    else:
        trait(s,f"M{x0} {y} H{x0+126}",RED,4); douille(x0+138,y,True)
        trait(s,f"M{x0+150} {y} H{x0+176}",BLUE,4); g_(s,x0+176,y,-90,sym_inter(False,INK)); trait(s,f"M{x0+236} {y} H{x0+256}",BLUE,4)
    s.t(x0,y-14,"phase",10.5,True,RED,"start"); s.t(x0+256,y-14,"neutre",10.5,True,BLUE,"end")
    cx=px+148
    s.t(cx,214,"interrupteur ouvert :",11.5)
    if sur_phase:
        s.t(cx,238,"la douille est",11.5); s.t(cx,268,"HORS TENSION",14,True,GRN); s.t(cx,308,"on change l'ampoule",11,False,GR); s.t(cx,330,"sans risque",11,False,GR)
    else:
        s.t(cx,238,"la lampe est éteinte",11.5); s.t(cx,268,"MAIS SOUS TENSION",14,True,RED); s.t(cx,308,"la phase arrive toujours",11,False,GR); s.t(cx,330,"à la douille",11,False,GR)
s.ecrire("c16-phase.svg")

s=S("Double allumage : le schéma développé","Double allumage : un interrupteur double commande deux points lumineux indépendants E1 et E2 ; la phase est commune aux deux contacts S1 et S2",640,420)
rails(s,30,380,74,300)
trait(s,"M200 74 V104",RED,4); trait(s,"M120 104 H280",RED,4)
s.a(f'<rect x="96" y="90" width="210" height="80" rx="10" fill="none" stroke="{GR}" stroke-width="1.6" stroke-dasharray="6 4"/>')
for cx,lab,el,on in ((120,"S1","E1",True),(280,"S2","E2",False)):
    g_(s,cx,104,0,sym_inter(on)); s.t(cx+22,140,lab,12,True,INK,"start")
    trait(s,f"M{cx} 164 V214",ORA,4); g_(s,cx,230,0,sym_lampe(on)); s.t(cx+28,236,el,12,True,INK,"start")
    trait(s,f"M{cx} 245 V300",BLUE,4)
s.t(200,190,"interrupteur double",10,False,GR)
s.t(420,104,"1 interrupteur",12.5,True,INK,"start"); s.t(420,126,"double",12.5,True,INK,"start")
s.t(420,176,"2 points lumineux",12,True,INK,"start"); s.t(420,198,"indépendants",11.5,False,INK,"start")
s.t(420,248,"la phase est",11.5,False,INK,"start"); s.t(420,270,"commune aux deux",11.5,True,RED,"start")
bande(s,340,52,["Deux simples allumages réunis","dans le même appareil"],11.5)
s.ecrire("c16-double-dev.svg")

s=S("Double allumage : combien de fils ?","Double allumage : à l'interrupteur, trois fils, la phase commune et deux retours lampe ; à chaque lampe, trois fils, le retour lampe, le neutre et la protection",640,440)
s.panneau(16,44,296,320); s.panneau(328,44,296,320)
s.t(164,72,"À L'INTERRUPTEUR",13.5,True,AMB); s.t(476,72,"À CHAQUE LAMPE",13.5,True,AMB)
dos(s,54,88,220,96,[("L",RED,50),("1",ORA,110),("2",ORA,170)],"interrupteur double, vu de dos",36)
dos(s,366,88,220,96,[("L",ORA,50),("N",BLUE,110),("⏚","vj",170)],"DCL, vu de dos",36)
s.t(164,248,"3 fils",15,True); s.t(164,276,"1 phase (commune)",11.5,False,RED); s.t(164,298,"2 retours lampe",11.5,False,ORA); s.t(164,322,"un retour par point lumineux",10,False,GR)
s.t(476,248,"3 fils",15,True); s.t(476,276,"1 retour lampe",11.5,False,ORA); s.t(476,298,"1 neutre",11.5,False,BLUE); s.t(476,320,"1 protection",11.5,False,GRN)
s.t(320,392,"Le neutre ne passe jamais par l'interrupteur",11.5,True)
s.t(320,418,"Tout le circuit est en 1,5 mm²",10.5,False,GR)
s.ecrire("c16-double-cablage.svg")

s=S("La lampe ne s'allume pas : par où commencer ?","Trois pannes d'allumage : la lampe ne s'allume pas, on vérifie l'ampoule puis le disjoncteur puis les connexions ; elle reste allumée, la commande est contournée ; ça disjoncte, il y a un court-circuit",640,420)
for i,(t,l1,l2,l3) in enumerate((("NE S'ALLUME PAS","l'ampoule d'abord","puis le disjoncteur,","puis les connexions"),("RESTE ALLUMÉE","phase et retour pontés","contact collé ou","erreur de câblage"),("ÇA DISJONCTE","court-circuit","on cherche, on ne","réarme pas en boucle"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,284); s.t(cx,72,t,12.5,True,(GR,AMB,RED)[i])
    if i==0: dcl(s,cx,92,False); s.a(f'<text x="{cx+30}" y="150" font-size="26" font-weight="800" fill="{RED}">?</text>')
    elif i==1: dcl(s,cx-30,92,True); inter_mural(s,cx+44,140,44); s.t(cx+44,192,"sur « éteint »",9.5,False,GR)
    else: disj(s,cx-26,86,0.5,"C16",None,False)
    s.t(cx,236,l1,11.5,True); s.t(cx,260,l2,10.5); s.t(cx,282,l3,10.5)
bande(s,344,52,["Toute intervention : hors tension,","absence de tension vérifiée"],11.5)
s.ecrire("c16-pannes.svg")
print("module 16 : 7 images")

# =====================================================================
# MODULE 17 — va-et-vient et permutateur
# =====================================================================
def vv_sym(s,x,y,pos,miroir=False):
    """Inverseur : commun en (x,y), navettes à 40 px, 20 px au-dessus (1) et en dessous (2)."""
    sg=-1 if miroir else 1; nx=x+sg*40
    s.a(f'<circle cx="{x}" cy="{y}" r="4" fill="{INK}"/><circle cx="{nx}" cy="{y-20}" r="3.5" fill="#fff" stroke="{INK}" stroke-width="2"/><circle cx="{nx}" cy="{y+20}" r="3.5" fill="#fff" stroke="{INK}" stroke-width="2"/>')
    s.a(f'<path d="M{x} {y} L{nx-sg*4} {y-20 if pos==1 else y+20}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    return nx

s=S("Une lampe, deux endroits pour la commander","Plan d'un couloir : une lampe au milieu, un interrupteur va-et-vient à chaque extrémité ; chacun commande la même lampe")
s.a('<rect x="40" y="96" width="560" height="140" fill="#fbfaf6" stroke="#3a3f46" stroke-width="10"/>')
for x in (34,594): s.a(f'<rect x="{x}" y="130" width="12" height="70" fill="#fbfaf6"/>')
g_(s,320,166,0,sym_lampe(True,16))
for x,lab,sg in ((72,"interrupteur 1",1),(568,"interrupteur 2",-1)):
    s.a(f'<circle cx="{x}" cy="116" r="8" fill="#fff" stroke="{INK}" stroke-width="2.4"/><path d="M{x+sg*5} 121 L{x+sg*16} 132 M{x-sg*5} 121 L{x-sg*16} 132" stroke="{INK}" stroke-width="2.4"/>')
    s.a(f'<path d="M{x+sg*10} 120 Q{(x+320)/2} 136 {320-sg*18} 160" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="6 5"/>')
    s.t(x+sg*4,80,lab,11.5,True,INK,"start" if sg>0 else "end")
s.t(320,222,"couloir",11,False,GR)
bande(s,264,52,["On allume en entrant,","on éteint en sortant par l'autre bout"],11.5)
s.t(320,358,"Couloir, escalier, chambre, pièce à deux portes",11.5,False,GR)
s.ecrire("c17-besoin.svg")

s=S("Le va-et-vient : un inverseur à 3 bornes","L'interrupteur va-et-vient est un inverseur à trois bornes : le commun est relié soit à la navette 1, soit à la navette 2, jamais aux deux à la fois")
for px,pos in ((16,1),(328,2)):
    s.panneau(px,44,296,262); cx=px+148
    s.a(f'<g filter="url(#ombre)"><rect x="{px+40}" y="70" width="216" height="150" rx="12" fill="#f4f5f7" stroke="#aab1b9"/></g>')
    def borne(bx,by,lab,c):
        s.a(f'<rect x="{bx-13}" y="{by-13}" width="26" height="26" rx="4" fill="#d9b25a" stroke="#8a6416"/><circle cx="{bx}" cy="{by}" r="7" fill="url(#vis)"/>'); s.t(bx,by+(30 if by>140 else -20),lab,10.5,True,c)
    borne(px+80,145,"commun",INK); borne(px+214,104,"navette 1",VIO); borne(px+214,186,"navette 2",VIO)
    s.a(f'<path d="M{px+93} 145 L{px+196} {112 if pos==1 else 178}" stroke="url(#cuivreH)" stroke-width="8" stroke-linecap="round"/><circle cx="{px+93}" cy="145" r="6" fill="#8a6416"/>')
    s.t(cx,262,f"position {pos}",13,True); s.t(cx,286,f"le commun touche la navette {pos}",10.5,False,GR)
s.t(320,334,"1 borne commune + 2 bornes de navette",12,True)
s.t(320,366,"Le commun n'est jamais relié aux deux navettes à la fois",11,False,GR)
s.ecrire("c17-inverseur.svg")

s=S("Va-et-vient : le schéma développé","Montage va-et-vient : la phase arrive sur le commun de S1, deux navettes relient S1 et S2, le commun de S2 part en retour lampe vers E1 puis au neutre. Même navette : allumé ; navettes différentes : éteint",640,420)
for px,p2,txt,on in ((16,1,"même navette : allumé",True),(328,2,"navettes différentes : éteint",False)):
    s.panneau(px,44,296,290); x0=px+18; y=140
    trait(s,f"M{x0} {y} H{x0+38}",RED,4)
    n1=vv_sym(s,x0+40,y,1)
    trait(s,f"M{n1+4} {y-20} H{x0+176}",VIO,4); trait(s,f"M{n1+4} {y+20} H{x0+176}",VIO,4)
    vv_sym(s,x0+220,y,p2,True)
    trait(s,f"M{x0+224} {y} H{x0+236}",ORA,4); g_(s,x0+252,y,0,sym_lampe(on,14))
    trait(s,f"M{x0+252} {y+14} V230 H{x0}",BLUE,4)
    s.t(x0+40,y-36,"S1",11.5,True); s.t(x0+220,y-36,"S2",11.5,True); s.t(x0+252,y-26,"E1",11.5,True)
    s.t(x0+130,y+48,"2 navettes",10.5,True,VIO)
    s.t(x0,y-14,"phase",10,True,RED,"start"); s.t(x0,252,"neutre",10,True,BLUE,"start")
    s.t(px+148,306,txt,12.5,True,GRN if on else GR)
bande(s,350,46,["Chaque interrupteur inverse l'état de la lampe"],11.5)
s.ecrire("c17-principe.svg")

s=S("Va-et-vient : combien de fils ?","Câblage du va-et-vient : au premier, la phase sur le commun et les deux navettes ; au second, les deux navettes et le retour lampe sur le commun ; à la lampe, le retour lampe, le neutre et la protection",640,440)
for i,(t,bornes,lignes) in enumerate((("VA-ET-VIENT 1",[("L",RED,30),("1",VIO,80),("2",VIO,130)],[("1 phase",RED),("2 navettes",VIO)]),("VA-ET-VIENT 2",[("1",VIO,30),("2",VIO,80),("L",ORA,130)],[("2 navettes",VIO),("1 retour lampe",ORA)]),("LAMPE",[("L",ORA,30),("N",BLUE,80),("⏚","vj",130)],[("1 retour lampe",ORA),("1 neutre",BLUE),("1 protection",GRN)]))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,316); s.t(cx,72,t,12.5,True,AMB)
    dos(s,x+18,86,160,90,bornes,None,30)
    s.t(cx,240,"3 fils",15,True)
    for k,(l,c) in enumerate(lignes): s.t(cx,268+k*22,l,11,False,c)
s.t(320,390,"Phase sur le commun du 1er, retour lampe sur le commun du 2e",10.5,True)
s.t(320,418,"Le neutre va directement à la lampe",10.5,False,GR)
s.ecrire("c17-cablage.svg")

s=S("Trois endroits : le permutateur","Le permutateur, à quatre bornes, se place sur les navettes entre les deux va-et-vient : il les laisse passer tout droit ou il les croise",640,420)
y=118
n1=vv_sym(s,74,y,1); s.t(74,y-40,"va-et-vient",10.5,True)
vv_sym(s,566,y,2,True); s.t(566,y-40,"va-et-vient",10.5,True)
trait(s,f"M{n1+4} {y-20} H262",VIO,4); trait(s,f"M{n1+4} {y+20} H262",VIO,4)
trait(s,f"M378 {y-20} H{526-4}",VIO,4); trait(s,f"M378 {y+20} H{526-4}",VIO,4)
s.a(f'<g filter="url(#ombre)"><rect x="262" y="{y-46}" width="116" height="92" rx="10" fill="#f4f5f7" stroke="#aab1b9"/></g>')
for bx in (276,364):
    for by in (y-20,y+20): s.a(f'<rect x="{bx-9}" y="{by-9}" width="18" height="18" rx="3" fill="#d9b25a" stroke="#8a6416"/><circle cx="{bx}" cy="{by}" r="5" fill="url(#vis)"/>')
s.t(320,y-58,"PERMUTATEUR",12.5,True,AMB); s.t(320,y+68,"4 bornes",11,True)
for px,croise,lab in ((80,False,"tout droit"),(360,True,"croisé")):
    carte(s,px,214,200,104); s.t(px+100,240,lab,12,True)
    for k,(a,b) in enumerate(((262,262),(298,298)) if not croise else ((262,298),(298,262))):
        trait(s,f"M{px+30} {a} H{px+70} L{px+130} {b} H{px+170}",VIO,4)
bande(s,334,62,["Il laisse passer les navettes tout droit, ou il les croise","Il se place toujours entre les deux va-et-vient"],11)
s.ecrire("c17-permutateur.svg")

s=S("Combien d'appareils ?","Nombre d'appareils : deux endroits, deux va-et-vient ; trois endroits, deux va-et-vient et un permutateur ; quatre endroits, deux va-et-vient et deux permutateurs",640,410)
for r,(t,d,seq) in enumerate((("2 ENDROITS","2 va-et-vient","VV"),("3 ENDROITS","2 va-et-vient + 1 permutateur","VPV"),("4 ENDROITS","2 va-et-vient + 2 permutateurs","VPPV"))):
    y=44+r*94; carte(s,16,y,608,84)
    for k,c in enumerate(seq):
        cx=50+k*58; inter_mural(s,cx,y+36,40); s.t(cx,y+74,"VV" if c=="V" else "P",9.5,True,VIO if c=="P" else INK)
    s.t(296,y+34,t,13,True,AMB,"start"); s.t(296,y+58,d,11.5,True,INK,"start")
bande(s,334,52,["À partir de 3 endroits, le télérupteur est plus simple","(module 18)"],11)
s.ecrire("c17-nombre.svg")

s=S("Le va-et-vient qui ne marche qu'à moitié","Panne classique du va-et-vient : la lampe ne répond que dans certaines positions, parce qu'un commun et une navette ont été inversés",640,430)
for i,(t,c,l1,l2,l3) in enumerate((("SYMPTÔME",GR,"la lampe ne répond","que dans certaines","positions"),("CAUSE",RED,"un commun et une","navette inversés","phase sur une navette"),("REMÈDE",GRN,"repérer le commun","phase sur l'un,","retour lampe sur l'autre"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,312); s.t(cx,72,t,13,True,c)
    if i==0: dcl(s,cx-36,96,False); inter_mural(s,cx+30,130,40); s.a(f'<text x="{cx-10}" y="160" font-size="26" font-weight="800" fill="{RED}">?</text>')
    else:
        bad=(i==1)
        dos(s,x+18,90,160,86,[("L",VIO if bad else RED,30),("1",RED if bad else VIO,80),("2",VIO,130)],None,24)
        if bad: s.a(f'<path d="M{x+86} 182 l20 20 M{x+106} 182 l-20 20" stroke="{RED}" stroke-width="4" stroke-linecap="round"/>')
        else: s.a(f'<path d="M{x+30} 194 l8 9 l16 -18" fill="none" stroke="{GRN}" stroke-width="4" stroke-linecap="round"/>')
    s.t(cx,260,l1,11.5,True); s.t(cx,284,l2,10.5); s.t(cx,306,l3,10.5)
bande(s,370,48,["On corrige hors tension, absence de tension vérifiée"],11)
s.ecrire("c17-pannes.svg")
print("module 17 : 7 images")

# =====================================================================
# MODULE 18 — télérupteur et minuterie
# =====================================================================
def tl_module(s,x,y,k,marque="TL",bornes=True):
    s.a(f'<g transform="translate({x} {y}) scale({k})" filter="url(#ombre)"><rect width="70" height="240" rx="6" fill="url(#corps)" stroke="#b3b9c0"/><rect y="60" width="70" height="120" fill="url(#nez)" stroke="#c5cad0"/>'
        '<use href="#borne" x="20" y="30"/><use href="#borne" x="50" y="30"/><use href="#borne" x="20" y="210"/><use href="#borne" x="50" y="210"/>'
        '<rect x="22" y="76" width="26" height="40" rx="4" fill="#d5d9de" stroke="#b3b9c0"/><rect x="28" y="82" width="14" height="14" rx="3" fill="#3a3f46"/>'
        f'<text x="35" y="148" text-anchor="middle" font-size="17" font-weight="800" fill="{INK}">{marque}</text></g>')

s=S("Autant de points de commande qu'on veut","Montage télérupteur : la lampe est commandée par le télérupteur placé au tableau ; dans la pièce, des boutons-poussoirs en parallèle lui envoient des impulsions")
s.a('<rect x="40" y="60" width="380" height="260" fill="#fbfaf6" stroke="#3a3f46" stroke-width="10"/>')
g_(s,230,190,0,sym_lampe(True,16))
bps=((90,92),(380,92),(90,288),(380,288))
for (x,y) in bps: inter_mural(s,x,y,30)
trait(s,"M90 108 V272",("blanc"),3.5); trait(s,"M380 108 V272","blanc",3.5); trait(s,"M106 92 H364","blanc",3.5); trait(s,"M395 92 H500 V150","blanc",3.5)
coffret(s,470,150,90,130); tl_module(s,500,160,0.34)
s.t(515,300,"télérupteur",11.5,True); s.t(515,320,"au tableau",10.5,False,GR)
s.t(230,346,"boutons-poussoirs (4 ici)",11,True)
bande(s,358,40,["Un appui allume, l'appui suivant éteint · tous les BP en PARALLÈLE"],10.5)
s.ecrire("c18-bp.svg")

s=S("Le télérupteur : une bobine et un contact","Vue en coupe d'un télérupteur : la bobine, bornes A1 et A2, reçoit les impulsions des boutons-poussoirs et fait basculer un mécanisme ; le contact, bornes 1 et 2, change d'état à chaque impulsion et garde sa position",640,440)
s.a('<g filter="url(#ombre)"><rect x="210" y="60" width="220" height="290" rx="10" fill="#eef0f2" stroke="#b3b9c0" stroke-width="2"/></g><rect x="220" y="70" width="200" height="270" rx="6" fill="#fbfbfc" stroke="#d5d9de"/>')
for bx,lab,y in ((260,"1",86),(380,"2",86),(260,"A1",300),(380,"A2",300)):
    s.a(f'<rect x="{bx-18}" y="{y-14}" width="36" height="28" rx="4" fill="#d9b25a" stroke="#8a6416"/><circle cx="{bx}" cy="{y}" r="8" fill="url(#vis)"/>')
    s.t(bx,y+(-24 if y<150 else 40),lab,12,True,INK)
# contact 1-2
s.a('<path d="M260 100 V130 H286" fill="none" stroke="url(#cuivreH)" stroke-width="7"/><path d="M380 100 V130 H354" fill="none" stroke="url(#cuivreH)" stroke-width="7"/><path d="M296 132 L344 120" stroke="url(#cuivreH)" stroke-width="8" stroke-linecap="round"/>')
s.a('<rect x="284" y="126" width="10" height="10" rx="2" fill="#e8eaed" stroke="#8d949c"/><rect x="346" y="126" width="10" height="10" rx="2" fill="#e8eaed" stroke="#8d949c"/>')
# mécanisme bistable : roue à rochet
cx,cy=320,190
pts=" ".join(f"{cx+(26 if k%2==0 else 18)*math.cos(k*math.pi/8):.1f},{cy+(26 if k%2==0 else 18)*math.sin(k*math.pi/8):.1f}" for k in range(16))
s.a(f'<polygon points="{pts}" fill="#c3c8ce" stroke="#7d858e" stroke-width="1.5"/><circle cx="{cx}" cy="{cy}" r="6" fill="#7d858e"/><path d="M{cx} {cy-26} L{cx+4} 140" stroke="#7d858e" stroke-width="3"/>')
# bobine + noyau
s.a('<rect x="270" y="236" width="100" height="12" rx="2" fill="url(#acierH)" stroke="#7d858e"/>')
for i in range(8): s.a(f'<rect x="{274+i*11.5:.1f}" y="224" width="10" height="36" rx="5" fill="url(#cuivreV)" stroke="#7a4513" stroke-width=".8"/>')
s.a(f'<path d="M320 224 V216" stroke="#7d858e" stroke-width="5"/><path d="M276 260 V286 H260" fill="none" stroke="url(#cuivreH)" stroke-width="5"/><path d="M364 260 V286 H380" fill="none" stroke="url(#cuivreH)" stroke-width="5"/>')
def rep(x1,y1,x2,y2,c=INK): s.a(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{c}" stroke-width="1.6"/><circle cx="{x1}" cy="{y1}" r="3" fill="{c}"/>')
rep(272,244,196,244,BLUE); s.t(190,222,"LA BOBINE",12,True,BLUE,"end"); s.t(190,244,"bornes A1 et A2",10.5,False,INK,"end"); s.t(190,264,"reçoit les impulsions",10,False,INK,"end"); s.t(190,283,"des boutons-poussoirs",10,False,INK,"end"); s.t(190,306,"COMMANDE",10.5,True,BLUE,"end")
rep(340,124,446,124,ORA); s.t(452,104,"LE CONTACT",12,True,ORA,"start"); s.t(452,126,"bornes 1 et 2",10.5,False,INK,"start"); s.t(452,146,"il change d'état",10,False,INK,"start"); s.t(452,165,"à chaque impulsion",10,False,INK,"start"); s.t(452,188,"PUISSANCE",10.5,True,ORA,"start")
rep(346,196,446,226); s.t(452,232,"mécanisme",10.5,True,INK,"start"); s.t(452,252,"bistable",10,False,GR,"start")
s.t(430,368,"vue en coupe",9.5,False,GR,"end")
bande(s,380,46,["Le contact garde sa position entre deux impulsions"],11.5)
s.ecrire("c18-telerupteur.svg")

s=S("Télérupteur : le schéma développé","Schéma développé du télérupteur : à gauche la commande, les boutons-poussoirs S1 et S2 en parallèle alimentent la bobine A1-A2 ; à droite la puissance, le contact 1-2 alimente la lampe E1 par le retour lampe",640,430)
rails(s,30,600,76,326)
trait(s,"M150 76 V96 H100 M150 96 H200",RED,4)
for x,lab in ((100,"S1"),(200,"S2")): g_(s,x,96,0,sym_bp()); s.t(x+20,124,lab,11,True,INK,"start")
trait(s,"M100 156 V176 H200 V156","blanc",3.5); trait(s,"M150 176 V214","blanc",3.5)
g_(s,150,214,0,sym_bobine()); s.t(176,226,"A1",10.5,True,INK,"start"); s.t(176,248,"A2",10.5,True,INK,"start")
trait(s,"M150 250 V326",BLUE,4)
trait(s,"M440 76 V96",RED,4); g_(s,440,96,0,sym_inter(False)); s.t(462,124,"1 – 2",11,True,INK,"start")
trait(s,"M440 156 V214",ORA,4); g_(s,440,230,0,sym_lampe(False)); s.t(470,236,"E1",11,True,INK,"start")
trait(s,"M440 245 V326",BLUE,4)
s.a(f'<path d="M166 232 H300 V126 H452" fill="none" stroke="{GR}" stroke-width="1.6" stroke-dasharray="5 4"/>')
s.t(150,360,"COMMANDE",12.5,True,BLUE); s.t(440,360,"PUISSANCE",12.5,True,ORA)
s.t(320,396,"En blanc : le retour bouton-poussoir · en orange : le retour lampe",10,False,GR)
s.ecrire("c18-dev.svg")

s=S("Le montage 3 fils","Montage 3 fils du télérupteur : une seule phase alimente les boutons-poussoirs et la borne 1 ; le retour bouton-poussoir va sur A1 ; A2 au neutre ; la borne 2 part en retour lampe",640,440)
tl_module(s,96,60,0.62)
for (bx,lab,c,up) in ((96+20*0.62,"A1","blanc",True),(96+50*0.62,"1",RED,True),(96+20*0.62,"A2",BLUE,False),(96+50*0.62,"2",ORA,False)):
    y=60+(30 if up else 210)*0.62
    trait(s,f"M{bx:.1f} {y:.1f} V{y-46 if up else y+46:.1f}",c,5); s.t(round(bx-(16 if bx<110 else -16),1),round(y-40 if up else y+50,1),lab,10.5,True,INK,"end" if bx<110 else "start")
dos(s,230,72,130,84,[("L",RED,36),("",  "blanc",94)],"bouton-poussoir",38)
s.t(295,214,"2 fils par BP",11,True)
for r,(t,c,l1,l2) in enumerate((("PHASE",RED,"vers tous les","boutons-poussoirs"),("RETOUR BP","#5b6673","des boutons-poussoirs","vers la borne A1"),("RETOUR LAMPE",ORA,"de la borne 2","vers les lampes"))):
    y=50+r*76; carte(s,392,y,232,68)
    trait(s,f"M408 {y+34} H440","blanc" if r==1 else c,6)
    s.t(452,y+26,t,11.5,True,c,"start"); s.t(452,y+46,l1,9.5,False,INK,"start"); s.t(452,y+61,l2,9.5,False,INK,"start")
s.t(320,290,"Une seule phase pour la commande et la puissance",11,True)
s.t(320,314,"A2 au neutre · borne 1 à la phase",11,False,INK)
bande(s,336,52,["À chaque bouton-poussoir : 2 fils, la phase et le retour","Le montage le plus courant en logement"],10.5)
s.ecrire("c18-3fils.svg")

s=S("Le montage 4 fils","Montage 4 fils du télérupteur : la commande et la puissance sont deux circuits séparés, deux conducteurs pour chacun",640,420)
s.panneau(16,44,296,250); s.panneau(328,44,296,250)
s.t(164,72,"COMMANDE",14,True,BLUE); s.t(476,72,"PUISSANCE",14,True,ORA)
inter_mural(s,90,150,52); trait(s,"M122 140 H236",RED,5); trait(s,"M122 160 H236","blanc",4)
s.a('<rect x="236" y="118" width="54" height="62" rx="8" fill="#e8eaed" stroke="#7d858e"/>'); s.t(263,155,"A1",11,True)
s.t(164,214,"2 conducteurs",13,True); s.t(164,238,"son alimentation",10.5); s.t(164,258,"et le retour des BP",10.5)
s.a('<rect x="350" y="118" width="54" height="62" rx="8" fill="#e8eaed" stroke="#7d858e"/>'); s.t(377,155,"1-2",11,True)
trait(s,"M404 140 H520",RED,5); trait(s,"M404 160 H520",ORA,5); dcl(s,560,104,True,False)
s.t(476,214,"2 conducteurs",13,True); s.t(476,238,"la phase",10.5); s.t(476,258,"et le retour lampe",10.5)
s.t(320,330,"Deux circuits séparés : 2 + 2 = 4 fils",12,True)
bande(s,348,46,["Utile quand la commande a sa propre alimentation"],11)
s.ecrire("c18-4fils.svg")

s=S("La minuterie : elle éteint toute seule","Chronogramme de la minuterie : un appui sur le bouton-poussoir allume la lampe, qui s'éteint seule une fois la durée réglée écoulée")
inter_mural(s,64,110,44); ampoule(s,64,206,18)
trait(s,"M120 120 H560",GR,2); trait(s,"M120 226 H560",GR,2)
s.a(f'<path d="M120 120 H200 V84 H226 V120 H560" fill="none" stroke="{INK}" stroke-width="3"/>')
s.a(f'<path d="M120 226 H200 V182 H470 V226 H560" fill="#fff1c2" stroke="#e0a800" stroke-width="3"/>')
s.t(213,74,"appui",11,True); s.t(335,208,"ALLUMÉ",13,True,"#b07a00"); s.t(160,250,"éteint",10.5,False,GR); s.t(515,250,"éteint",10.5,False,GR)
s.a(f'<path d="M200 270 H470" stroke="{INK}" stroke-width="1.8"/><path d="M200 262 V278 M470 262 V278" stroke="{INK}" stroke-width="1.8"/>'); s.t(335,294,"durée réglée",12,True)
s.t(590,124,"t",11,False,GR,"end")
s.t(320,330,"Escaliers, couloirs, parties communes",11.5,False,GR)
bande(s,344,46,["Boutons-poussoirs en parallèle, comme pour un télérupteur"],11)
s.ecrire("c18-minuterie.svg")

s=S("Quel montage pour quel besoin ?","Choisir le montage : un endroit, simple allumage ; deux endroits, va-et-vient ; trois endroits et plus, télérupteur ; extinction automatique, minuterie",640,410)
for r,(t,d,kind,n) in enumerate((("1 ENDROIT","simple allumage","simple",1),("2 ENDROITS","va-et-vient","simple",2),("3 ENDROITS ET PLUS","télérupteur","bp",3),("EXTINCTION AUTO","minuterie","bp",1))):
    y=44+r*86; carte(s,16,y,608,78)
    for k in range(n): inter_mural(s,52+k*50,y+39,40,kind)
    if r==3: s.a(f'<circle cx="112" cy="{y+39}" r="18" fill="#fff" stroke="{INK}" stroke-width="2.4"/><path d="M112 {y+27} V{y+39} H122" stroke="{INK}" stroke-width="2.4" fill="none"/>')
    s.t(220,y+34,t,12.5,True,AMB,"start"); s.t(220,y+58,d,12.5,True,INK,"start")
s.t(320,396,"Le besoin décide du montage, pas l'habitude",11.5,True)
s.ecrire("c18-choix.svg")
print("module 18 : 7 images")

# =====================================================================
# BLOC 5 — outils : soleil, maison, panneau, voiture, borne, chauffe-eau
# =====================================================================
s_DEFS_PV='''<linearGradient id="cellule" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b4a8a"/><stop offset="1" stop-color="#16285a"/></linearGradient>
<linearGradient id="cuve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b5e"/><stop offset=".55" stop-color="#ffb3a0"/><stop offset="1" stop-color="#7fb8f0"/></linearGradient>'''
DEFS=DEFS.replace("</defs>",s_DEFS_PV+"\n</defs>")
def soleil(s,cx,cy,r=22):
    s.a("".join(f'<path d="M{cx+math.cos(a)*(r+6):.1f} {cy+math.sin(a)*(r+6):.1f} L{cx+math.cos(a)*(r+15):.1f} {cy+math.sin(a)*(r+15):.1f}" stroke="#f2a20c" stroke-width="3.5" stroke-linecap="round"/>' for a in [k*math.pi/6 for k in range(12)]))
    s.a(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#ffd23f" stroke="#f2a20c" stroke-width="2"/>')
def maison(s,x,y,w,h):
    s.a(f'<g filter="url(#ombre)"><path d="M{x} {y+h*.38} L{x+w/2} {y} L{x+w} {y+h*.38} V{y+h} H{x} Z" fill="#fff" stroke="#8d949c" stroke-width="2"/></g><path d="M{x-6} {y+h*.4} L{x+w/2} {y-4} L{x+w+6} {y+h*.4}" fill="none" stroke="#b85a08" stroke-width="6" stroke-linejoin="round"/><rect x="{x+w*.42:.1f}" y="{y+h*.64:.1f}" width="{w*.16:.1f}" height="{h*.36:.1f}" fill="#c9bfa9"/>')
def panneau_pv(s,x,y,w,h,nx=4,ny=6,cadre=True):
    s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="2" fill="#c3c8ce" stroke="#7d858e"/>')
    cw=(w-4)/nx; ch=(h-4)/ny
    for i in range(nx):
        for j in range(ny): s.a(f'<rect x="{x+2+i*cw+.6:.1f}" y="{y+2+j*ch+.6:.1f}" width="{cw-1.2:.1f}" height="{ch-1.2:.1f}" fill="url(#cellule)"/>')
def voiture(s,x,y,k=1.0):
    s.a(f'<g transform="translate({x} {y}) scale({k})"><path d="M0 50 V34 Q2 26 12 24 L40 20 L62 4 Q68 0 80 0 H128 Q138 0 146 8 L164 24 Q178 26 180 36 V50 Z" fill="#4a78c2" stroke="#2c4f8a" stroke-width="2"/><path d="M66 20 L80 6 H104 V20 Z M110 20 V6 H128 Q134 6 138 10 L150 20 Z" fill="#cfe3f7"/><circle cx="40" cy="52" r="14" fill="#2b3036"/><circle cx="40" cy="52" r="6" fill="#aab1b9"/><circle cx="144" cy="52" r="14" fill="#2b3036"/><circle cx="144" cy="52" r="6" fill="#aab1b9"/><rect x="158" y="28" width="8" height="8" rx="2" fill="#1c2530"/></g>')
def borne_murale(s,x,y,k=1.0,ecran=True):
    s.a(f'<g transform="translate({x} {y}) scale({k})" filter="url(#ombre)"><rect width="60" height="90" rx="12" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/><rect x="12" y="12" width="36" height="16" rx="3" fill="#1f3a2a"/><circle cx="30" cy="54" r="12" fill="#2b3036"/><circle cx="30" cy="54" r="5" fill="#1e9e5a"/></g>')
def cumulus(s,x,y,w,h,coupe=False,pac=False):
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{w*.3:.1f}" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g>')
    if coupe:
        s.a(f'<rect x="{x+w*.1:.1f}" y="{y+h*.05:.1f}" width="{w*.8:.1f}" height="{h*.9:.1f}" rx="{w*.25:.1f}" fill="url(#cuve)" stroke="#aab1b9"/>')
    if pac: s.a(f'<rect x="{x+w*.08:.1f}" y="{y-h*.22:.1f}" width="{w*.84:.1f}" height="{h*.24:.1f}" rx="8" fill="#e4e7ea" stroke="#8d949c" stroke-width="2"/><circle cx="{x+w/2:.1f}" cy="{y-h*.1:.1f}" r="{h*.08:.1f}" fill="#fff" stroke="#7d858e" stroke-width="2"/>')
def onduleur_box(s,x,y,w=90,h=110):
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g><rect x="{x+14}" y="{y+16}" width="{w-28}" height="22" rx="3" fill="#1f3a2a"/><path d="M{x+18} {y+64} H{x+38} M{x+50} {y+64} q8 -12 16 0 t16 0" fill="none" stroke="{INK}" stroke-width="2.5"/><path d="M{x+18} {y+70} H{x+38}" stroke="{INK}" stroke-width="2" stroke-dasharray="4 3"/>'.replace("t16 0",f"t{(w-66)/1:.0f} 0") if False else f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g><rect x="{x+14}" y="{y+16}" width="{w-28}" height="22" rx="3" fill="#1f3a2a"/><path d="M{x+14} {y+66} H{x+34}" stroke="{INK}" stroke-width="2.5"/><path d="M{x+14} {y+73} H{x+34}" stroke="{INK}" stroke-width="2" stroke-dasharray="4 3"/><path d="M{x+44} {y+86} L{x+w-44} {y+50}" stroke="{GR}" stroke-width="1.5"/><path d="M{x+w-38} {y+88} q6 -12 12 0 t12 0" fill="none" stroke="{INK}" stroke-width="2.5"/>')
def cartes3(s,items,y=44,h=250,titre_c=AMB):
    for i,it in enumerate(items):
        x=16+204*i; cx=x+98; carte(s,x,y,196,h); s.t(cx,y+28,it[0],12.5,True,it[1] if len(it)>1 and it[1] else titre_c)

# =====================================================================
# MODULE 19 — eau chaude et heures creuses
# =====================================================================
s=S("Quatre façons de chauffer l'eau","Quatre types de chauffe-eau : instantané, qui chauffe au passage ; à accumulation, qui stocke dans une cuve ; thermodynamique, qui prend les calories de l'air ; solaire, avec des capteurs et un appoint")
for i,(t,d) in enumerate((("instantané","au passage"),("accumulation","dans une cuve"),("thermodynamique","calories de l'air"),("solaire","capteurs + appoint"))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,280)
    if i==0:
        s.a(f'<g filter="url(#ombre)"><rect x="{cx-30}" y="80" width="60" height="96" rx="8" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g><rect x="{cx-18}" y="94" width="36" height="12" rx="3" fill="#1f3a2a"/>')
        trait(s,f"M{cx-14} 176 V206",BLUE,6); trait(s,f"M{cx+14} 176 V206",RED,6)
    elif i==1: cumulus(s,cx-34,70,68,150)
    elif i==2: cumulus(s,cx-34,104,68,120,False,True); s.a(f'<path d="M{cx+38} 86 q8 -6 16 0 t16 0 M{cx+38} 98 q8 -6 16 0" fill="none" stroke="{BLUE}" stroke-width="2" stroke-linecap="round"/>'.replace(f"M{cx+38}",f"M{cx+36}"))
    else:
        soleil(s,cx+38,82,13); s.a(f'<g transform="rotate(-24 {cx} 150)">'); panneau_pv(s,cx-50,132,96,44,6,3); s.a('</g>'); cumulus(s,cx-24,190,48,70)
    s.t(cx,284,t,11 if i!=2 else 10,True); s.t(cx,306,d,10,False,GR)
bande(s,338,46,["ECS : eau chaude sanitaire"],12.5)
s.ecrire("c19-types.svg")

s=S("Chauffer au passage ou stocker ?","Chauffe-eau instantané : il chauffe l'eau au moment où elle passe, sans réserve, avec une forte puissance pendant peu de temps. À accumulation : il chauffe lentement une réserve d'eau dans une cuve isolée",640,410)
s.panneau(16,44,296,346); s.panneau(328,44,296,346)
s.t(164,72,"INSTANTANÉ",14,True,RED); s.t(476,72,"ACCUMULATION",14,True,BLUE)
s.a('<g filter="url(#ombre)"><rect x="124" y="92" width="80" height="110" rx="10" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g><rect x="138" y="106" width="52" height="16" rx="3" fill="#1f3a2a"/>')
for k in range(4): s.a(f'<path d="M{142+k*12} 186 l6 -12 l-6 -12 l6 -12" fill="none" stroke="#e8590c" stroke-width="2.5"/>'.replace(" l-6"," l-6").replace("M","M",1))
trait(s,"M144 202 V232 H90",BLUE,7); trait(s,"M184 202 V232 H238",RED,7)
for k in range(3): s.a(f'<path d="M{246+k*8} 240 q-3 8 0 12" fill="none" stroke="#3d9be9" stroke-width="2"/>')
s.t(164,272,"chauffe l'eau au moment",11); s.t(164,292,"où elle passe",11); s.t(164,318,"pas de réserve",11.5,True); s.t(164,346,"forte puissance,",10.5,False,RED); s.t(164,366,"pendant peu de temps",10.5,False,GR)
cumulus(s,438,90,76,150,True)
s.t(476,272,"chauffe lentement",11); s.t(476,292,"une réserve d'eau",11); s.t(476,318,"une cuve isolée",11.5,True); s.t(476,346,"puissance modérée,",10.5,False,BLUE); s.t(476,366,"pendant des heures",10.5,False,GR)
s.ecrire("c19-instant-accu.svg")

s=S("Le chauffe-eau à accumulation, de l'intérieur","Vue en coupe d'un chauffe-eau à accumulation : la cuve isolée où l'eau chaude monte en haut, la résistance qui chauffe l'eau, le thermostat qui coupe à la température réglée, l'arrivée d'eau froide avec son groupe de sécurité et le départ d'eau chaude",640,440)
s.a('<g filter="url(#ombre)"><rect x="220" y="50" width="160" height="320" rx="48" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g>')
s.a('<rect x="234" y="64" width="132" height="292" rx="40" fill="url(#cuve)" stroke="#aab1b9" stroke-width="2"/>')
s.a('<rect x="276" y="250" width="12" height="110" rx="4" fill="#5b6673"/><path d="M282 252 V200 q0 -8 6 -8 q6 0 6 8 V350" fill="none" stroke="#c9782f" stroke-width="7" stroke-linecap="round"/>')
s.a('<rect x="310" y="270" width="8" height="90" rx="3" fill="#8d949c"/><rect x="300" y="352" width="28" height="22" rx="4" fill="#d5d9de" stroke="#7d858e"/>')
trait(s,"M258 356 V400 H180",BLUE,8); s.a('<rect x="150" y="386" width="40" height="28" rx="5" fill="#2f6fd0" stroke="#1d4a94"/><rect x="164" y="378" width="12" height="10" fill="#1d4a94"/>')
s.a('<path d="M342 70 V44 H440" fill="none" stroke="#d92b2b" stroke-width="8" stroke-linejoin="round"/><path d="M342 66 V200" stroke="#d92b2b" stroke-width="5" opacity=".6"/>')
s.a('<rect x="232" y="290" width="12" height="8" fill="#8d949c"/>')
for k in range(3): s.a(f'<path d="M{262+k*24} 172 v-30 m-5 8 l5 -8 l5 8" fill="none" stroke="#d92b2b" stroke-width="2" opacity=".75"/>')
def rp(x1,y1,x2,y2,c=INK): s.a(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{c}" stroke-width="1.6"/><circle cx="{x1}" cy="{y1}" r="3" fill="{c}"/>')
rp(242,120,200,120); s.t(194,114,"cuve isolée",12,True,INK,"end"); s.t(194,134,"l'eau chaude monte en haut",10,False,GR,"end")
rp(286,210,200,210,"#b85a08"); s.t(194,204,"résistance",12,True,"#b85a08","end"); s.t(194,224,"elle chauffe l'eau",10,False,GR,"end")
rp(318,300,412,300); s.t(418,294,"thermostat",12,True,INK,"start"); s.t(418,314,"coupe à la température",10,False,GR,"start"); s.t(418,330,"réglée",10,False,GR,"start")
s.t(150,374,"eau froide",11,True,BLUE,"end"); s.t(146,430,"+ groupe de sécurité",10,False,GR,"start")
s.t(446,40,"eau chaude",11,True,RED,"start"); s.t(446,60,"vers les robinets",10,False,GR,"start")
s.t(370,412,"vue en coupe",9.5,False,GR,"end")
s.ecrire("c19-cumulus.svg")

s=S("Deux solutions économes","Chauffe-eau thermodynamique : une pompe à chaleur prend la chaleur de l'air, environ trois fois moins d'électricité, avec une résistance en appoint. Solaire : des capteurs sur le toit chauffent l'eau, avec un appoint électrique",640,410)
s.panneau(16,44,296,346); s.panneau(328,44,296,346)
s.t(164,72,"THERMODYNAMIQUE",13.5,True,BLUE); s.t(476,72,"SOLAIRE",13.5,True,AMB)
cumulus(s,126,124,76,130,False,True)
for k in range(3): s.a(f'<path d="M{216} {102+k*10} q8 -6 16 0 t16 0" fill="none" stroke="{BLUE}" stroke-width="2" stroke-linecap="round"/>')
s.t(164,280,"une pompe à chaleur",11); s.t(164,298,"prend la chaleur de l'air",10.5); s.t(164,324,"environ 3 fois moins",11,True,GRN); s.t(164,342,"d'électricité",11,True,GRN); s.t(164,370,"résistance en appoint",10,False,GR)
maison(s,410,130,130,110); soleil(s,580,98,15)
s.a('<g transform="rotate(-36 450 150)">'); panneau_pv(s,418,140,64,26,4,2); s.a('</g>')
s.t(476,280,"des capteurs sur le toit",11); s.t(476,298,"chauffent l'eau",10.5); s.t(476,324,"énergie gratuite",11,True,GRN); s.t(476,342,"quand il y a du soleil",10.5); s.t(476,370,"appoint électrique sinon",10,False,GR)
s.ecrire("c19-thermo-solaire.svg")

s=S("Le circuit du chauffe-eau","Circuit du chauffe-eau : circuit spécialisé en 2,5 mm², disjoncteur 20 A, protégé par un différentiel 30 mA du logement, raccordé sans prise de courant. Exemple : 2 300 W sous 230 V, 10 A",640,410)
coffret(s,30,56,124,150); rail(s,38,72,108,0.35); idiff(s,42,72,0.35,"40 A","AC",False); disj(s,92,72,0.35,"C20",None,True,False)
trait(s,"M154 120 H440",RED,6); trait(s,"M154 136 H440",BLUE,6); trait(s,"M154 152 H440","vj",6)
s.a('<rect x="436" y="108" width="36" height="56" rx="5" fill="#fff" stroke="#8d949c" stroke-width="2"/>')
cumulus(s,500,52,80,160)
s.t(456,186,"sortie de câble",9.5,False,GR)
for i,(v,l1,l2) in enumerate((("2,5 mm²","la section","des conducteurs"),("20 A","le disjoncteur","circuit spécialisé"),("30 mA","le différentiel","du logement"))):
    x=16+204*i; cx=x+98; carte(s,x,226,196,94); s.t(cx,256,v,16,True); s.t(cx,280,l1,10.5); s.t(cx,300,l2,10.5)
s.t(320,346,"2 300 W / 230 V = 10 A",13,True)
bande(s,360,40,["Un circuit pour lui seul, raccordé sans prise de courant"],11)
s.ecrire("c19-circuit.svg")

s=S("Le contacteur heures creuses : 3 positions","Le contacteur heures creuses, module de tableau, a trois positions : AUTO, il suit le signal du compteur ; 0, arrêt ; I, marche forcée",640,420)
s.a('<g filter="url(#ombre)"><rect x="262" y="48" width="116" height="200" rx="8" fill="url(#corps)" stroke="#b3b9c0"/></g><rect x="262" y="96" width="116" height="104" fill="url(#nez)" stroke="#c5cad0"/>')
for bx in (290,350):
    for by in (70,226): s.a(f'<use href="#borne" x="{bx}" y="{by}"/>')
s.a(f'<rect x="276" y="110" width="88" height="34" rx="17" fill="#d5d9de" stroke="#8d949c"/><rect x="278" y="112" width="30" height="30" rx="15" fill="url(#manette)"/>')
for xx,lab in ((293,"AUTO"),(322,"0"),(350,"I")): s.a(f'<text x="{xx}" y="164" text-anchor="middle" font-size="9.5" font-weight="800" fill="{INK}">{lab}</text>')
s.t(320,192,"HC",13,True,BLUE)
for i,(t,l1,l2,c) in enumerate((("AUTO","il suit le signal","du compteur",GRN),("0","arrêt","chauffe-eau coupé",GR),("I","marche forcée","chauffe tout de suite",AMB))):
    x=16+204*i; cx=x+98; carte(s,x,262,196,90); s.t(cx,290,t,15,True,c); s.t(cx,314,l1,11,True); s.t(cx,334,l2,10,False,GR)
s.t(320,374,"Bobine A1 – A2 · contact de puissance en série avec le chauffe-eau",10,False,GR)
bande(s,384,30,["Après une marche forcée, on revient toujours sur AUTO"],10.5)
s.ecrire("c19-contacteur.svg")

s=S("Le contacteur heures creuses : le câblage","Câblage du contacteur heures creuses : commande, la phase passe par un disjoncteur 2 A, le contact C1-C2 du compteur, puis la bobine A1-A2 ; puissance, un disjoncteur 20 A et le contact du contacteur alimentent le chauffe-eau",640,420)
rails(s,30,600,76,320)
trait(s,"M140 76 V96",RED,4); g_(s,140,96,0,sym_disj()); s.t(160,132,"2 A",11,True,INK,"start")
trait(s,"M140 156 V172",RED,4)
s.a(f'<rect x="96" y="162" width="88" height="70" rx="8" fill="#c5d93a" opacity=".35" stroke="#93a51f" stroke-dasharray="5 4"/>'); g_(s,140,170,0,sym_inter(False).replace("V60","V56")); s.t(90,204,"compteur",10,False,GR,"end")
s.t(180,212,"C1 – C2",10.5,True,INK,"start")
trait(s,"M140 226 V246",RED,4); g_(s,140,246,0,sym_bobine()); s.t(166,258,"A1",10,True,INK,"start"); s.t(166,278,"A2",10,True,INK,"start")
trait(s,"M140 282 V320",BLUE,4)
trait(s,"M440 76 V96",RED,4); g_(s,440,96,0,sym_disj()); s.t(460,132,"20 A",11,True,INK,"start")
trait(s,"M440 156 V172",RED,4); g_(s,440,172,0,sym_inter(False)); s.t(462,206,"contact",10.5,True,INK,"start")
trait(s,"M440 232 V246",RED,4)
s.a('<rect x="418" y="246" width="44" height="44" rx="10" fill="#fff" stroke="#1c2530" stroke-width="2.6"/>'); s.t(440,274,"ECS",10,True); s.t(474,274,"chauffe-eau",10,False,GR,"start")
trait(s,"M440 290 V320",BLUE,4)
s.a(f'<path d="M168 264 H300 V202 H452" fill="none" stroke="{GR}" stroke-width="1.6" stroke-dasharray="5 4"/>')
s.t(140,356,"COMMANDE",12.5,True,BLUE); s.t(440,356,"PUISSANCE",12.5,True,ORA)
s.t(320,396,"Le contact C1-C2 du compteur se ferme en heures creuses",10,False,GR)
s.ecrire("c19-cablage.svg")
print("module 19 : 7 images")

# =====================================================================
# MODULE 20 — recharge de véhicule et domotique
# =====================================================================
s=S("IRVE : du tableau au véhicule","IRVE, infrastructure de recharge pour véhicules électriques : du tableau, un circuit dédié et ses protections, jusqu'au point de recharge, prise renforcée ou borne murale, puis le chargeur et la batterie du véhicule",640,430)
coffret(s,24,70,118,150); rail(s,32,86,102,0.33); idiff(s,36,86,0.33,"40 A","A",False); disj(s,82,86,0.33,"C40",None,True,False)
trait(s,"M142 150 H262",INK,7)
s.a('<rect x="236" y="56" width="14" height="190" fill="#e3dccf"/>'); borne_murale(s,262,100,1.0)
s.a(f'<path d="M292 190 Q300 240 360 234 Q420 228 436 196" fill="none" stroke="#2b3036" stroke-width="6" stroke-linecap="round"/>')
voiture(s,404,152,1.2)
for i,(t,l1,l2) in enumerate((("TABLEAU","un circuit dédié","et ses protections"),("RECHARGE","prise renforcée","ou borne murale"),("VÉHICULE","son chargeur","et sa batterie"))):
    cx=[84,292,512][i]; s.t(cx,266,t,12.5,True,AMB); s.t(cx,288,l1,10.5); s.t(cx,306,l2,10.5)
bande(s,326,36,["IRVE : infrastructure de recharge pour véhicules électriques"],10.5)
s.t(320,390,"Une charge dure des heures, à pleine puissance",11,True)
s.t(320,412,"C'est ce qui la rend exigeante pour l'installation",10,False,GR)
s.ecrire("c20-irve.svg")

s=S("Les modes de charge","Les quatre modes de charge : mode 1, prise ordinaire sans contrôle, à proscrire ; mode 2, prise et boîtier de contrôle sur le câble ; mode 3, borne dédiée qui dialogue avec le véhicule ; mode 4, courant continu, charge rapide",640,420)
for r,(t,d1,d2,c) in enumerate((("MODE 1","prise ordinaire, sans contrôle","à proscrire pour une voiture",RED),("MODE 2","prise + boîtier sur le câble","charge lente, à la maison",AMB),("MODE 3","borne dédiée","elle dialogue avec le véhicule",GRN),("MODE 4","courant continu","charge rapide, bornes publiques",BLUE))):
    y=44+r*92; carte(s,16,y,608,84)
    if r<2:
        prise_ic(s,52,y+42,40); s.a(f'<path d="M72 {y+42} H168" stroke="#2b3036" stroke-width="5"/>')
        if r==1: s.a(f'<rect x="100" y="{y+28}" width="40" height="28" rx="5" fill="#f4f5f7" stroke="#5b6673" stroke-width="2"/><circle cx="112" cy="{y+42}" r="3.5" fill="#1e9e5a"/>')
        if r==0: s.a(f'<path d="M156 {y+20} l24 24 M180 {y+20} l-24 24" stroke="{RED}" stroke-width="5" stroke-linecap="round"/>')
    elif r==2: borne_murale(s,42,y+8,0.74); s.a(f'<path d="M86 {y+56} Q130 {y+76} 168 {y+48}" fill="none" stroke="#2b3036" stroke-width="5"/>')
    else: s.a(f'<g filter="url(#ombre)"><rect x="44" y="{y+6}" width="46" height="74" rx="6" fill="#2f6fd0" stroke="#1d4a94"/></g><rect x="52" y="{y+16}" width="30" height="16" rx="2" fill="#cfe3f7"/><text x="67" y="{y+62}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">DC</text>'); s.a(f'<path d="M90 {y+56} Q130 {y+76} 168 {y+48}" fill="none" stroke="#2b3036" stroke-width="7"/>')
    s.t(200,y+28,t,13,True,c,"start"); s.t(200,y+52,d1,12,True,INK,"start"); s.t(200,y+72,d2,10.5,False,GR,"start")
s.ecrire("c20-modes.svg")

s=S("Plus de puissance, moins d'attente","Puissances de recharge : prise ordinaire 8 A, 1,8 kW ; prise renforcée 14 A, 3,2 kW ; borne monophasée 32 A, 7,4 kW ; borne triphasée, 22 kW",640,410)
for i,(p,a,d,kw) in enumerate((("1,8 kW","8 A","prise ordinaire",1.8),("3,2 kW","14 A","prise renforcée",3.2),("7,4 kW","32 A","borne monophasée",7.4),("22 kW","triphasé","borne triphasée",22))):
    cx=96+150*i; hh=max(16,kw/22*190)
    s.a(f'<rect x="{cx-34}" y="{262-hh:.0f}" width="68" height="{hh:.0f}" rx="6" fill="{["#9aa1a9","#c98a00","#2f6fd0","#1e9e5a"][i]}"/>')
    s.t(cx,254-hh,p,15,True); s.t(cx,290,a,12,True); s.t(cx,312,d,10.5,False,GR)
s.a('<path d="M40 262 H600" stroke="#1c2530" stroke-width="2"/>')
bande(s,336,50,["P = U × I : 230 V × 32 A = 7 360 W, soit 7,4 kW"],12)
s.ecrire("c20-puissances.svg")

s=S("Le circuit de recharge","Circuit de recharge : dédié ; protégé par un différentiel 30 mA, type A au minimum, type B selon la borne ; au-delà de 3,7 kW, la qualification IRVE est obligatoire",640,430)
for i,(t,c,l1,l2) in enumerate((("DÉDIÉ",INK,"un circuit","rien que pour lui"),("30 mA",BLUE,"type A minimum","type B selon la borne"),("> 3,7 kW",AMB,"qualification","obligatoire"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250); s.t(cx,72,t,15,True,c)
    if i==0: disj(s,cx-22,88,0.5,"C40")
    elif i==1: idiff(s,cx-38,88,0.55,"40 A","A")
    else: s.a(f'<rect x="{cx-40}" y="96" width="80" height="104" rx="6" fill="#fff" stroke="#8d949c" stroke-width="2"/><path d="M{cx-26} 120 H{cx+26} M{cx-26} 138 H{cx+26} M{cx-26} 156 H{cx+10}" stroke="#aab1b9" stroke-width="3"/><circle cx="{cx+22}" cy="184" r="12" fill="#1e9e5a"/><path d="M{cx+16} 184 l4 4 l8 -9" fill="none" stroke="#fff" stroke-width="2.6"/>')
    s.t(cx,252,l1,11.5,True); s.t(cx,274,l2,10.5,False,GR)
s.t(320,322,"Méthode aval : son calibre compte EN ENTIER",11.5,True)
s.t(320,346,"La notice de la borne fixe le type de différentiel",10.5,False,GR)
bande(s,362,52,["Prise renforcée : 2,5 mm², 20 A","Borne 32 A : 6 mm² au moins"],11)
s.ecrire("c20-circuit.svg")

s=S("La domotique : informer, décider, agir","Domotique : des capteurs informent, une commande décide, des actionneurs agissent. Exemple : il fait nuit, la commande ferme les volets",640,430)
for i,(t,l1,l2) in enumerate((("CAPTEURS","ils informent","détecteur, sonde, bouton"),("COMMANDE","elle décide","centrale, box, appli"),("ACTIONNEURS","ils agissent","relais, variateur, moteur"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,224); s.t(cx,72,t,13,True,AMB)
    if i==0: s.a(f'<circle cx="{cx}" cy="134" r="34" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/><circle cx="{cx}" cy="134" r="18" fill="#e4e7ea" stroke="#aab1b9"/><circle cx="{cx}" cy="134" r="6" fill="#d92b2b"/>')
    elif i==1: s.a(f'<g filter="url(#ombre)"><rect x="{cx-46}" y="104" width="92" height="62" rx="12" fill="#fff" stroke="#8d949c" stroke-width="2"/></g><circle cx="{cx-24}" cy="135" r="5" fill="#1e9e5a"/><circle cx="{cx-8}" cy="135" r="5" fill="#1e9e5a"/><circle cx="{cx+8}" cy="135" r="5" fill="#e4e7ea"/>')
    else:
        s.a(f'<rect x="{cx-46}" y="96" width="92" height="80" rx="4" fill="#cfe3f7" stroke="#8d949c" stroke-width="2"/>')
        for k in range(5): s.a(f'<rect x="{cx-44}" y="{98+k*10}" width="88" height="8.5" fill="#e4e7ea" stroke="#aab1b9" stroke-width=".8"/>')
    s.t(cx,208,l1,11.5,True); s.t(cx,230,l2,9.5,False,GR)
for x in (216,420): s.a(f'<path d="M{x-8} 134 H{x+8}" stroke="{AMB}" stroke-width="4"/><polygon points="{x+6},126 {x+18},134 {x+6},142" fill="{AMB}"/>')
bande(s,282,40,["Exemple : il fait nuit → la commande ferme les volets"],11)
s.t(320,354,"La commande n'est plus câblée « en dur » : elle se programme",10.5,True)
s.t(320,380,"Éclairage, volets, chauffage, alarme, recharge",10.5,False,GR)
s.ecrire("c20-domotique.svg")

s=S("Filaire ou radio ?","Domotique filaire : un câble bus relie tous les éléments, fiable et sans piles, à prévoir dès la construction. Radio : les éléments communiquent sans fil, faciles à ajouter, idéal en rénovation, portée et piles à surveiller",640,420)
s.panneau(16,44,296,356); s.panneau(328,44,296,356)
s.t(164,72,"FILAIRE (BUS)",13.5,True,BLUE); s.t(476,72,"RADIO",13.5,True,AMB)
trait(s,"M40 140 H290","#2e7d32",6)
for k in range(4):
    cx=64+66*k; s.a(f'<path d="M{cx} 140 V116" stroke="#2e7d32" stroke-width="4"/><rect x="{cx-18}" y="88" width="36" height="30" rx="6" fill="#fff" stroke="#8d949c" stroke-width="2"/>')
s.t(164,186,"un câble dédié relie",11); s.t(164,206,"tous les éléments",11); s.t(164,240,"fiable, sans piles",11.5,True,GRN); s.t(164,276,"à prévoir",11,True); s.t(164,296,"dès la construction",11)
s.a('<g filter="url(#ombre)"><rect x="452" y="128" width="48" height="40" rx="8" fill="#fff" stroke="#8d949c" stroke-width="2"/></g>')
for r in (26,40,54): s.a(f'<path d="M{476-r*.7:.0f} {148-r*.7:.0f} A{r} {r} 0 0 1 {476+r*.7:.0f} {148-r*.7:.0f}" fill="none" stroke="{AMB}" stroke-width="2.4" opacity=".8"/>')
for x in (372,580): s.a(f'<rect x="{x-16}" y="136" width="32" height="26" rx="6" fill="#fff" stroke="#8d949c" stroke-width="2"/>')
s.t(476,186,"les éléments",11); s.t(476,206,"communiquent sans fil",11); s.t(476,240,"facile à ajouter",11.5,True,GRN); s.t(476,276,"idéal en rénovation,",11,True); s.t(476,296,"portée et piles à surveiller",10,False,GR)
s.t(320,340,"Scénario : un seul ordre, plusieurs actions",11,True)
s.t(320,368,"Toujours garder une commande locale",10.5,False,GR)
s.ecrire("c20-liaisons.svg")

s=S("Piloter l'énergie","Piloter l'énergie : le délestage coupe un appareil non prioritaire pour ne pas dépasser la puissance du contrat ; la programmation décale vers les heures creuses ; le suivi montre ce que l'on consomme",640,420)
for r,(t,d1,d2) in enumerate((("DÉLESTAGE","couper le non-prioritaire","pour ne pas dépasser la puissance du contrat"),("PROGRAMMATION","décaler vers les heures creuses","chauffe-eau, recharge du véhicule"),("SUIVI","voir ce que l'on consomme","pour agir au bon endroit"))):
    y=44+r*94; carte(s,16,y,608,86)
    if r==0: s.a(f'<path d="M50 {y+66} A38 38 0 0 1 126 {y+66}" fill="none" stroke="#e4e7ea" stroke-width="12"/><path d="M50 {y+66} A38 38 0 0 1 116 {y+42}" fill="none" stroke="#d9480f" stroke-width="12"/><path d="M88 {y+66} L112 {y+44}" stroke="{INK}" stroke-width="3"/>')
    elif r==1: s.a(f'<circle cx="88" cy="{y+43}" r="30" fill="#fff" stroke="{INK}" stroke-width="3"/><path d="M88 {y+43} A30 30 0 0 1 112 {y+61} L88 {y+43} Z" fill="#cfe3f7"/><path d="M88 {y+23} V{y+43} H104" fill="none" stroke="{INK}" stroke-width="3"/>')
    else:
        for k,hh in enumerate((20,34,26,46,30)): s.a(f'<rect x="{58+k*14}" y="{y+70-hh}" width="10" height="{hh}" rx="2" fill="#2f6fd0"/>')
    s.t(160,y+30,t,13,True,AMB,"start"); s.t(160,y+54,d1,12,True,INK,"start"); s.t(160,y+74,d2,10,False,GR,"start")
bande(s,334,52,["La domotique commande ;","les protections, elles, restent au tableau"],11)
s.ecrire("c20-energie.svg")
print("module 20 : 7 images")

# =====================================================================
# MODULE 21 — le photovoltaïque
# =====================================================================
s=S("De la lumière au courant","L'effet photovoltaïque : le soleil éclaire une cellule en silicium, qui produit directement un courant continu, avec un plus et un moins",640,420)
for i,(t,l1,l2) in enumerate((("LUMIÈRE","le soleil éclaire","la cellule"),("CELLULE","en silicium :","effet photovoltaïque"),("COURANT","continu","un + et un −"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,230); s.t(cx,72,t,13,True,AMB)
    if i==0: soleil(s,cx,140,30)
    elif i==1:
        s.a(f'<rect x="{cx-50}" y="96" width="100" height="100" rx="4" fill="url(#cellule)" stroke="#16285a"/>')
        for k in range(5): s.a(f'<path d="M{cx-50} {106+k*20} H{cx+50}" stroke="#c3c8ce" stroke-width="1.2"/>')
        s.a(f'<path d="M{cx-18} 96 V196 M{cx+18} 96 V196" stroke="#e4e7ea" stroke-width="3"/>')
    else:
        s.a(f'<path d="M{cx-60} 126 H{cx+60}" stroke="{RED}" stroke-width="6"/><path d="M{cx-60} 166 H{cx+60}" stroke="{INK}" stroke-width="6"/>')
        s.t(cx-74,132,"+",16,True,RED); s.t(cx-74,172,"−",16,True)
    s.t(cx,226,l1,11.5,True); s.t(cx,248,l2,10.5)
for x in (216,420): s.a(f'<path d="M{x-8} 140 H{x+8}" stroke="{AMB}" stroke-width="4"/><polygon points="{x+6},132 {x+18},140 {x+6},148" fill="{AMB}"/>')
s.t(320,302,"Pas de pièce en mouvement, pas de bruit, pas de combustible",10.5,False,GR)
bande(s,318,40,["Du courant CONTINU, comme une pile"],12)
s.t(320,390,"Dès qu'il y a de la lumière, il y a de la tension",11,True,RED)
s.ecrire("c21-effet.svg")

s=S("De la cellule au champ de panneaux","De la cellule au champ : la cellule est la brique de base, le module ou panneau en assemble plusieurs, le champ réunit plusieurs modules. Huit modules de 400 Wc font 3 200 Wc, soit 3,2 kWc",640,430)
for i,(t,l1,l2) in enumerate((("CELLULE","la brique","de base"),("MODULE","des cellules","assemblées : le panneau"),("CHAMP","plusieurs modules","reliés entre eux"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,236); s.t(cx,72,t,13,True,AMB)
    if i==0: s.a(f'<rect x="{cx-30}" y="104" width="60" height="60" rx="3" fill="url(#cellule)"/><path d="M{cx-11} 104 V164 M{cx+11} 104 V164" stroke="#e4e7ea" stroke-width="2"/>')
    elif i==1: panneau_pv(s,cx-34,88,68,108,6,10)
    else:
        for k in range(8): panneau_pv(s,cx-80+(k%4)*40,96+(k//4)*56,36,52,3,5)
    s.t(cx,232,l1,11.5,True); s.t(cx,254,l2,10 if i==1 else 10.5)
bande(s,296,40,["8 modules de 400 Wc = 3 200 Wc = 3,2 kWc"],12)
s.t(320,366,"Wc : watt-crête, la puissance en plein soleil",11,True)
s.t(320,392,"La puissance réelle varie avec le soleil, l'orientation et l'ombre",10,False,GR)
s.ecrire("c21-wc.svg")

s=S("Série ou parallèle : rappel du bloc 1","Modules en série : les tensions s'additionnent, huit fois 40 V font 320 V, le même courant partout. En parallèle : les courants s'additionnent, deux fois 10 A font 20 A, la même tension pour tous",640,420)
s.panneau(16,44,296,318); s.panneau(328,44,296,318)
s.t(164,72,"EN SÉRIE",13.5,True,AMB); s.t(476,72,"EN PARALLÈLE",13.5,True,BLUE)
for k in range(8):
    x=32+33*k; panneau_pv(s,x,96,28,46,2,4)
    if k<7: s.a(f'<path d="M{x+28} 119 H{x+33}" stroke="{RED}" stroke-width="2.5"/>')
s.a(f'<path d="M32 119 V160 H70 M292 119 V160 H254" fill="none" stroke="{INK}" stroke-width="2.5"/>')
s.t(164,164,"8 × 40 V",15,True); s.t(164,196,"= 320 V",17,True,RED)
s.t(164,234,"les tensions s'additionnent",10.5,True); s.t(164,256,"le même courant partout",10,False,GR)
for k in range(2):
    x=420+80*k-18; panneau_pv(s,x,108,40,58,3,5)
    s.a(f'<path d="M{x+20} 108 V96 M{x+20} 166 V178" stroke="{INK}" stroke-width="2.5"/>')
s.a(f'<path d="M422 96 H542 M422 178 H542" stroke="{INK}" stroke-width="2.5"/>')
s.t(476,214,"2 × 10 A = 20 A",15,True,BLUE)
s.t(476,246,"les courants s'additionnent",10.5,True); s.t(476,268,"la même tension pour tous",10,False,GR)
bande(s,376,36,["Une suite de modules en série s'appelle une chaîne"],11)
s.ecrire("c21-serie.svg")

s=S("L'onduleur : du continu à l'alternatif","L'onduleur convertit le courant continu des panneaux, à tension variable, en courant alternatif 230 V 50 Hz, synchronisé au réseau. Si le réseau est coupé, il s'arrête : c'est le découplage",640,430)
panneau_pv(s,40,80,110,150,4,6)
trait(s,"M150 140 H250",RED,5); trait(s,"M150 160 H250",INK,5)
onduleur_box(s,250,96,110,130)
trait(s,"M360 140 H470",RED,5); trait(s,"M360 160 H470",BLUE,5)
maison(s,470,86,130,140)
for i,(t,l1,l2,cx) in enumerate((("PANNEAUX","courant continu","tension variable",95),("ONDULEUR","il convertit","et se synchronise",305),("INSTALLATION","alternatif","230 V · 50 Hz",535))):
    s.t(cx,256,t,12,True,AMB); s.t(cx,278,l1,10.5); s.t(cx,298,l2,10.5,i==2)
bande(s,316,58,["Si le réseau est coupé, l'onduleur s'arrête","c'est le découplage : il protège ceux qui travaillent sur le réseau"],10)
s.t(320,404,"Micro-onduleurs : un petit onduleur sous chaque panneau",10.5,False,GR)
s.ecrire("c21-onduleur.svg")

s=S("Que fait-on de l'électricité produite ?","Trois usages de la production : autoconsommation, on consomme sa production et le réseau fournit le reste ; vente du surplus, on vend ce que le logement ne consomme pas ; vente totale, tout part sur le réseau et le logement achète son électricité",640,420)
for r,(t,d1,d2) in enumerate((("AUTOCONSOMMATION","on consomme sa production","sinon, le réseau fournit"),("VENTE DU SURPLUS","on vend le reste","ce que le logement ne consomme pas"),("VENTE TOTALE","tout part sur le réseau","le logement achète toute son électricité"))):
    y=44+r*96; carte(s,16,y,608,88)
    maison(s,40,y+18,62,58)
    if r in (0,1): s.a(f'<path d="M72 {y+14} V{y+2}" stroke="{AMB}" stroke-width="0"/>'); soleil(s,124,y+30,10)
    if r==1 or r==2: s.a(f'<path d="M116 {y+60} H160" stroke="{GRN}" stroke-width="4"/><polygon points="158,{y+53} 170,{y+60} 158,{y+67}" fill="{GRN}"/>')
    if r==2: soleil(s,124,y+30,10)
    s.t(196,y+30,t,12.5,True,AMB,"start"); s.t(196,y+54,d1,12,True,INK,"start"); s.t(196,y+74,d2,10,False,GR,"start")
bande(s,340,54,["Le soleil produit à midi ;","le logement consomme surtout matin et soir"],11)
s.ecrire("c21-usages.svg")

s=S("Le continu : trois dangers à part","Trois dangers du photovoltaïque : la source est toujours active dès qu'il fait jour ; la tension continue atteint plusieurs centaines de volts, au-delà de la limite de 120 V ; un arc en continu ne s'éteint pas tout seul",640,420)
for i,(t,l1,l2) in enumerate((("TOUJOURS ACTIF","sous tension dès qu'il fait jour|un panneau ne s'éteint pas",""),("TENSION ÉLEVÉE","plusieurs centaines de volts|limite en continu : 120 V",""),("ARC ÉLECTRIQUE","il ne s'éteint pas tout seul|le continu ne passe|jamais par zéro",""))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,264); s.t(cx,72,t,12,True,RED)
    if i==0: soleil(s,cx-26,120,16); panneau_pv(s,cx-6,118,60,56,4,4)
    elif i==1: s.a(f'<path d="M{cx} 92 L{cx+52} 184 H{cx-52} Z" fill="#ffd23f" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/><path d="M{cx+6} 114 L{cx-12} 150 H{cx+4} L{cx-6} 176 L{cx+18} 138 H{cx+2} Z" fill="{INK}"/>')
    else:
        s.a(f'<path d="M{cx-60} 140 H{cx-14}" stroke="url(#cuivreH)" stroke-width="8"/><path d="M{cx+14} 140 H{cx+60}" stroke="url(#cuivreH)" stroke-width="8"/>')
        s.a(f'<path d="M{cx-14} 140 l6 -10 l6 14 l6 -16 l6 14 l6 -8" fill="none" stroke="#7fd3ff" stroke-width="3"/><circle cx="{cx}" cy="138" r="16" fill="#7fd3ff" opacity=".35"/>')
    for k,l in enumerate(l1.split("|")):
        for kk,part in enumerate([l] if len(l)<22 else [l[:l.rfind(" ",0,22)], l[l.rfind(" ",0,22)+1:]]): pass
    lignes=[]
    for l in l1.split("|"):
        while len(l)>21:
            c=l.rfind(" ",0,21); lignes.append(l[:c]); l=l[c+1:]
        lignes.append(l)
    for k,l in enumerate(lignes): s.t(cx,214+k*21,l,10,k<2 and i!=2 or (i==2 and k<2),INK if (k<2) else GR)
bande(s,326,48,["On ne débranche jamais un connecteur en charge"],12)
s.ecrire("c21-dangers.svg")

s=S("Protéger des deux côtés de l'onduleur","Protections d'une installation photovoltaïque : côté continu, un sectionneur et un parafoudre ; l'onduleur, qui convertit et assure le découplage ; côté alternatif, un disjoncteur et un différentiel ; les cadres reliés à la terre ; une signalisation des deux sources de tension",640,440)
panneau_pv(s,24,70,74,104,3,5)
trait(s,"M98 120 H128",RED,4)
def boite(x,y,w,h,t,l1,l2,c):
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g>'); s.t(x+w/2,y+h+24,t,11,True,c); s.t(x+w/2,y+h+44,l1,9.5); s.t(x+w/2,y+h+62,l2,9.5)
boite(128,74,120,94,"CÔTÉ CONTINU","sectionneur continu","parafoudre",RED)
s.a('<rect x="142" y="90" width="40" height="62" rx="4" fill="#fff" stroke="#aab1b9"/><rect x="152" y="104" width="20" height="24" rx="3" fill="#d92b2b"/><rect x="194" y="90" width="40" height="62" rx="4" fill="#fff" stroke="#aab1b9"/><path d="M214 98 l-8 22 h10 l-8 22" fill="none" stroke="#f2a20c" stroke-width="3"/>')
trait(s,"M248 120 H274",RED,4)
onduleur_box(s,274,70,92,104); s.t(320,198,"ONDULEUR",11,True,AMB); s.t(320,218,"conversion",9.5); s.t(320,236,"et découplage",9.5)
trait(s,"M366 120 H392",BLUE,4)
boite(392,74,120,94,"CÔTÉ ALTERNATIF","disjoncteur","différentiel",BLUE)
disj(s,414,80,0.34,"C16",None,True,False); idiff(s,446,80,0.34,"40 A","A",False)
trait(s,"M512 120 H540",BLUE,4); coffret(s,540,78,70,90); s.t(575,192,"tableau",9.5,False,GR)
trait(s,"M60 174 V266 H200","vj",5); g_(s,200,266,0,sym_terre()); s.t(232,276,"TERRE",11,True,GRN,"start"); s.t(232,296,"cadres et structure reliés",9.5,False,INK,"start")
s.a(f'<path d="M430 254 L462 300 H398 Z" fill="#ffd23f" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/><text x="430" y="292" text-anchor="middle" font-size="22" font-weight="800" fill="{INK}">!</text>')
s.t(474,272,"SIGNALISATION",11,True,AMB,"start"); s.t(474,292,"deux sources de tension",9.5,False,INK,"start")
bande(s,330,62,["Couper l'AGCP ne met pas les panneaux hors tension","Avant toute intervention : les deux côtés, absence de tension vérifiée"],10)
s.ecrire("c21-protections.svg")
print("module 21 : 7 images")

# =====================================================================
# BLOC 1 — outils : pile, multimètre, résistance, générateur
# =====================================================================
def pile(s,cx,cy,k=1.0):
    s.a(f'<g transform="translate({cx} {cy}) scale({k})" filter="url(#ombre)"><rect x="-22" y="-44" width="44" height="88" rx="8" fill="#2b3036"/><rect x="-22" y="-44" width="44" height="30" rx="8" fill="#f2a20c"/><rect x="-8" y="-52" width="16" height="9" rx="2" fill="#aab1b9"/>'
        f'<text x="0" y="-22" text-anchor="middle" font-size="18" font-weight="800" fill="#1c2530">+</text><text x="0" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">−</text></g>')
def multimetre(s,cx,cy,lettre="V",val="",k=1.0):
    s.a(f'<g transform="translate({cx} {cy}) scale({k})" filter="url(#ombre)"><rect x="-34" y="-50" width="68" height="100" rx="10" fill="#f2b90c" stroke="#b98a05" stroke-width="2"/><rect x="-26" y="-42" width="52" height="24" rx="3" fill="#cfe3c6"/>'
        f'<text x="0" y="-24" text-anchor="middle" font-size="13" font-weight="800" font-family="monospace" fill="#1c2530">{val}</text><circle cx="0" cy="12" r="15" fill="#3a3f46"/><text x="0" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">{lettre}</text>'
        '<circle cx="-14" cy="40" r="4" fill="#d92b2b"/><circle cx="14" cy="40" r="4" fill="#1c2530"/></g>')
def sym_res(lab="",c=INK): return f'<rect x="-24" y="-10" width="48" height="20" fill="#fff" stroke="{c}" stroke-width="2.6"/>'+(f'<text x="0" y="-16" text-anchor="middle" font-size="13" font-weight="800" fill="{INK}">{lab}</text>' if lab else "")
def sym_rond(lettre,r=16): return f'<circle r="{r}" fill="#fff" stroke="{INK}" stroke-width="2.6"/><text x="0" y="6" text-anchor="middle" font-size="16" font-weight="800" fill="{INK}">{lettre}</text>'
def fleche_c(s,x1,y1,x2,y2,c,w=3):
    a=math.atan2(y2-y1,x2-x1); s.a(f'<path d="M{x1} {y1} L{x2-math.cos(a)*8:.1f} {y2-math.sin(a)*8:.1f}" stroke="{c}" stroke-width="{w}"/><polygon points="{x2:.1f},{y2:.1f} {x2-math.cos(a)*12+math.sin(a)*6:.1f},{y2-math.sin(a)*12-math.cos(a)*6:.1f} {x2-math.cos(a)*12-math.sin(a)*6:.1f},{y2-math.sin(a)*12+math.cos(a)*6:.1f}" fill="{c}"/>')
def radiateur(s,cx,cy,w=90,h=60,chaud=True):
    n=int(w/12)
    for i in range(n): s.a(f'<rect x="{cx-w/2+i*12:.0f}" y="{cy-h/2}" width="10" height="{h}" rx="4" fill="url(#nez)" stroke="#aab1b9"/>')
    if chaud:
        for i in range(3): s.a(f'<path d="M{cx-20+i*20} {cy-h/2-6} q5 -7 0 -13 q-5 -7 0 -13" fill="none" stroke="#e8590c" stroke-width="2.4" stroke-linecap="round"/>')
def moteur(s,cx,cy,r=30):
    s.a(f'<g filter="url(#ombre)"><rect x="{cx-r*1.3:.0f}" y="{cy-r}" width="{r*2.4:.0f}" height="{r*2}" rx="{r*.4:.0f}" fill="#5b7fb3" stroke="#2c4f8a" stroke-width="2"/></g>'+"".join(f'<path d="M{cx-r*1.1+i*r*.36:.0f} {cy-r+4} V{cy+r-4}" stroke="#2c4f8a" stroke-width="2"/>' for i in range(6))+f'<rect x="{cx+r*1.1:.0f}" y="{cy-5}" width="{r*.6:.0f}" height="10" fill="url(#acierH)" stroke="#7d858e"/>')
def box_net(s,cx,cy):
    s.a(f'<g filter="url(#ombre)"><rect x="{cx-40}" y="{cy-18}" width="80" height="36" rx="8" fill="#2b3036"/></g><circle cx="{cx-20}" cy="{cy}" r="3.5" fill="#1e9e5a"/><circle cx="{cx-8}" cy="{cy}" r="3.5" fill="#1e9e5a"/><circle cx="{cx+4}" cy="{cy}" r="3.5" fill="#3d9be9"/>')
    for r in (14,24): s.a(f'<path d="M{cx+22-r*.6:.0f} {cy-22-r*.5:.0f} A{r} {r} 0 0 1 {cx+22+r*.6:.0f} {cy-22-r*.5:.0f}" fill="none" stroke="#3d9be9" stroke-width="2.4"/>')
def boucle(s,x1,y1,x2,y2,c=INK,w=3): s.a(f'<rect x="{x1}" y="{y1}" width="{x2-x1}" height="{y2-y1}" rx="10" fill="none" stroke="{c}" stroke-width="{w}"/>')
def blanc(s,x,y,w,h): s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff"/>')

# =====================================================================
# MODULE 1 — la nature de l'électricité
# =====================================================================
s=S("L'électricité sert à quatre choses","Les quatre usages de l'électricité : chauffer, avec un radiateur ou un four ; éclairer, avec des lampes ; mettre en mouvement, la force motrice ; communiquer, avec les réseaux et les box")
for i,(t,d) in enumerate((("chauffer","radiateur, four"),("éclairer","lampes"),("mouvoir","force motrice"),("communiquer","réseaux, box"))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,250)
    if i==0: radiateur(s,cx,150,96,64)
    elif i==1: ampoule(s,cx,130,30)
    elif i==2: moteur(s,cx-8,150,26)
    else: box_net(s,cx,160)
    s.t(cx,246,t,13,True,AMB); s.t(cx,270,d,10.5,False,GR)
bande(s,314,46,["Chauffage · éclairage · force motrice · communication"],11.5)
s.ecrire("c1-usages.svg")

s=S("L'atome et ses électrons","Un atome : un noyau chargé positivement, entouré d'électrons chargés négativement. Dans un métal, un électron libre peut quitter son atome et passer d'atome en atome")
cx,cy=220,200
for rx,ry,a in ((150,52,0),(150,52,60),(150,52,120)): s.a(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="#aab1b9" stroke-width="2" transform="rotate({a} {cx} {cy})"/>')
s.a(f'<circle cx="{cx}" cy="{cy}" r="30" fill="#d92b2b" stroke="#a81d1d" stroke-width="2"/><text x="{cx}" y="{cy+9}" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">+</text>')
for a,rr in ((0.6,150),(2.1,150),(3.9,150),(5.0,150)):
    ex=cx+rr*math.cos(a)*math.cos(0)-0; ey=cy+52*math.sin(a)
    s.a(f'<circle cx="{ex:.0f}" cy="{ey:.0f}" r="11" fill="#2166d1"/><text x="{ex:.0f}" y="{ey+5:.0f}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">−</text>')
s.a(f'<circle cx="430" cy="96" r="11" fill="#2166d1" stroke="#ffd23f" stroke-width="3"/><text x="430" y="101" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">−</text>')
s.a(f'<path d="M372 150 Q400 120 418 104" fill="none" stroke="#2166d1" stroke-width="2" stroke-dasharray="5 4"/>')
s.t(450,92,"électron libre",12,True,BLUE,"start"); s.t(450,112,"il quitte son atome",10.5,False,GR,"start")
s.t(450,196,"noyau",12,True,RED,"start"); s.t(450,216,"charge positive (+)",10.5,False,GR,"start")
s.t(450,272,"électrons",12,True,BLUE,"start"); s.t(450,292,"charge négative (−)",10.5,False,GR,"start")
bande(s,330,52,["Dans un métal, les électrons libres","passent d'atome en atome"],11.5)
s.ecrire("n1-atome.svg")

s=S("Conducteur ou isolant ?","Un conducteur, comme le cuivre, a des électrons libres : le courant passe. Un isolant, comme le PVC, le verre ou l'air sec, garde ses électrons prisonniers : le courant ne passe pas")
s.panneau(16,44,296,320); s.panneau(328,44,296,320)
s.t(164,72,"CONDUCTEUR",14,True,GRN); s.t(476,72,"ISOLANT",14,True,RED)
s.a('<rect x="40" y="110" width="248" height="66" rx="10" fill="url(#cuivreH)" stroke="#8f4f17"/>')
for k in range(8): fleche_c(s,54+k*28,126+(k%2)*30,72+k*28,126+(k%2)*30,"#2166d1",2.4)
s.a('<rect x="352" y="110" width="248" height="66" rx="10" fill="#e8eaed" stroke="#8d949c"/>')
for k in range(8):
    x=372+k*30; y=128+(k%2)*28
    s.a(f'<circle cx="{x}" cy="{y}" r="7" fill="#2166d1"/><circle cx="{x}" cy="{y}" r="12" fill="none" stroke="#5b6673" stroke-width="1.5" stroke-dasharray="3 2"/>')
s.t(164,216,"électrons libres : ça passe",11.5,True); s.t(164,252,"cuivre, aluminium",11); s.t(164,274,"tous les métaux",11,False,GR)
s.t(476,216,"électrons prisonniers : ça bloque",10.5,True); s.t(476,252,"PVC, verre, air sec",11); s.t(476,274,"gaines, capots",11,False,GR)
s.ecrire("c1-iso-cuivre.svg")

s=S("Le courant : deux sens à ne pas confondre","Dans un circuit avec une pile et une lampe, le sens conventionnel du courant va du plus vers le moins à l'extérieur de la pile ; les électrons, eux, vont en sens inverse, lentement, mais l'effet est immédiat")
boucle(s,110,80,500,300,INK,4); blanc(s,90,120,40,140); blanc(s,486,118,28,96); pile(s,110,190,1.3); dcl(s,500,130,True,False)
s.a(f'<path d="M110 248 V300 M110 134 V80" stroke="{INK}" stroke-width="4"/><path d="M500 194 V300" stroke="{INK}" stroke-width="4"/>')
fleche_c(s,200,80,300,80,RED,4); fleche_c(s,300,300,200,300,RED,4)
fleche_c(s,300,96,200,96,BLUE,3); fleche_c(s,200,284,300,284,BLUE,3)
s.t(320,124,"sens conventionnel : du + vers le −",11.5,True,RED)
s.t(320,260,"les électrons vont en sens inverse",11.5,True,BLUE)
bande(s,328,52,["Ils avancent lentement,","mais l'effet est immédiat"],11.5)
s.ecrire("n1-courant.svg")

s=S("Quatre façons de produire l'électricité","Quatre façons de produire l'électricité : le magnétisme, courant alternatif, avec un alternateur de centrale ou d'éolienne ; le photovoltaïque et le chimique, courant continu ; le statique, usage marginal",640,410)
for i,(t,c1,d) in enumerate((("MAGNÉTISME","alternatif","centrales, éoliennes"),("PHOTOVOLTAÏQUE","continu","panneaux solaires"),("CHIMIQUE","continu","piles, batteries"),("STATIQUE","usage marginal","frottement"))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,326); s.t(cx,72,t,11 if i==1 else 12,True,AMB)
    if i==0:
        s.a(f'<rect x="{cx-3}" y="110" width="6" height="110" fill="#d5d9de"/><circle cx="{cx}" cy="110" r="7" fill="#aab1b9"/>')
        for a in (90,210,330): s.a(f'<path d="M{cx} 110 l{50*math.cos(math.radians(a)):.0f} {50*math.sin(math.radians(a)):.0f}" stroke="#e8eaed" stroke-width="9" stroke-linecap="round"/><path d="M{cx} 110 l{50*math.cos(math.radians(a)):.0f} {50*math.sin(math.radians(a)):.0f}" stroke="#aab1b9" stroke-width="1"/>'.replace("l",f"l",1))
    elif i==1: soleil(s,cx+34,96,13); s.a(f'<g transform="rotate(-20 {cx} 170)">'); panneau_pv(s,cx-46,140,86,60,5,3); s.a('</g>')
    elif i==2: pile(s,cx,160,1.1)
    else: s.a(f'<ellipse cx="{cx}" cy="150" rx="34" ry="42" fill="#ff8a65" stroke="#d9480f" stroke-width="2"/><path d="M{cx} 192 l-6 10 h12 z" fill="#d9480f"/>'+"".join(f'<text x="{cx-24+k*16}" y="{140+(k%2)*22}" font-size="14" font-weight="800" fill="#fff">{"+−"[k%2]}</text>' for k in range(4)))
    s.t(cx,262,"courant",10.5,False,GR) if i<3 else None
    s.t(cx,284,c1,12,True,BLUE if c1=="alternatif" else (RED if c1=="continu" else GR)); s.t(cx,314,d,10,False,GR)
s.ecrire("c1-continu-alternatif.svg")

s=S("L'intensité : un débit, en ampères","L'intensité est un débit d'électrons, en ampères. L'ampèremètre se branche en série : le courant le traverse")
boucle(s,100,90,520,310,INK,4); blanc(s,80,140,40,120); blanc(s,270,80,100,24); blanc(s,506,128,28,96); pile(s,100,200,1.2)
multimetre(s,320,92,"A","0,26",0.9); dcl(s,520,140,True,False)
s.a(f'<path d="M100 254 V310 M100 146 V90" stroke="{INK}" stroke-width="4"/><path d="M520 204 V310" stroke="{INK}" stroke-width="4"/>')
fleche_c(s,150,90,240,90,RED,3.5); fleche_c(s,400,90,480,90,RED,3.5)
s.t(320,206,"ampèremètre EN SÉRIE",13,True); s.t(320,230,"le courant le traverse",11,False,GR)
bande(s,336,46,["Intensité I : le débit, en ampères (A)"],12)
s.ecrire("n1-intensite.svg")

s=S("La tension : une pression, en volts","La tension est une pression, en volts. Le voltmètre se branche en parallèle, aux bornes de l'élément. À une prise de courant : 230 V")
s.panneau(16,44,296,290); s.panneau(328,44,296,290)
pile(s,110,170,1.2); multimetre(s,240,170,"V","1,5",0.9)
s.a(f'<path d="M110 112 V84 H240 V118 M110 226 V256 H240 V222" fill="none" stroke="{INK}" stroke-width="3"/>')
s.a(f'<path d="M110 112 V84 H240 V118" fill="none" stroke="{RED}" stroke-width="3"/>')
s.t(164,286,"voltmètre EN PARALLÈLE",11.5,True); s.t(164,308,"branché aux bornes",10.5,False,GR)
prise_ic(s,430,170,90); multimetre(s,560,170,"V","230",0.8)
trait(s,"M424 176 Q470 230 548 210",RED,3); trait(s,"M438 176 Q480 250 572 210",INK,3)
s.t(476,286,"230 V",17,True); s.t(476,308,"à une prise",10.5,False,GR)
bande(s,348,44,["La tension pousse ; sans elle, pas de courant"],11.5)
s.ecrire("c1-iso-pile.svg")

s=S("La résistance : un frein, en ohms","La résistance freine le courant, en ohms : un fil long et fin résiste plus ; un fil court et gros résiste moins. L'ohmmètre se branche toujours hors tension")
s.panneau(16,44,296,270); s.panneau(328,44,296,270)
s.a('<path d="M40 130 C90 90 120 170 170 130 S250 90 290 130" fill="none" stroke="url(#cuivreH)" stroke-width="5"/>')
s.a('<rect x="380" y="112" width="190" height="34" rx="10" fill="url(#cuivreH)" stroke="#8f4f17"/>')
s.t(164,214,"long et fin",13,True); s.t(164,244,"résiste PLUS",13,True,RED)
s.t(476,214,"court et gros",13,True); s.t(476,244,"résiste MOINS",13,True,GRN)
bande(s,330,52,["Ohmmètre : toujours HORS tension"],12)
s.ecrire("n1-resistance.svg")

s=S("Trois grandeurs à ne plus confondre","Trois grandeurs : U, la tension, pousse, en volts ; I, l'intensité, circule, en ampères ; R, la résistance, freine, en ohms. Elles sont liées par la loi d'Ohm. On dit tension, jamais voltage",640,420)
for i,(L,d,u,c) in enumerate((("U","la tension pousse","en volts (V)",RED),("I","l'intensité circule","en ampères (A)",BLUE),("R","la résistance freine","en ohms (Ω)",AMB))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,206); code(s,cx,124,L,60); s.a(f'<path d="M{cx-26} 140 H{cx+26}" stroke="{c}" stroke-width="5"/>')
    s.t(cx,186,d,11.5,True); s.t(cx,210,u,11,False,GR)
bande(s,266,44,["Elles sont liées : c'est la loi d'Ohm"],12)
s.t(320,348,"On dit « tension », jamais « voltage »",12,True,RED)
s.t(320,380,"Suite au module 2",10.5,False,GR)
s.ecrire("n1-recap.svg")
print("module 1 : 9 images")

# =====================================================================
# MODULE 2 — loi d'Ohm et puissance
# =====================================================================
s=S("U pousse, I circule, R freine","Rappel : U, la tension, en volts ; I, l'intensité, en ampères ; R, la résistance, en ohms. Trois grandeurs liées")
for i,(L,n,u,c) in enumerate((("U","tension","volts (V)",RED),("I","intensité","ampères (A)",BLUE),("R","résistance","ohms (Ω)",AMB))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250)
    multimetre(s,cx,126,"V" if i==0 else ("A" if i==1 else "Ω"),("230","10","23")[i],0.85)
    code(s,cx,222,L,34); s.t(cx,248,n,11.5,True,c); s.t(cx,270,u,10.5,False,GR)
bande(s,314,46,["Trois grandeurs liées : place aux formules"],12)
s.ecrire("c2-rappel.svg")

s=S("Loi d'Ohm : le triangle","Le triangle de la loi d'Ohm : U en haut, R et I en bas. On cache la grandeur cherchée : U égale R fois I ; R égale U divisé par I ; I égale U divisé par R",640,420)
s.a(f'<path d="M170 64 L290 270 H50 Z" fill="#fff1c2" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/><path d="M110 180 H230 M170 180 V270" stroke="{INK}" stroke-width="3"/>')
code(s,170,158,"U",46); code(s,124,250,"R",40); code(s,216,250,"I",40)
for r,(f,d) in enumerate((("U = R × I","on cherche la tension"),("R = U / I","on cherche la résistance"),("I = U / R","on cherche l'intensité"))):
    y=60+r*76; carte(s,326,y,298,66); s.t(346,y+30,f,15,True,INK,"start"); s.t(346,y+52,d,10.5,False,GR,"start")
bande(s,300,46,["Cache la grandeur cherchée : il reste la formule"],11.5)
s.ecrire("n2-triangle.svg")

s=S("La loi d'Ohm en chiffres","Trois calculs : I égale U sur R, 230 V sur 23 Ω font 10 A ; R égale U sur I, 230 V sur 0,5 A font 460 Ω ; U égale R fois I, 6 Ω fois 2 A font 12 V")
for i,(f,calc,res) in enumerate((("I = U / R","230 V / 23 Ω","= 10 A"),("R = U / I","230 V / 0,5 A","= 460 Ω"),("U = R × I","6 Ω × 2 A","= 12 V"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250)
    s.t(cx,86,f,15,True,AMB); s.a(f'<path d="M{x+30} 108 H{x+166}" stroke="#e3dccf" stroke-width="2"/>')
    s.t(cx,160,calc,13); s.t(cx,214,res,20,True)
bande(s,314,46,["Toujours en volts, ohms et ampères"],12)
s.ecrire("n2-calcul.svg")

s=S("La puissance : P = U × I","La puissance P égale U fois I, en watts. Pour un appareil de 2 300 W sous 230 V, le courant I égale P sur U : 10 A")
s.panneau(16,44,296,300); plaque_ic(s,164,140,150)
s.a('<rect x="94" y="226" width="140" height="34" rx="6" fill="#fff" stroke="#8d949c"/>'); s.t(164,250,"2 300 W",15,True)
s.t(164,300,"un appareil",11,False,GR)
carte(s,328,44,296,140); s.t(476,96,"P = U × I",19,True); s.t(476,128,"la puissance, en watts (W)",10.5,False,GR)
carte(s,328,198,296,146); s.t(476,244,"I = P / U",19,True); s.t(476,282,"2 300 / 230 = 10 A",14,True,BLUE)
bande(s,356,40,["De la puissance d'un appareil, on déduit son courant"],11)
s.ecrire("c2-iso-plaque.svg")

s=S("Effet Joule : P = R × I²","Effet Joule : la chaleur dégagée vaut R fois I au carré. Quand le courant double, la chaleur est multipliée par quatre : utile dans un radiateur, dangereux dans un fil trop fin",640,420)
s.panneau(16,44,296,170); s.panneau(328,44,296,170)
s.a('<rect x="40" y="120" width="248" height="22" rx="8" fill="url(#cuivreH)" stroke="#8f4f17"/>'); s.a('<rect x="352" y="120" width="248" height="22" rx="8" fill="url(#chaud)" stroke="#8f4f17"/>')
s.a(f'<path d="M150 106 q5 -7 0 -13 q-5 -7 0 -13" fill="none" stroke="#e8590c" stroke-width="2.6" stroke-linecap="round"/>')
for k in range(4): s.a(f'<path d="M{410+k*40} 106 q5 -7 0 -13 q-5 -7 0 -13" fill="none" stroke="#e8590c" stroke-width="2.6" stroke-linecap="round"/>')
s.t(164,72,"courant I",12.5,True); s.t(164,184,"chaleur × 1",14,True,AMB); s.t(476,72,"courant 2 × I",12.5,True); s.t(476,184,"chaleur × 4",14,True,RED)
s.t(320,250,"P = R × I²",17,True)
carte(s,16,270,296,82); radiateur(s,80,316,70,40); s.t(204,304,"utile dans",11,False,INK); s.t(204,326,"un radiateur",11,True,GRN)
carte(s,328,270,296,82); s.a('<path d="M352 314 H450" stroke="url(#chaud)" stroke-width="5"/>'); s.t(530,304,"dangereux dans",11,False,INK); s.t(530,326,"un fil trop fin",11,True,RED)
s.t(320,392,"Le courant double, la chaleur quadruple",12,True)
s.ecrire("c2-joule.svg")

s=S("L'énergie : E = P × t","L'énergie, E égale P fois t, se compte en kilowattheures sur le compteur. Un radiateur de 2 kW pendant 5 heures consomme 10 kWh. 1 kWh égale 1 000 W pendant 1 heure")
s.panneau(16,44,296,300); linky(s,104,74,120,200); s.t(164,302,"compteur",12,True); s.t(164,324,"il compte les kWh",10.5,False,GR)
carte(s,328,44,296,100); s.t(476,90,"E = P × t",19,True); s.t(476,120,"l'énergie, en kilowattheures",10.5,False,GR)
carte(s,328,156,296,188); radiateur(s,420,232,84,56)
s.a(f'<circle cx="548" cy="232" r="30" fill="#fff" stroke="{INK}" stroke-width="3"/><path d="M548 212 V232 H562" fill="none" stroke="{INK}" stroke-width="3"/>')
s.t(476,298,"2 kW × 5 h = 10 kWh",14,True,BLUE); s.t(476,322,"un radiateur pendant 5 heures",10,False,GR)
bande(s,356,40,["1 kWh = 1 000 W pendant 1 heure"],12)
s.ecrire("c2-iso-compteur.svg")

s=S("Les quatre formules du bloc","Les quatre formules : U égale R fois I, la loi d'Ohm ; P égale U fois I, la puissance ; P égale R fois I au carré, l'effet Joule ; E égale P fois t, l'énergie",640,410)
for r,(f,n,u) in enumerate((("U = R × I","la loi d'Ohm","volts = ohms × ampères"),("P = U × I","la puissance","watts = volts × ampères"),("P = R × I²","l'effet Joule","la chaleur dégagée"),("E = P × t","l'énergie","kilowattheures = kW × heures"))):
    y=44+r*88; carte(s,16,y,608,80)
    s.a(f'<rect x="32" y="{y+14}" width="200" height="52" rx="10" fill="#fff" stroke="{INK}" stroke-width="2"/>'); s.t(132,y+48,f,17,True)
    s.t(256,y+34,n,13,True,AMB,"start"); s.t(256,y+58,u,11,False,GR,"start")
s.ecrire("n2-formules.svg")
print("module 2 : 7 images")

# =====================================================================
# MODULE 3 — le circuit électrique
# =====================================================================
s=S("Un circuit est une boucle","Un circuit est une boucle : fermée, le courant circule et la lampe éclaire ; ouverte, par un interrupteur ou un fil coupé, rien ne passe")
for px,ferme in ((16,True),(328,False)):
    s.panneau(px,44,296,300); s.t(px+148,72,"BOUCLE FERMÉE" if ferme else "BOUCLE OUVERTE",13.5,True,GRN if ferme else RED)
    pile(s,px+64,190,1.0); boucle(s,px+64,100,px+240,280,INK,3.5); blanc(s,px+44,140,40,100)
    s.a(f'<path d="M{px+64} 146 V100 M{px+64} 234 V280" stroke="{INK}" stroke-width="3.5"/>')
    blanc(s,px+120,90,60,20); g_(s,px+120,100,-90,sym_inter(ferme))
    blanc(s,px+225,160,30,60); g_(s,px+240,190,0,sym_lampe(ferme,16))
    s.t(px+148,312,"le courant circule" if ferme else "rien ne passe",12,True); s.t(px+148,334,"la lampe éclaire" if ferme else "interrupteur, fil coupé…",10.5,False,GR)
s.ecrire("n3-boucle.svg")

s=S("Les 5 familles de composants","Les cinq familles de composants d'un circuit : le générateur, la source ; la protection, le disjoncteur ; la commande, l'interrupteur ; le récepteur, la lampe ; les conducteurs qui les relient",640,380)
for i,(t,d) in enumerate((("générateur","la source"),("protection","disjoncteur"),("commande","interrupteur"),("récepteur","lampe"),("conducteurs","les fils"))):
    x=16+123*i; cx=x+58; carte(s,x,44,116,250)
    s.a(f'<circle cx="{cx}" cy="70" r="15" fill="{INK}"/><text x="{cx}" y="76" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">{i+1}</text>')
    if i==0: pile(s,cx,150,0.9)
    elif i==1: disj(s,cx-21,100,0.6,"C16")
    elif i==2: inter_mural(s,cx,150,64)
    elif i==3: ampoule(s,cx,140,26)
    else:
        for k,c in enumerate((RED,BLEU,"vj")): fil(s,cx-46,128+k*22,60,14,c,26,7)
    s.t(cx,256,t,10.5,True,AMB); s.t(cx,278,d,9.5,False,GR)
bande(s,310,46,["Le courant les traverse dans cet ordre"],12)
s.ecrire("c3-familles.svg")

s=S("Le générateur impose la tension","Dans un logement, le générateur est le réseau : il impose 230 V entre la phase et le neutre. Tout générateur réel a une résistance interne")
s.a('<rect x="60" y="64" width="14" height="210" rx="2" fill="#8a5a2b" stroke="#5e3b17"/><rect x="34" y="78" width="66" height="8" rx="2" fill="#6b4520"/>')
s.a('<g filter="url(#ombre)"><rect x="34" y="120" width="66" height="70" rx="6" fill="#aab1b9" stroke="#7d858e"/></g>')
s.t(67,300,"le réseau",11,True)
trait(s,"M100 110 H330",RED,6); trait(s,"M100 160 H330",BLUE,6)
s.t(200,98,"phase",11.5,True,RED); s.t(200,188,"neutre",11.5,True,BLUE)
prise_ic(s,380,136,90); multimetre(s,530,136,"V","230",0.9)
s.t(456,250,"230 V",22,True)
bande(s,300,46,["230 V entre la phase et le neutre"],12)
s.t(320,380,"Tout générateur réel a une résistance interne",10.5,False,GR)
s.ecrire("n3-source.svg")

s=S("Le récepteur transforme l'énergie","Le récepteur transforme l'énergie électrique : en lumière, la lampe ; en chaleur, le radiateur ; en mouvement, le moteur. Il est branché entre la phase et le neutre, jamais entre la phase et la terre")
for i,(t,d) in enumerate((("lumière","lampe"),("chaleur","radiateur"),("mouvement","moteur"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,220)
    if i==0: ampoule(s,cx,120,32)
    elif i==1: radiateur(s,cx,140,110,70)
    else: moteur(s,cx-6,140,30)
    s.t(cx,222,t,13,True,AMB); s.t(cx,244,d,10.5,False,GR)
bande(s,280,52,["Branché entre PHASE et NEUTRE","jamais entre la phase et la terre"],12)
s.ecrire("n3-recepteurs.svg")

s=S("La commande coupe la phase","L'interrupteur doit couper la phase : la lampe est alors hors tension, c'est correct. Sur le neutre, la lampe est éteinte mais reste sous tension : danger")
for px,ok in ((16,True),(328,False)):
    s.panneau(px,44,296,290); x0=px+20; y=150
    s.t(px+148,72,"SUR LA PHASE" if ok else "SUR LE NEUTRE",14,True,GRN if ok else RED)
    if ok:
        trait(s,f"M{x0} {y} H{x0+40}",RED,4); g_(s,x0+40,y,-90,sym_inter(False)); trait(s,f"M{x0+100} {y} H{x0+130}",ORA,4)
        g_(s,x0+146,y,0,sym_lampe(False,16)); trait(s,f"M{x0+162} {y} H{x0+256}",BLUE,4)
    else:
        s.a(f'<circle cx="{x0+146}" cy="{y}" r="28" fill="#ff5c5c" opacity=".22"/>')
        trait(s,f"M{x0} {y} H{x0+130}",RED,4); g_(s,x0+146,y,0,sym_lampe(False,16))
        trait(s,f"M{x0+162} {y} H{x0+186}",BLUE,4); g_(s,x0+186,y,-90,sym_inter(False)); trait(s,f"M{x0+246} {y} H{x0+256}",BLUE,4)
    s.t(x0,y-16,"phase",10.5,True,RED,"start"); s.t(x0+256,y-16,"neutre",10.5,True,BLUE,"end")
    s.t(px+148,236,"lampe hors tension" if ok else "éteinte mais SOUS TENSION",12,True,INK if ok else RED)
    s.t(px+148,270,"correct" if ok else "danger",15,True,GRN if ok else RED)
s.ecrire("n3-interrupteur.svg")

s=S("Phase, neutre, terre : les couleurs","Couleurs des conducteurs : phase en rouge, marron ou noir ; neutre en bleu clair, couleur réservée ; terre en vert-jaune, couleur réservée. La section se choisit selon le courant à transporter")
for i,(t,c,l1,l2,fils) in enumerate((("PHASE",RED,"rouge, marron","ou noir",(RED,MARRON,NOIR)),("NEUTRE",BLUE,"bleu clair","couleur réservée",(BLEU,)),("TERRE",GRN,"vert-jaune","couleur réservée",("vj",)))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250); s.t(cx,72,t,14,True,c)
    if len(fils)==3:
        for k,f in enumerate(fils): fil(s,x+24,112+k*30,110,20,f,34,11)
    else: fil(s,x+24,142,110,32,fils[0],34,18)
    s.t(cx,234,l1,12,True); s.t(cx,256,l2,10.5,False,GR)
bande(s,314,46,["La section se choisit selon le courant à transporter"],11)
s.ecrire("c3-iso-fils.svg")

s=S("Deux protections, deux rôles","Deux protections : le fusible ou le disjoncteur, contre la surcharge et le court-circuit, protègent l'installation et les conducteurs ; le DDR, contre la fuite à la terre, protège les personnes, sensibilité 30 mA",640,410)
s.panneau(16,44,296,300); s.panneau(328,44,296,300)
s.t(164,72,"FUSIBLE",13.5,True,AMB); s.t(164,92,"ou DISJONCTEUR",11.5,True,AMB); s.t(476,72,"DDR",13.5,True,BLUE)
disj(s,138,104,0.5,"C16")
s.t(164,252,"surcharge · court-circuit",11); s.t(164,282,"protège l'installation",11.5,True); s.t(164,304,"les conducteurs",10.5,False,GR)
idiff(s,442,104,0.5,"40 A","A")
s.t(476,252,"fuite à la terre",11); s.t(476,282,"protège les personnes",11.5,True); s.t(476,304,"sensibilité 30 mA",11,True,BLUE)
bande(s,356,40,["Toujours sur la phase, en amont du circuit"],11.5)
s.ecrire("n3-protection.svg")
print("module 3 : 7 images")

# =====================================================================
# MODULE 4 — série, parallèle, alternatif
# =====================================================================
s=S("En série : un seul chemin","Deux résistances R1 et R2 en série avec un générateur G : un seul chemin, le même courant partout, les tensions s'additionnent, Re égale R1 plus R2")
boucle(s,90,90,470,280,INK,3.5)
blanc(s,70,160,40,60); g_(s,90,185,0,sym_rond("G",20))
blanc(s,190,80,90,20); g_(s,236,90,0,sym_res("R1")); blanc(s,330,80,90,20); g_(s,376,90,0,sym_res("R2"))
for x in (150,300,430): fleche_c(s,x,280,x-26,280,RED,3)
s.t(280,316,"le même courant I partout",12,True,RED)
carte(s,500,90,124,190); s.t(562,140,"Re =",14,True); s.t(562,170,"R1 + R2",14,True); s.t(562,216,"les tensions",10,False,GR); s.t(562,236,"s'additionnent",10,False,GR)
bande(s,336,46,["Un maillon lâche, tout s'arrête"],12)
s.ecrire("n4-serie.svg")

s=S("En parallèle : chacun sa dérivation","Deux résistances R1 et R2 en parallèle sur un générateur G : même tension pour chacune, les courants s'additionnent, 1 sur Re égale 1 sur R1 plus 1 sur R2. C'est le montage du logement",640,410)
boucle(s,80,80,420,300,INK,3.5)
blanc(s,60,160,40,60); g_(s,80,190,0,sym_rond("G",20))
s.a(f'<path d="M260 80 V300" stroke="{INK}" stroke-width="3.5"/>')
blanc(s,250,150,20,80); g_(s,260,190,90,sym_res()); blanc(s,410,150,20,80); g_(s,420,190,90,sym_res())
s.t(290,196,"R1",12,True,INK,"start"); s.t(450,196,"R2",12,True,INK,"start")
fleche_c(s,180,80,226,80,RED,3); s.t(204,70,"I1 + I2",11,True,RED)
fleche_c(s,260,120,260,148,BLUE,3); fleche_c(s,420,120,420,148,BLUE,3)
s.t(340,334,"même U",12,True)
carte(s,470,80,154,220); s.t(547,126,"1/Re =",13,True); s.t(547,152,"1/R1 + 1/R2",12,True); s.t(547,206,"les courants",10,False,GR); s.t(547,226,"s'additionnent",10,False,GR)
bande(s,350,46,["C'est le montage du logement"],12)
s.ecrire("n4-parallele.svg")

s=S("100 Ω et 100 Ω : série ou parallèle ?","Deux résistances de 100 Ω : en série, 200 Ω ; en parallèle, 50 Ω. En parallèle, la résistance équivalente est plus petite que la plus petite")
s.panneau(16,44,296,280); s.panneau(328,44,296,280)
s.t(164,72,"EN SÉRIE",13.5,True,AMB); s.t(476,72,"EN PARALLÈLE",13.5,True,BLUE)
trait(s,"M40 140 H288",INK,3); blanc(s,80,128,170,24); g_(s,110,140,0,sym_res()); g_(s,218,140,0,sym_res())
s.t(110,124,"100 Ω",10.5,True); s.t(218,124,"100 Ω",10.5,True)
s.a(f'<path d="M352 140 H400 M552 140 H600 M400 110 V170 M552 110 V170 M400 110 H552 M400 170 H552" fill="none" stroke="{INK}" stroke-width="3"/>')
blanc(s,446,100,60,20); g_(s,476,110,0,sym_res()); blanc(s,446,160,60,20); g_(s,476,170,0,sym_res())
s.t(530,104,"100 Ω",10.5,True,INK,"start"); s.t(530,194,"100 Ω",10.5,True,INK,"start")
s.t(164,226,"100 + 100",12); s.t(164,276,"200 Ω",24,True,AMB)
s.t(476,226,"100 ∥ 100",12); s.t(476,276,"50 Ω",24,True,BLUE)
bande(s,336,52,["En parallèle, Re est plus petite","que la plus petite"],11.5)
s.ecrire("n4-comparatif.svg")

def sinus(s,x0,yc,L,A,periodes=2,c=RED,w=4):
    pts=" ".join(f"{x0+L*k/200:.1f},{yc-A*math.sin(2*math.pi*periodes*k/200):.1f}" for k in range(201))
    s.a(f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"/>')
s=S("Le courant alternatif : une sinusoïde","Le courant du réseau est alternatif : une sinusoïde. Le sens du courant s'inverse à chaque alternance, positive puis négative")
s.a(f'<path d="M60 200 H600" stroke="{GR}" stroke-width="2"/><path d="M60 80 V320" stroke="{GR}" stroke-width="2"/>')
x0,L=60,520
pts=" ".join(f"{x0+L*k/200:.1f},{200-96*math.sin(2*math.pi*2*k/200):.1f}" for k in range(201))
s.a(f'<path d="M{x0} 200 '+" ".join(f"L{x0+L*k/200:.1f} {200-96*math.sin(2*math.pi*2*k/200):.1f}" for k in range(51))+' Z" fill="#ffe1dc"/>')
s.a(f'<path d="M{x0+130} 200 '+" ".join(f"L{x0+L*k/200:.1f} {200-96*math.sin(2*math.pi*2*k/200):.1f}" for k in range(50,101))+' Z" fill="#dcebff"/>')
sinus(s,x0,200,L,96,2)
s.t(125,166,"alternance +",11.5,True,RED); s.t(255,246,"alternance −",11.5,True,BLUE); s.t(596,222,"temps",10.5,False,GR,"end")
bande(s,334,48,["Le sens du courant s'inverse à chaque alternance"],11.5)
s.ecrire("n4-sinus.svg")

s=S("Période, fréquence, valeur efficace","Sinusoïde du réseau : la valeur de crête vaut 325 V, la valeur efficace 230 V ; la période T dure 20 ms, la fréquence f égale 1 sur T, 50 Hz. 230 fois racine de 2 font environ 325 V",640,420)
s.a(f'<path d="M80 190 H420" stroke="{GR}" stroke-width="2"/><path d="M80 70 V310" stroke="{GR}" stroke-width="2"/>')
sinus(s,80,190,320,104,1)
s.a(f'<path d="M80 86 H420" stroke="{RED}" stroke-width="1.6" stroke-dasharray="6 4"/><path d="M80 116 H420" stroke="{BLUE}" stroke-width="2.2" stroke-dasharray="8 4"/>')
s.t(74,90,"crête 325 V",10.5,True,RED,"end") if False else None
s.t(428,90,"crête 325 V",11,True,RED,"start"); s.t(428,120,"efficace 230 V",11,True,BLUE,"start")
s.a(f'<path d="M80 330 H400" stroke="{INK}" stroke-width="2"/><path d="M80 322 V338 M400 322 V338" stroke="{INK}" stroke-width="2"/>'); s.t(240,358,"T = 20 ms",13,True)
carte(s,456,170,168,110); s.t(540,206,"f = 1 / T",13,True); s.t(540,236,"= 50 Hz",15,True,AMB); s.t(540,264,"230 × √2 ≈ 325 V",10,False,GR)
bande(s,372,40,["Le « 230 V » du réseau est une valeur efficace"],11)
s.ecrire("n4-sinus-cotee.svg")

s=S("Le bloc 1 en quatre marches","Le bloc 1 en quatre marches : les grandeurs, les calculs, le circuit, puis série, parallèle et alternatif. Prochaine étape, le bloc 2 : la sécurité")
for i,(l1,l2) in enumerate((("les","grandeurs"),("les","calculs"),("le","circuit"),("série, parallèle","alternatif"))):
    x=40+142*i; h=70+i*52; y=300-h
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="130" height="{h}" rx="8" fill="#{["fff1c2","ffe7b0","ffdc94","ffd23f"][i]}" stroke="#e0a800"/></g>')
    s.a(f'<circle cx="{x+65}" cy="{y+30}" r="16" fill="{INK}"/><text x="{x+65}" y="{y+36}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">{i+1}</text>')
    s.t(x+65,y+68,l1,10 if i==3 else 11,False,INK); s.t(x+65,y+88,l2,10 if i==3 else 11.5,True)
s.a(f'<rect x="20" y="300" width="600" height="8" fill="#b9bfc6"/>')
bande(s,328,52,["Prochaine étape, le bloc 2 :","la sécurité"],12)
s.ecrire("c4-iso-bloc1.svg")
print("module 4 : 6 images")

# =====================================================================
# BLOC 2 — outils : silhouette, appareils, prise de terre
# =====================================================================
def bonhomme(s,x,y,k=1.0,bras=None,c="#5b6673"):
    """Silhouette debout, pieds en (x,y). bras : liste de (angle_deg) pour bras tendus."""
    h=170*k
    s.a(f'<circle cx="{x}" cy="{y-h+14*k:.0f}" r="{14*k:.0f}" fill="{c}"/><path d="M{x-20*k:.0f} {y-h+34*k:.0f} q{20*k:.0f} -8 {40*k:.0f} 0 v{70*k:.0f} h-{8*k:.0f} v{64*k:.0f} h-{9*k:.0f} v-{62*k:.0f} h-{6*k:.0f} v{62*k:.0f} h-{9*k:.0f} v-{64*k:.0f} h-{8*k:.0f} z" fill="{c}"/>')
    pts=[]
    for a in (bras or []):
        sx=x+(16 if math.cos(math.radians(a))>=0 else -16)*k; sy=y-h+42*k
        ex=sx+62*k*math.cos(math.radians(a)); ey=sy+62*k*math.sin(math.radians(a))
        s.a(f'<path d="M{sx:.0f} {sy:.0f} L{ex:.0f} {ey:.0f}" stroke="{c}" stroke-width="{11*k:.0f}" stroke-linecap="round"/>'); pts.append((ex,ey))
    return pts
def sol(s,x,y,w,h=18): s.a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#terre)"/><rect x="{x}" y="{y}" width="{w}" height="4" fill="#8f6f45"/>')
def piquet(s,x,y,L=70): s.a(f'<rect x="{x-4}" y="{y}" width="8" height="{L}" fill="url(#acierH)" stroke="#7d858e"/><path d="M{x-4} {y+L} L{x} {y+L+12} L{x+4} {y+L}" fill="#9aa1a9"/>')
def lavelinge(s,cx,cy,w=70,defaut=False):
    lavelinge_ic(s,cx,cy,w)
    if defaut: s.a(f'<polygon points="{etoile(cx+w*.3,cy-w*.25,11,4,8,.2)}" fill="{YEL}" stroke="#e8590c" stroke-width="1.5"/>')
def trajet(s,d): s.a(f'<path d="{d}" fill="none" stroke="#f28c28" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85" stroke-dasharray="2 10"/>')
def transfo_poteau(s,x,ytop,ysol):
    s.a(f'<rect x="{x-6}" y="{ytop}" width="12" height="{ysol-ytop}" fill="#9aa1a9" stroke="#7d858e"/><g filter="url(#ombre)"><rect x="{x-30}" y="{ytop+20}" width="60" height="56" rx="6" fill="#aab1b9" stroke="#7d858e"/></g>')
    for i in range(3): s.a(f'<rect x="{x-22+i*16}" y="{ytop+8}" width="8" height="14" rx="2" fill="#e8eaed" stroke="#7d858e"/>')

# =====================================================================
# MODULE 5 — le danger électrique
# =====================================================================
s=S("Le trajet du courant dans le corps","Deux trajets du courant dans le corps : main vers pied, entre une phase et la terre ; main vers main, entre une phase et le neutre. Dans les deux cas, le courant traverse le thorax, le cœur et les poumons",640,420)
s.panneau(16,44,296,310); s.panneau(328,44,296,310)
s.t(164,72,"MAIN → PIED",14,True,AMB); s.t(476,72,"MAIN → MAIN",14,True,AMB)
sol(s,30,316,268)
(h1,)=bonhomme(s,150,316,1.25,[-35])
trait(s,f"M{h1[0]+4:.0f} {h1[1]-4:.0f} H290",RED,5); s.t(286,{True:1}[True]*0+int(h1[1])-12,"phase",11,True,RED,"end")
trajet(s,f"M{h1[0]:.0f} {h1[1]:.0f} L166 148 L150 200 L146 314")
s.t(64,334,"terre",11,True,GRN,"start")
h2,h3=bonhomme(s,476,316,1.25,[-150,-30])
trait(s,f"M{h2[0]-2:.0f} {h2[1]:.0f} H344",RED,5); trait(s,f"M{h3[0]+2:.0f} {h3[1]:.0f} H608",BLUE,5)
s.t(352,int(h2[1])-12,"phase",11,True,RED,"start"); s.t(604,int(h3[1])-12,"neutre",11,True,BLUE,"end")
trajet(s,f"M{h2[0]:.0f} {h2[1]:.0f} L476 150 L{h3[0]:.0f} {h3[1]:.0f}")
s.a('<path d="M170 156 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6z" fill="#d92b2b"/>'.replace("M170","M162"))
s.a('<path d="M484 156 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6z" fill="#d92b2b"/>')
bande(s,366,44,["Dans les deux cas, le courant traverse le thorax : cœur et poumons"],10)
s.ecrire("corps-courant.svg")

s=S("C'est l'intensité qui tue : I = U / R","Peau sèche : résistance élevée, plusieurs milliers d'ohms, courant faible. Peau mouillée : environ 1 000 Ω ; sous 230 V, le courant atteint 230 mA. La tension impose le courant à travers la résistance du corps",640,420)
s.panneau(16,44,296,310); s.panneau(328,44,296,310)
s.t(164,72,"PEAU SÈCHE",14,True,AMB); s.t(476,72,"PEAU MOUILLÉE",14,True,BLUE)
for cx,mouille in ((164,False),(476,True)):
    s.a(f'<path d="M{cx-30} 190 V120 q0 -10 8 -10 q8 0 8 10 V100 q0 -10 8 -10 q8 0 8 10 V102 q0 -10 8 -10 q8 0 8 10 V116 q0 -10 8 -10 q8 0 8 10 V196 q0 30 -30 34 h-12 q-24 -4 -24 -40 Z" fill="#f2c6a5" stroke="#c98a65" stroke-width="2"/>')
    if mouille:
        for (dx,dy) in ((-34,120),(30,100),(-6,150),(38,170)): s.a(f'<path d="M{cx+dx} {dy} q-6 10 0 14 q6 -4 0 -14" fill="#3d9be9"/>')
s.t(164,262,"R élevée",13,True); s.t(164,284,"(plusieurs milliers d'Ω)",10,False,GR); s.t(164,318,"courant faible",12,True,GRN)
s.t(476,262,"R ≈ 1 000 Ω",13,True); s.t(476,288,"230 V / 1000 Ω",11); s.t(476,318,"= 230 mA",15,True,RED)
bande(s,366,46,["La tension impose le courant à travers la résistance du corps"],10)
s.ecrire("c5-mouille.svg")

s=S("Du picotement à l'arrêt cardiaque","Seuils de courant alternatif 50 Hz, trajet main-pied : 0,5 mA perception ; 10 mA non-lâcher, tétanisation ; 30 mA paralysie respiratoire ; 75 mA fibrillation ventriculaire ; 1 A arrêt cardiaque",640,420)
x0,x1=50,590
X=lambda mA: x0+(x1-x0)*math.log10(mA/0.3)/math.log10(1500/0.3)
cols=["#1e9e5a","#c9a400","#e8790c","#d9480f","#a81d1d"]
for i,(a,b) in enumerate(((0.3,0.5),(0.5,10),(10,30),(30,75),(75,1500))):
    s.a(f'<rect x="{X(a):.1f}" y="170" width="{X(b)-X(a):.1f}" height="26" fill="{cols[min(i,4)] if i else "#9aa1a9"}"/>')
for i,(v,mA,l1,l2) in enumerate((("0,5 mA",0.5,"perception",""),("10 mA",10,"non-lâcher","(tétanisation)"),("30 mA",30,"paralysie","respiratoire"),("75 mA",75,"fibrillation","ventriculaire"),("1 A",1000,"arrêt","cardiaque"))):
    x=round(X(mA),1); haut=(i%2==0)
    s.a(f'<path d="M{x} {162 if haut else 196} V{204 if haut else 162}" stroke="{INK}" stroke-width="2.4"/>')
    if haut: s.t(x if i else x+16,92,v,13,True); s.t(x if i else x+16,116,l1,10.5); s.t(x if i else x+16,136,l2,10,False,GR) if l2 else None
    else: s.t(x,232,v,13,True); s.t(x,254,l1,10.5); s.t(x,274,l2,10,False,GR)
s.a(f'<circle cx="{X(30):.1f}" cy="183" r="18" fill="none" stroke="{BLUE}" stroke-width="3"/>')
bande(s,300,52,["30 mA : seuil retenu pour","protéger les personnes (DDR)"],11.5)
s.t(320,388,"Courant alternatif 50 Hz · trajet main-pied",10.5,False,GR)
s.ecrire("seuils-courant.svg")

s=S("La courbe de sécurité","Courbe de sécurité : en abscisse la tension de contact, en ordonnée le temps maximal admissible. Sous la tension limite, sans danger : 50 V en milieu sec, 25 V en milieu mouillé. Plus la tension de contact monte, plus il faut couper vite",640,430)
ox,oy,W,Hh=90,300,480,220
s.a(f'<rect x="{ox}" y="{oy-Hh}" width="{0.18*W:.0f}" height="{Hh}" fill="#e3f5ea"/>')
s.a(f'<path d="M{ox} {oy-Hh-10} V{oy} H{ox+W+10}" fill="none" stroke="{INK}" stroke-width="2.4"/>')
pts=" ".join(f"{ox+W*(0.18+0.82*t):.1f},{oy-Hh*(0.96*math.exp(-4.2*t)+0.04):.1f}" for t in [k/60 for k in range(61)])
s.a(f'<polyline points="{pts}" fill="none" stroke="#d92b2b" stroke-width="4"/>')
s.a(f'<path d="M{ox+0.09*W:.0f} {oy} V{oy-Hh}" stroke="{BLUE}" stroke-width="2" stroke-dasharray="6 4"/><path d="M{ox+0.18*W:.0f} {oy} V{oy-Hh}" stroke="{GRN}" stroke-width="2" stroke-dasharray="6 4"/>')
s.t(ox+0.09*W,oy+20,"25 V",11,True,BLUE); s.t(ox+0.18*W,oy+20,"50 V",11,True,GRN); s.t(ox,oy+20,"0",10.5,False,GR)
s.t(ox+44,oy-Hh+30,"sans",10.5,True,GRN); s.t(ox+44,oy-Hh+50,"danger",10.5,True,GRN)
s.t(ox-8,oy-Hh+10,"long",10,False,GR,"end"); s.t(ox-8,oy-6,"court",10,False,GR,"end")
s.t(ox+300,oy-Hh+40,"temps maximal admissible",11,True,RED)
s.t(ox+W,oy+42,"tension de contact (V)",10.5,False,GR,"end")
carte(s,16,354,296,64); s.t(164,380,"milieu sec : UL = 50 V",11,True,GRN); s.t(164,402,"milieu mouillé : UL = 25 V",11,True,BLUE)
carte(s,328,354,296,64); s.t(476,380,"Plus la tension de contact monte,",10,True); s.t(476,402,"plus il faut couper vite.",10,True)
s.ecrire("courbe-securite.svg")

s=S("Tension limite et brûlures","La tension limite UL vaut 50 V en milieu sec et 25 V en milieu mouillé en courant alternatif, 120 V en continu. Le courant brûle aussi : en profondeur, le long de son trajet, par effet Joule, et l'arc électrique brûle même à distance")
s.panneau(16,44,296,300); s.panneau(328,44,296,300)
s.t(164,72,"TENSION LIMITE UL",13.5,True,AMB); s.t(476,72,"BRÛLURES",13.5,True,RED)
for k,(v,d,c) in enumerate((("50 V","milieu sec",GRN),("25 V","milieu mouillé",BLUE),("120 V","en continu",INK))):
    y=104+k*62; carte(s,40,y,248,52); s.t(100,y+33,v,17,True,c); s.t(200,y+33,d,11,False,INK)
s.t(164,312,"en alternatif ; en dessous : sans danger",9.5,False,GR)
s.a('<path d="M380 120 H452 l18 30 l-18 30 H380 Z" fill="#f2c6a5" stroke="#c98a65" stroke-width="2"/>')
s.a('<path d="M392 150 H460" stroke="#d9480f" stroke-width="5" stroke-dasharray="6 4"/>')
s.a(f'<path d="M520 126 l10 -8 l6 14 l10 -12 l4 16 l12 -6" fill="none" stroke="#7fd3ff" stroke-width="3"/><circle cx="546" cy="124" r="22" fill="#7fd3ff" opacity=".35"/>')
s.t(476,236,"profondes, le long du trajet",11,True); s.t(476,260,"(effet Joule)",10.5,False,GR); s.t(476,292,"+ arc électrique",11.5,True,RED); s.t(476,314,"il brûle même à distance",10,False,GR)
s.ecrire("c5-ul-brulure.svg")

s=S("Face à une victime : 4 étapes, dans cet ordre","Conduite à tenir face à une victime : 1, protéger, couper le courant, ne pas toucher la victime avant ; 2, examiner, répond-elle, respire-t-elle ; 3, alerter le 15, le 18 ou le 112 ; 4, secourir, et si arrêt, massage cardiaque et défibrillateur. Toujours faire consulter un médecin",640,440)
for r,(t,d,c) in enumerate((("PROTÉGER","Couper le courant. Ne pas toucher la victime avant.",RED),("EXAMINER","La victime répond-elle ? Respire-t-elle ?",AMB),("ALERTER","15 (SAMU) · 18 (pompiers) · 112",BLUE),("SECOURIR","Premiers secours ; si arrêt : massage cardiaque, DAE.",GRN))):
    y=44+r*86; carte(s,16,y,608,78)
    s.a(f'<circle cx="52" cy="{y+39}" r="22" fill="{c}"/><text x="52" y="{y+47}" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">{r+1}</text>')
    if r==0: disj(s,92,y+8,0.26,"",None,False,False)
    elif r==1: s.a(f'<circle cx="112" cy="{y+39}" r="18" fill="none" stroke="{INK}" stroke-width="3"/><path d="M125 {y+52} l14 14" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>')
    elif r==2: s.a(f'<rect x="96" y="{y+12}" width="32" height="54" rx="6" fill="#2b3036"/><rect x="100" y="{y+18}" width="24" height="36" rx="2" fill="#9bd0ff"/>')
    else: s.a(f'<path d="M112 {y+20} c-10 -12 -26 -4 -18 10 l18 18 l18 -18 c8 -14 -8 -22 -18 -10z" fill="#d92b2b"/><path d="M104 {y+30} l6 6 l4 -10 l4 14 l4 -6" fill="none" stroke="#fff" stroke-width="2"/>')
    s.t(160,y+32,t,13,True,c,"start"); s.t(160,y+56,d,10.5,False,INK,"start")
bande(s,392,40,["Et toujours : faire consulter un médecin, même si la victime va bien"],10)
s.ecrire("c5-conduite.svg")
print("module 5 : 6 images")

# =====================================================================
# MODULE 6 — protection des personnes
# =====================================================================
s=S("Deux façons de se faire électriser","Contact direct : on touche une pièce normalement sous tension. Contact indirect : on touche une masse mise sous tension par un défaut d'isolement")
s.panneau(16,44,296,300); s.panneau(328,44,296,300)
s.t(164,72,"CONTACT DIRECT",14,True,RED); s.t(476,72,"CONTACT INDIRECT",14,True,AMB)
fil(s,40,150,120,26,RED,60,14)
s.a('<path d="M290 120 H232 q-14 0 -14 12 q0 8 10 8 H246 q-10 4 -10 12 q0 8 10 8 H256 q-12 2 -12 10 q0 8 10 8 H290 Z" fill="#f2c6a5" stroke="#c98a65" stroke-width="2"/>')
s.a(f'<polygon points="{etoile(222,150,12,5,8,.2)}" fill="{YEL}" stroke="#e8590c" stroke-width="1.5"/>')
s.t(164,252,"pièce normalement",12,True); s.t(164,274,"sous tension",12,True); s.t(164,304,"230 V",14,True,RED)
lavelinge(s,430,150,90,True)
s.a('<path d="M600 150 H526 q-14 0 -14 12 q0 8 10 8 H540 q-10 4 -10 12 q0 8 10 8 H550 q-12 2 -12 10 q0 8 10 8 H600 Z" fill="#f2c6a5" stroke="#c98a65" stroke-width="2"/>'.replace("150 H526","152 H526"))
s.t(476,252,"masse mise sous tension",12,True); s.t(476,274,"par un défaut d'isolement",11); s.t(476,304,"rien ne prévient",12,True,AMB)
s.ecrire("c6-contacts.svg")

s=S("Le PE relie toutes les masses à la terre","Le conducteur de protection PE, vert et jaune, relie les masses du four, du lave-linge et du chauffe-eau à la prise de terre. Il ne conduit du courant qu'en cas de défaut")
s.a('<g filter="url(#ombre)"><rect x="60" y="80" width="96" height="96" rx="6" fill="#2b3036"/></g><rect x="72" y="100" width="72" height="48" rx="4" fill="#3a3f46" stroke="#5b6673"/><rect x="72" y="88" width="72" height="6" rx="2" fill="#8d949c"/>')
lavelinge(s,270,128,84); cumulus(s,404,62,72,130)
for x in (108,270,440): trait(s,f"M{x} {180 if x!=440 else 194} V250","vj",6)
trait(s,"M108 250 H540 V286","vj",6)
sol(s,480,286,140,60); piquet(s,540,280,58)
for x,t in ((108,"four"),(270,"lave-linge"),(440,"chauffe-eau")): s.t(x,214 if x!=440 else 222,t,11.5,True,INK) if False else s.t(x+(0 if x!=108 else 0),62 if False else 72-24+0 if False else 74-20 if False else 200 if False else 60+0 if False else 58 if x==440 else 70,t,11.5,True)
s.t(300,272,"PE vert/jaune",12,True,GRN)
s.t(560,372,"prise de terre",11,True,INK,"end")
bande(s,354,40,["Le PE ne conduit du courant qu'en cas de défaut"],11) if False else None
s.t(240,340,"Le PE ne conduit du courant qu'en cas de défaut",11,True)
s.ecrire("c6-pe-masses.svg")

s=S("Le circuit de terre, du sol au tableau","Le circuit de terre : la prise de terre, boucle à fond de fouille ou piquet de 2 m, puis le conducteur de terre en cuivre nu 25 mm², la borne principale de terre avec sa barrette de coupure, le conducteur principal de protection 16 mm², et le bornier de terre du tableau",640,440)
A=250
sol(s,24,300,592,120)
s.a(f'<path d="M60 380 H{A+150}" stroke="url(#cuivreH)" stroke-width="5"/>'); s.t(170,404,"boucle à fond de fouille",10,False,"#5e3b17")
piquet(s,520,296,96); s.t(510,404,"ou piquet (2 m)",10,False,"#5e3b17","end")
s.a(f'<path d="M{A} 380 V220" stroke="url(#cuivreV)" stroke-width="6"/>')
s.a(f'<g filter="url(#ombre)"><rect x="{A-30}" y="170" width="60" height="50" rx="6" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g><rect x="{A-18}" y="188" width="36" height="14" rx="3" fill="#d9b25a" stroke="#8a6416"/><circle cx="{A-8}" cy="195" r="3.5" fill="url(#vis)"/><circle cx="{A+8}" cy="195" r="3.5" fill="url(#vis)"/>')
trait(s,f"M{A} 170 V90 H{A+60}","vj",6)
coffret(s,A+60,52,110,110); s.a(f'<rect x="{A+72}" y="132" width="86" height="14" rx="3" fill="#d9b25a" stroke="#8a6416"/>')
for k in range(5): s.a(f'<circle cx="{A+82+k*17}" cy="139" r="3.5" fill="url(#vis)"/>')
for k in range(4): trait(s,f"M{A+88+k*17} 146 V176","vj",3)
def rp2(x1,y1,x2,y2): s.a(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{INK}" stroke-width="1.5"/><circle cx="{x1}" cy="{y1}" r="3" fill="{INK}"/>')
rp2(A+170,110,A+190,110); s.t(A+196,104,"bornier de terre",10,True,INK,"start"); s.t(A+196,122,"du tableau",10,True,INK,"start"); s.t(A+196,140,"→ PE des circuits",9.5,False,GR,"start")
rp2(A+32,195,A+190,214); s.t(A+196,208,"borne principale",10,True,INK,"start"); s.t(A+196,226,"de terre · barrette",10,True,INK,"start"); s.t(A+196,244,"de coupure",10,True,INK,"start")
rp2(A-4,130,A-60,130); s.t(A-66,124,"conducteur principal",9.5,True,INK,"end"); s.t(A-66,142,"de protection 16 mm²",9.5,True,GRN,"end")
rp2(A-4,262,A-60,262); s.t(A-66,256,"conducteur de terre",9.5,True,INK,"end"); s.t(A-66,274,"25 mm² cuivre nu",9.5,True,"#b85a08","end")
s.t(A+196,268,"Barrette ouverte : on mesure",9,False,GR,"start"); s.t(A+196,284,"la prise de terre seule",9,False,GR,"start")
s.ecrire("c6-circuit-terre.svg")

s=S("Régime TT : deux prises de terre distinctes","Régime TT : côté distributeur, le neutre du transformateur est relié à une première prise de terre ; chez l'usager, les masses sont reliées à une deuxième prise de terre. Les deux terres ne sont reliées que par le sol",640,430)
sol(s,24,300,592,70)
transfo_poteau(s,100,64,300); s.t(100,52,"transformateur",10.5,True)
trait(s,"M130 100 H470",RED,5); trait(s,"M130 122 H470",BLUE,5); s.t(300,92,"phase",10.5,True,RED); s.t(300,146,"neutre",10.5,True,BLUE)
trait(s,"M84 132 V292","vj",0) if False else trait(s,"M86 132 V300",BLUE,4)
piquet(s,86,300,46)
maison(s,450,60,150,180); lavelinge(s,525,190,46)
trait(s,"M525 222 V300","vj",5); piquet(s,525,300,46)
s.t(86,392,"1er T",13,True,BLUE); s.t(86,412,"neutre à la terre",10,False,GR)
s.t(525,392,"2e T",13,True,GRN); s.t(525,412,"masses à la terre",10,False,GR)
s.t(300,340,"le sol",11,True,"#5e3b17")
s.t(86,280,"côté distributeur",9.5,False,GR,"start") if False else None
s.t(300,250,"Les deux terres ne sont reliées que par le sol",11,True)
s.ecrire("c6-regime-tt.svg")

s=S("La boucle de défaut en régime TT","Boucle de défaut en TT : le courant de défaut part de la phase, traverse la masse en défaut, le conducteur de protection, la prise de terre du logement, le sol, puis la prise de terre du neutre. Deux terres en série : courant faible. Tension de contact Uc égale R terre fois I défaut ; R inférieure ou égale à UL sur IΔn, 50 V sur 0,5 A, 100 Ω",640,440)
sol(s,24,280,592,70)
transfo_poteau(s,90,60,280); s.t(90,48,"source",10.5,True)
trait(s,"M120 96 H440",RED,5); trait(s,"M120 118 H440",BLUE,5); trait(s,"M76 128 V280",BLUE,4); piquet(s,76,280,40)
lavelinge(s,500,170,70,True); trait(s,"M440 96 H480 V140",RED,4); trait(s,"M500 212 V280","vj",5); piquet(s,500,280,40)
trajet(s,"M140 96 H476 V150 L500 200 V318 Q300 300 76 318 V128")
s.t(300,86,"phase",10.5,True,RED); s.t(300,320,"le sol",11,True,"#5e3b17"); s.t(560,150,"masse",10.5,True,INK,"start"); s.t(560,168,"en défaut",10,False,GR,"start")
s.t(300,160,"I défaut",12,True,"#e8790c")
for i,(l1,l2) in enumerate((("2 terres en série :","courant faible"),("tension de contact","Uc = R(terre) × I(défaut)"),("R ≤ UL / IΔn","50 V / 0,5 A = 100 Ω"))):
    x=16+204*i; cx=x+98; carte(s,x,346,196,64); s.t(cx,372,l1,10.5,True); s.t(cx,394,l2,9.5 if i==1 else 10,i==2,BLUE if i==2 else INK)
s.t(320,432,"Avec un différentiel 500 mA : prise de terre de 100 Ω au maximum",9.5,False,GR)
s.ecrire("c6-boucle-defaut.svg")

s=S("Le DDR compare la phase et le neutre","Vue en coupe d'un dispositif différentiel : la phase et le neutre traversent un tore. Si leurs courants sont égaux, rien ne se passe ; s'ils diffèrent, à cause d'une fuite vers la terre, la bobine de détection fait déclencher l'appareil",640,430)
s.a('<g filter="url(#ombre)"><rect x="170" y="56" width="300" height="250" rx="12" fill="#eef0f2" stroke="#b3b9c0" stroke-width="2"/></g><rect x="180" y="66" width="280" height="230" rx="8" fill="#fbfbfc" stroke="#d5d9de"/>')
s.a('<ellipse cx="320" cy="180" rx="74" ry="64" fill="none" stroke="#7d858e" stroke-width="22"/><ellipse cx="320" cy="180" rx="74" ry="64" fill="none" stroke="#aab1b9" stroke-width="14"/>')
for i in range(8):
    a=math.radians(200+i*7); x=320+74*math.cos(a); y=180+64*math.sin(a)
    s.a(f'<rect x="{x-5:.0f}" y="{y-12:.0f}" width="10" height="24" rx="4" fill="url(#cuivreV)" transform="rotate({math.degrees(a)+90:.0f} {x:.0f} {y:.0f})"/>')
trait(s,"M300 40 V330",RED,7); trait(s,"M340 40 V330",BLUE,7)
s.a('<path d="M248 150 H214 V250" fill="none" stroke="url(#cuivreH)" stroke-width="3"/><rect x="198" y="246" width="32" height="32" rx="4" fill="#d5d9de" stroke="#7d858e"/>')
s.t(214,300,"relais",9.5,False,GR)
fleche_c(s,300,62,300,100,RED,0) if False else None
s.t(286,48,"I phase",11,True,RED,"end"); s.t(354,48,"I neutre",11,True,BLUE,"start")
s.a(f'<path d="M398 180 H486" stroke="{INK}" stroke-width="1.5"/><circle cx="398" cy="180" r="3" fill="{INK}"/>'); s.t(492,186,"tore",11.5,True,INK,"start")
s.a(f'<path d="M224 230 H150" stroke="{INK}" stroke-width="1.5"/><circle cx="224" cy="230" r="3" fill="{INK}"/>'); s.t(144,224,"bobine de",10,True,INK,"end"); s.t(144,242,"détection",10,True,INK,"end")
s.t(450,290,"vue en coupe",9.5,False,GR,"end")
carte(s,16,322,296,62); s.t(164,348,"égaux :",11,True,GRN); s.t(164,370,"rien ne se passe",11)
carte(s,328,322,296,62); s.t(476,348,"différents (fuite vers la terre) :",10,True,RED); s.t(476,370,"il coupe",11)
s.t(320,414,"Sensibilité IΔn : 30 mA pour les personnes ; 300/500 mA contre l'incendie",9.5,False,GR)
s.ecrire("c6-ddr-principe.svg")

s=S("Quatre types, du plus simple au plus complet","Types de dispositifs différentiels : AC, courant alternatif sinusoïdal ; A, en plus le continu pulsé ; F, en plus les fréquences mélangées ; B, en plus le continu lisse. Chaque type détecte aussi ce que voit le précédent",640,420)
for i,(L,l1,l2) in enumerate((("AC","alternatif","sinusoïdal"),("A","+ continu","pulsé"),("F","+ fréquences","mélangées"),("B","+ continu","lisse"))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,276)
    s.a(f'<rect x="{cx-34}" y="60" width="68" height="46" rx="10" fill="{INK}"/><text x="{cx}" y="93" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">{L}</text>')
    s.a(f'<rect x="{x+14}" y="124" width="118" height="80" rx="6" fill="#fff" stroke="#e3dccf"/><path d="M{x+20} 164 H{x+126}" stroke="#d5d9de"/>')
    if i==0: sinus(s,x+22,164,100,26,2,BLUE,3)
    elif i==1: s.a(f'<path d="M{x+22} 164 '+" ".join(f"L{x+22+100*k/100:.1f} {164-26*abs(math.sin(2*math.pi*2*k/100)) if (k//25)%2==0 else 164:.1f}" for k in range(101))+f'" fill="none" stroke="{BLUE}" stroke-width="3"/>')
    elif i==2: s.a(f'<polyline points="'+" ".join(f"{x+22+k:.1f},{164-18*math.sin(2*math.pi*2*k/100)-8*math.sin(2*math.pi*9*k/100):.1f}" for k in range(101))+f'" fill="none" stroke="{BLUE}" stroke-width="2.6"/>')
    else: s.a(f'<path d="M{x+22} 140 H{x+122}" stroke="{BLUE}" stroke-width="3"/>')
    s.t(cx,248,l1,11.5,True); s.t(cx,270,l2,10.5,False,GR)
bande(s,334,52,["Chaque type détecte aussi ce que voit le précédent","Tableau : au moins 1 type AC + 1 type A"],10.5)
s.ecrire("c6-types-ddr.svg")

s=S("En tête de rangée : l'interrupteur différentiel","Une rangée de tableau : l'interrupteur différentiel 40 A, sensibilité 30 mA, en tête, puis les disjoncteurs des circuits, 10, 16, 20 et 32 A. Le disjoncteur se règle en ampères et protège les conducteurs ; le différentiel en milliampères et protège les personnes",640,440)
K=0.62; M=70*K; x0=320-(6*M)/2
s.a(f'<rect x="{x0-20}" y="{50+102*K}" width="{6*M+40}" height="{36*K}" fill="url(#acierH)" stroke="#9aa1a9"/>')
idiff(s,x0,50,K,"40 A","A")
for i,mq in enumerate(("C10","C16","C20","C32")): disj(s,x0+2*M+i*M,50,K,mq)
s.t(round(x0+M,1),218,"différentiel",9.5,True,BLUE); s.t(round(x0+M,1),236,"40 A / 30 mA",9.5,False,GR)
s.t(round(x0+4.5*M,1),226,"disjoncteurs des circuits",10,True)
for i,(t,c,l1,l2,l3) in enumerate((("DISJONCTEUR",AMB,"ampères (A)","protège les conducteurs","surcharge, court-circuit"),("DIFFÉRENTIEL",BLUE,"milliampères (mA)","protège les personnes","fuite à la terre"))):
    x=16+312*i; cx=x+148; carte(s,x,254,296,120); s.t(cx,282,t,13.5,True,c); s.t(cx,306,l1,11.5,True); s.t(cx,328,l2,11); s.t(cx,350,l3,10,False,GR)
bande(s,388,40,["Disjoncteur différentiel : les deux fonctions réunies"],11)
s.ecrire("c6-tableau-duo.svg")
print("module 6 : 8 images")

# =====================================================================
# MODULE 7 — la salle de bain (élévation : 1 m = 100 px, sol à y=330)
# =====================================================================
SOLb=330; Mb=100; Hb=lambda m: SOLb-m*Mb
def baignoire(s,x,w=170,h=58):
    s.a(f'<g filter="url(#ombre)"><path d="M{x} {SOLb-h} H{x+w} V{SOLb-8} q0 8 -8 8 H{x+8} q-8 0 -8 -8 Z" fill="#fff" stroke="#8d949c" stroke-width="2.5"/></g><path d="M{x+8} {SOLb-h+6} H{x+w-8} V{SOLb-16} H{x+8} Z" fill="#cfe3f7" stroke="#aab1b9"/>')
def piece(s,x1,x2):
    s.a(f'<rect x="{x1}" y="{SOLb}" width="{x2-x1}" height="8" fill="#b9bfc6"/><rect x="{x1-8}" y="{Hb(2.6):.0f}" width="8" height="{SOLb-Hb(2.6)+8:.0f}" fill="#d5d9de"/>')
def cote_v(s,x,y1,y2,lab,c=INK,cote="end"):
    s.a(f'<path d="M{x} {y1} V{y2}" stroke="{c}" stroke-width="2"/><path d="M{x-6} {y1} h12 M{x-6} {y2} h12" stroke="{c}" stroke-width="2"/>'); s.t(x+(-10 if cote=="end" else 10),(y1+y2)/2+5,lab,11,True,c,cote)

s=S("Mouillé, le corps résiste cinq fois moins","Peau sèche : environ 5 000 Ω, tension limite 50 V. Peau mouillée : environ 1 000 Ω, tension limite 25 V. Même tension, résistance plus faible : courant plus fort")
s.panneau(16,44,296,290); s.panneau(328,44,296,290)
for cx,mouille,R_,lab,ul,c in ((164,False,"5 000 Ω","peau sèche","UL = 50 V",GRN),(476,True,"1 000 Ω","peau mouillée","UL = 25 V",BLUE)):
    s.a(f'<path d="M{cx-30} 170 V100 q0 -10 8 -10 q8 0 8 10 V80 q0 -10 8 -10 q8 0 8 10 V82 q0 -10 8 -10 q8 0 8 10 V96 q0 -10 8 -10 q8 0 8 10 V176 q0 30 -30 34 h-12 q-24 -4 -24 -40 Z" fill="#f2c6a5" stroke="#c98a65" stroke-width="2"/>')
    if mouille:
        for (dx,dy) in ((-34,100),(30,80),(-6,130),(38,150)): s.a(f'<path d="M{cx+dx} {dy} q-6 10 0 14 q6 -4 0 -14" fill="#3d9be9"/>')
    s.t(cx,246,R_,17,True); s.t(cx,268,lab,11,False,GR); s.t(cx,304,("milieu sec" if not mouille else "milieu mouillé")+" : "+ul,11.5,True,c)
bande(s,348,48,["Même tension, résistance plus faible : courant plus fort"],11)
s.ecrire("c7-eau.svg")

def sdb_base(s,v0=False,v1=False,v2=False,cache=False):
    piece(s,40,600); x=150; w=170
    if v2: s.a(f'<rect x="{x+w}" y="{Hb(2.25):.0f}" width="60" height="{Hb(0)-Hb(2.25):.0f}" fill="#fff1c2" stroke="#e0a800" stroke-dasharray="5 4"/>')
    if v1: s.a(f'<rect x="{x}" y="{Hb(2.25):.0f}" width="{w}" height="{Hb(0.58)-Hb(2.25):.0f}" fill="#dcebff" stroke="#2166d1" stroke-dasharray="5 4"/>')
    baignoire(s,x,w)
    if v0: s.a(f'<path d="M{x+8} {SOLb-52} H{x+w-8} V{SOLb-16} H{x+8} Z" fill="#2166d1" opacity=".55"/>')
    if cache: s.a(f'<rect x="{x+2}" y="{SOLb-50}" width="{w-4}" height="48" fill="#c5cad0" opacity=".9"/><path d="M{x+2} {SOLb-50} H{x+w-2}" stroke="#7d858e" stroke-dasharray="4 3"/>')
    s.a(f'<path d="M{x+w-24} {Hb(1.9):.0f} H{x+w-6} V{SOLb-58}" fill="none" stroke="#8d949c" stroke-width="5"/><circle cx="{x+w-30}" cy="{Hb(1.9):.0f}" r="9" fill="#aab1b9"/>')
    return x,w

s=S("Volume 0 : l'intérieur de la baignoire","Volume 0 : l'intérieur de la baignoire ou du receveur de douche. Matériel IPX7, très basse tension de sécurité 12 V uniquement ; le transformateur est toujours placé hors de tous les volumes",640,410)
x,w=sdb_base(s,v0=True)
s.t(x+w/2,SOLb-28,"VOLUME 0",12,True,"#fff")
s.a(f'<g filter="url(#ombre)"><rect x="470" y="{Hb(1.2):.0f}" width="56" height="44" rx="6" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g>'); s.t(498,Hb(1.2)+28,"12 V",11,True)
s.a(f'<path d="M470 {Hb(1.0):.0f} H{x+w-30} V{SOLb-40}" fill="none" stroke="#5b6673" stroke-width="2" stroke-dasharray="5 4"/>')
s.t(498,Hb(1.2)-12,"transformateur",10,True)
s.t(430,96,"l'intérieur de la",11.5); s.t(430,118,"baignoire ou du receveur",11.5); s.t(430,150,"IPX7 · TBTS 12 V",12,True,BLUE)
bande(s,354,40,["Transformateur toujours hors de tous les volumes"],11)
s.ecrire("c7-volume0.svg")

s=S("Volume 1 : au-dessus de la baignoire","Volume 1 : au-dessus du volume 0, jusqu'à 2,25 m du sol fini. Matériel IPX4 minimum, IPX5 si jets horizontaux. Douche à l'italienne : cylindre de 1,20 m de rayon",640,410)
x,w=sdb_base(s,v0=True,v1=True)
s.t(x+w/2,Hb(1.5),"VOLUME 1",13,True,BLUE); s.t(x+w/2,SOLb-28,"volume 0",10,True,"#fff")
cote_v(s,110,Hb(2.25),SOLb,"2,25 m")
s.t(430,104,"au-dessus du sol fini",11); s.t(430,140,"IPX4 minimum",12.5,True); s.t(430,164,"IPX5 si jets horizontaux",10.5,False,GR)
bande(s,354,40,["Douche à l'italienne : cylindre de 1,20 m de rayon"],11)
s.ecrire("c7-volume1.svg")

s=S("Volume 2 : 60 cm autour du volume 1","Volume 2 : une bande de 60 cm autour du volume 1, sur la même hauteur de 2,25 m. Matériel IPX4 minimum. Une paroi fixe limite le volume, mais il la contourne",640,410)
x,w=sdb_base(s,v0=True,v1=True,v2=True)
s.t(x+w/2,Hb(1.5),"volume 1",11,True,BLUE); s.t(x+w+30,Hb(1.8),"V2",13,True,"#b07a00")
s.a(f'<path d="M{x+w} {Hb(2.4):.0f} H{x+w+60}" stroke="{INK}" stroke-width="2"/><path d="M{x+w} {Hb(2.4)-6:.0f} v12 M{x+w+60} {Hb(2.4)-6:.0f} v12" stroke="{INK}" stroke-width="2"/>'); s.t(x+w+30,Hb(2.4)-10,"60 cm",11,True)
cote_v(s,110,Hb(2.25),SOLb,"2,25 m")
s.t(500,110,"VOLUME 2",13,True,"#b07a00"); s.t(500,134,"60 cm autour du volume 1",10.5); s.t(500,156,"même hauteur : 2,25 m",10.5); s.t(500,190,"IPX4 minimum",12,True)
bande(s,354,40,["Une paroi fixe limite le volume, mais il la contourne"],11)
s.ecrire("c7-volume2.svg")

s=S("Volume caché : sous la baignoire","Volume caché : l'espace fermé sous la baignoire ou le receveur. Matériel admis, IPX4 et protégé par un différentiel 30 mA ; appareillage interdit, ni prise ni interrupteur",640,410)
x,w=sdb_base(s,v0=False,cache=True)
s.t(x+w/2,SOLb-20,"VOLUME CACHÉ",11,True,INK)
s.t(450,96,"sous la baignoire",11.5); s.t(450,118,"ou le receveur",11.5)
carte(s,360,140,264,74); s.t(492,170,"MATÉRIEL : OUI",13,True,GRN); s.t(492,196,"IPX4 + DDR 30 mA",11.5,True)
carte(s,360,224,264,74); s.t(492,254,"APPAREILLAGE : NON",13,True,RED); s.t(492,280,"ni prise, ni interrupteur",10.5)
s.ecrire("c7-cache.svg")

s=S("Ce qui est admis, volume par volume","Matériel admis : volume 0, IPX7 et TBTS 12 V uniquement ; volume 1, IPX4, IPX5 si jets horizontaux, TBTS 12 V et chauffe-eau instantané ; volume 2, IPX4, classe II, prise rasoir de 20 à 50 VA ; hors volume, prises et interrupteurs 230 V, lave-linge, tout sous différentiel 30 mA",640,440)
for r,(t,c,l1,l2) in enumerate((("VOLUME 0","#2166d1","IPX7","TBTS 12 V uniquement"),("VOLUME 1",BLUE,"IPX4 (IPX5 si jets horizontaux)","TBTS 12 V · chauffe-eau instantané"),("VOLUME 2","#b07a00","IPX4 (IPX5 si jets horizontaux)","classe II · prise rasoir 20 à 50 VA"),("HORS VOLUME",GRN,"prises et interrupteurs 230 V","lave-linge · tout sous DDR 30 mA"))):
    y=44+r*86; carte(s,16,y,608,78)
    s.a(f'<rect x="32" y="{y+16}" width="132" height="46" rx="8" fill="{c}"/>'); s.t(98,y+45,t,11.5,True,"#fff")
    s.t(186,y+34,l1,12,True,INK,"start"); s.t(186,y+58,l2,10.5,False,GR,"start")
bande(s,392,40,["Volume caché : matériel IPX4 + 30 mA, jamais d'appareillage"],10.5)
s.ecrire("c7-materiel.svg")

s=S("LES : tout au même potentiel","Liaison équipotentielle supplémentaire : les canalisations métalliques, l'huisserie métallique et la baignoire en métal sont reliées au conducteur de protection. Jamais raccordée à un appareil de classe II",640,420)
piece(s,40,600)
s.a(f'<rect x="470" y="{Hb(2.04):.0f}" width="90" height="{SOLb-Hb(2.04):.0f}" fill="none" stroke="#7d858e" stroke-width="7"/>')
baignoire(s,150,170)
for k,c in enumerate(("#c9782f","#7d858e")): s.a(f'<path d="M{80+k*20} {Hb(2.5):.0f} V{SOLb}" stroke="{c}" stroke-width="10"/>')
trait(s,f"M90 {Hb(1.0):.0f} H360","vj",4); trait(s,f"M235 {Hb(1.0):.0f} V{SOLb-58}","vj",4); trait(s,f"M360 {Hb(1.0):.0f} H470","vj",4)
s.a(f'<rect x="330" y="{Hb(1.0)-14:.0f}" width="36" height="28" rx="4" fill="#d9b25a" stroke="#8a6416"/>')
trait(s,f"M348 {Hb(1.0)+14:.0f} V{SOLb}","vj",4)
for x,y in ((90,Hb(1.0)),(235,SOLb-58),(470,Hb(1.0))): s.a(f'<circle cx="{x}" cy="{y:.0f}" r="5" fill="#2e9e4f" stroke="#fff" stroke-width="1.5"/>')
s.t(90,Hb(2.6)+6,"canalisations",10.5,True); s.t(515,Hb(2.04)-10,"huisserie métal",10.5,True); s.t(235,SOLb-70,"baignoire métal",10.5,True); s.t(348,SOLb+28,"vers le PE",10.5,True,GRN)
bande(s,370,40,["Jamais raccordée à un appareil de classe II"],11)
s.ecrire("c7-les.svg")
print("module 7 : 7 images")

# =====================================================================
# MODULE 8 — le matériel et son environnement
# =====================================================================
def plaque_sig(s,x,y,w,h,classe="II",ip="IP44",ik="IK08"):
    s.a(f'<g filter="url(#ombre)"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#e8eaed" stroke="#7d858e" stroke-width="2"/></g>')
    s.a(f'<text x="{x+14}" y="{y+28}" font-size="13" font-weight="800" fill="{INK}">230 V~ 50 Hz</text><text x="{x+14}" y="{y+50}" font-size="13" font-weight="800" fill="{INK}">2 000 W</text>')
    s.a(f'<rect x="{x+14}" y="{y+62}" width="26" height="26" fill="none" stroke="{INK}" stroke-width="2.4"/><rect x="{x+20}" y="{y+68}" width="14" height="14" fill="none" stroke="{INK}" stroke-width="2.4"/>')
    s.a(f'<text x="{x+52}" y="{y+82}" font-size="14" font-weight="800" fill="{BLUE}">{ip}</text><text x="{x+110}" y="{y+82}" font-size="14" font-weight="800" fill="#b85a08">{ik}</text>')
def double_carre(s,cx,cy,t=40): s.a(f'<rect x="{cx-t/2}" y="{cy-t/2}" width="{t}" height="{t}" fill="none" stroke="{INK}" stroke-width="3"/><rect x="{cx-t/4}" y="{cy-t/4}" width="{t/2}" height="{t/2}" fill="none" stroke="{INK}" stroke-width="3"/>')
def losange3(s,cx,cy,t=40): s.a(f'<path d="M{cx} {cy-t/2} L{cx+t/2} {cy} L{cx} {cy+t/2} L{cx-t/2} {cy} Z" fill="none" stroke="{INK}" stroke-width="3"/><text x="{cx}" y="{cy+6}" text-anchor="middle" font-size="{t*.36:.0f}" font-weight="800" fill="{INK}">III</text>')

s=S("Un matériel, deux questions","Deux questions devant un matériel, lues sur sa plaque signalétique : sa classe, I, II ou III, qui dit comment il protège contre les chocs électriques ; ses indices IP et IK, qui disent sa résistance à l'eau, à la poussière et aux chocs")
plaque_sig(s,220,52,200,104); s.t(320,176,"plaque signalétique",11,True)
s.a(f'<path d="M248 160 Q190 190 164 220 M380 160 Q440 190 476 220" fill="none" stroke="{GR}" stroke-width="1.6" stroke-dasharray="5 4"/>')
carte(s,16,222,296,130); s.t(164,250,"LA CLASSE",13.5,True,AMB); s.t(164,276,"protection contre",11); s.t(164,296,"les chocs électriques",11); s.t(164,330,"I · II · III",14,True)
carte(s,328,222,296,130); s.t(476,250,"IP et IK",13.5,True,BLUE); s.t(476,276,"résistance à",11); s.t(476,296,"l'environnement",11); s.t(476,330,"eau · poussière · chocs",11.5,True)
s.ecrire("c8-deux-questions.svg")

s=S("Classe I : la sécurité par la terre","Classe I : isolation principale et borne de terre obligatoire, la masse métallique est reliée au conducteur de protection. Lave-linge, four, réfrigérateur. Sans terre raccordée, un matériel de classe I n'est plus protégé")
lavelinge(s,150,170,120)
trait(s,"M150 246 V286 H300","vj",6); s.a('<rect x="300" y="272" width="50" height="30" rx="5" fill="#d9b25a" stroke="#8a6416"/>'); s.t(325,322,"PE",11,True,GRN)
g_(s,380,262,0,sym_terre())
s.t(470,92,"CLASSE I",15,True,AMB); s.t(470,122,"isolation principale",11); s.t(470,146,"+ borne de terre",11,True); s.t(470,166,"obligatoire",11,True); s.t(470,198,"masse reliée au PE",11,False,GRN); s.t(470,236,"lave-linge, four,",10.5,False,GR); s.t(470,256,"réfrigérateur",10.5,False,GR)
bande(s,340,52,["Sans terre raccordée, un matériel de classe I","n'est plus protégé"],11)
s.ecrire("c8-classe1.svg")

s=S("Classe II : la double isolation","Classe II : double isolation, symbole du double carré, pas de borne de terre, jamais reliée au conducteur de protection. Perceuse, sèche-cheveux, luminaires. Sa protection ne dépend pas de la terre")
s.a('<g filter="url(#ombre)"><path d="M70 130 H210 q20 0 20 20 v20 q0 20 -20 20 H150 l-14 80 h-46 l12 -80 H70 q-14 0 -14 -14 v-32 q0 -14 14 -14 Z" fill="#2f6fd0" stroke="#1d4a94" stroke-width="2"/></g><rect x="230" y="152" width="44" height="16" fill="url(#acierH)" stroke="#7d858e"/><path d="M274 160 H304" stroke="#5b6673" stroke-width="4"/>')
double_carre(s,130,160,34)
trait(s,"M110 270 Q120 320 200 310",NOIR,5); s.a('<rect x="198" y="298" width="30" height="24" rx="6" fill="#2b3036"/><rect x="228" y="304" width="14" height="4" fill="#aab1b9"/><rect x="228" y="312" width="14" height="4" fill="#aab1b9"/>')
s.t(256,330,"2 broches, pas de terre",10,False,GR,"start")
s.t(470,86,"le double carré",11,True,GR); double_carre(s,470,124,40)
s.t(470,180,"CLASSE II",15,True,BLUE); s.t(470,206,"double isolation",11.5,True); s.t(470,228,"pas de borne de terre",11); s.t(470,250,"jamais reliée au PE",11,False,RED); s.t(470,280,"perceuse, sèche-cheveux,",10,False,GR); s.t(470,298,"luminaires",10,False,GR)
bande(s,346,46,["Sa protection ne dépend pas de la terre"],12)
s.ecrire("c8-classe2.svg")

s=S("Classe III : la très basse tension","Classe III : symbole du losange III, alimentée en très basse tension de sécurité, au plus 50 V en alternatif et 120 V en continu lisse, par une source de sécurité. Spots 12 V, jouets",640,420)
s.a(f'<g filter="url(#ombre)"><rect x="40" y="120" width="96" height="74" rx="8" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/></g>'); s.t(88,152,"230 V",11,True,RED); s.t(88,176,"→ 12 V",11,True,BLUE)
s.t(88,214,"source de sécurité",10,False,GR)
trait(s,"M136 156 H230",BLUE,4)
for k in range(3): s.a(f'<g transform="translate({250+k*46} 156)"><path d="M-14 -16 h28 l-6 22 h-16 Z" fill="#aab1b9" stroke="#7d858e"/><circle cx="0" cy="12" r="9" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/></g>')
trait(s,"M230 156 H360",BLUE,3)
losange3(s,470,92,44); s.t(470,138,"le losange III",10.5,False,GR)
s.t(470,170,"CLASSE III",15,True,GRN); s.t(470,196,"alimentée en TBTS",11.5,True)
carte(s,16,244,296,74); s.t(164,276,"≤ 50 V",17,True); s.t(164,302,"en alternatif",11,False,GR)
carte(s,328,244,296,74); s.t(476,276,"≤ 120 V",17,True); s.t(476,302,"en continu lisse",11,False,GR)
s.t(320,346,"spots 12 V, jouets",11,False,GR)
bande(s,362,46,["Source de sécurité, circuits séparés de la terre"],11.5)
s.ecrire("c8-classe3.svg")

s=S("Lire un indice IP","Lire un indice IP : le premier chiffre concerne les solides, 2 un doigt de 12,5 mm, 4 un fil de 1 mm, 5 protégé de la poussière, 6 étanche à la poussière ; le second l'eau, 4 projections, 5 jets, 7 immersion temporaire, 8 immersion prolongée. X : chiffre non précisé",640,440)
s.a(f'<rect x="200" y="46" width="240" height="78" rx="14" fill="{INK}"/><text x="262" y="102" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">IP</text><text x="348" y="102" text-anchor="middle" font-size="44" font-weight="800" fill="#ffd23f">4</text><text x="398" y="102" text-anchor="middle" font-size="44" font-weight="800" fill="#7fd3ff">4</text>')
s.a(f'<path d="M348 124 V146 H164 V158 M398 124 V146 H476 V158" fill="none" stroke="{GR}" stroke-width="2"/>')
s.panneau(16,160,296,240); s.panneau(328,160,296,240)
s.t(164,188,"1er chiffre : les solides",12,True,"#b07a00"); s.t(476,188,"2e chiffre : l'eau",12,True,BLUE)
for k,l in enumerate(("2 : un doigt (12,5 mm)","4 : un fil (1 mm)","5 : protégé de la poussière","6 : étanche à la poussière")): s.t(40,226+k*40,l,11,False,INK,"start")
for k,l in enumerate(("4 : projections","5 : jets","7 : immersion temporaire","8 : immersion prolongée")): s.t(352,226+k*40,l,11,False,INK,"start")
s.t(320,426,"X = chiffre non précisé",11,True)
s.ecrire("c8-indice-ip.svg")

s=S("Indice IK : l'énergie du choc encaissé","Indice IK, la résistance aux chocs en joules : IK00 aucune protection, IK07 2 joules, IK08 5 joules, IK10 20 joules. Plus l'IK est élevé, plus le matériel encaisse les chocs")
for i,(ik,j,r) in enumerate((("IK00","aucune",0),("IK07","2 J",10),("IK08","5 J",15),("IK10","20 J",24))):
    x=16+154*i; cx=x+73; carte(s,x,44,146,270)
    s.t(cx,74,ik,15,True,"#b85a08")
    if r: s.a(f'<path d="M{cx} 92 V{170-r}" stroke="{GR}" stroke-width="2" stroke-dasharray="4 3"/><circle cx="{cx}" cy="{170-r}" r="{r}" fill="url(#acierH)" stroke="#5b6673" stroke-width="2"/>')
    s.a(f'<rect x="{cx-44}" y="172" width="88" height="34" rx="6" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/>')
    s.t(cx,262,j,17 if r else 13,True)
bande(s,330,52,["Plus l'IK est élevé, plus le matériel","encaisse les chocs"],11.5)
s.ecrire("c8-indice-ik.svg")

s=S("À chaque local son matériel","Choisir selon le local : salon sec, IP20 ; salle de bain, IPX4 à IPX7 selon le volume ; extérieur, IP44 ou plus, avec un bon IK ; atelier poussiéreux, IP5X ou IP6X ; parking ou local public, IK élevé",640,440)
for r,(lieu,v) in enumerate((("Salon sec","IP20"),("Salle de bain","IPX4 à IPX7 selon le volume"),("Extérieur","IP44 ou plus, avec un bon IK"),("Atelier poussiéreux","IP5X ou IP6X"),("Parking, local public","IK élevé"))):
    y=44+r*72; carte(s,16,y,608,64)
    ic=["#e8d9bf","#cfe3f7","#d9ecd2","#e4e7ea","#d5d9de"][r]
    s.a(f'<rect x="30" y="{y+10}" width="44" height="44" rx="10" fill="{ic}" stroke="#aab1b9"/>')
    s.t(92,y+38,lieu,12.5,True,INK,"start"); s.t(600,y+38,v,12,True,BLUE if r!=4 else "#b85a08","end")
bande(s,410,24,["On ne sous-classe jamais un matériel"],10.5)
s.ecrire("c8-locaux.svg")
print("module 8 : 7 images")

# =====================================================================
# MODULE 9 — travailler en sécurité
# =====================================================================
def vat_ic(s,cx,cy,k=1.0):
    s.a(f'<g transform="translate({cx} {cy}) scale({k})" filter="url(#ombre)"><rect x="-26" y="-50" width="52" height="96" rx="10" fill="#f2b90c" stroke="#b98a05" stroke-width="2"/><rect x="-18" y="-40" width="36" height="34" rx="3" fill="#2b3036"/>'
        '<circle cx="-8" cy="-30" r="3" fill="#ff5c5c"/><circle cx="0" cy="-30" r="3" fill="#ffd23f"/><circle cx="8" cy="-30" r="3" fill="#4cd97b"/><path d="M0 46 V70" stroke="#d92b2b" stroke-width="5"/><rect x="-4" y="66" width="8" height="18" rx="2" fill="#aab1b9"/></g>')
def cadenas(s,cx,cy,c="#d92b2b"): s.a(f'<path d="M{cx-11} {cy} V{cy-10} a11 11 0 0 1 22 0 V{cy}" fill="none" stroke="#7d858e" stroke-width="5"/><rect x="{cx-17}" y="{cy}" width="34" height="28" rx="5" fill="{c}"/><circle cx="{cx}" cy="{cy+13}" r="4" fill="#fff"/>')

s=S("L'habilitation : c'est l'employeur qui la délivre","L'habilitation : une formation à la prévention du risque électrique, puis l'employeur vérifie l'aptitude et habilite, enfin un titre d'habilitation signé par l'employeur. Recyclage recommandé tous les 3 ans",640,420)
for i,(t,l1,l2) in enumerate((("FORMATION","à la prévention du","risque électrique"),("EMPLOYEUR","il vérifie l'aptitude","et il habilite"),("TITRE","d'habilitation","signé par l'employeur"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,240); s.t(cx,72,t,13,True,AMB)
    if i==0: s.a(f'<rect x="{cx-44}" y="96" width="88" height="62" rx="6" fill="#fff" stroke="#8d949c" stroke-width="2"/><path d="M{cx-30} 116 H{cx+30} M{cx-30} 132 H{cx+16}" stroke="#aab1b9" stroke-width="3"/><path d="M{cx-20} 170 l20 -10 l20 10 l-20 10 z" fill="{INK}"/>')
    elif i==1: s.a(f'<circle cx="{cx}" cy="112" r="20" fill="#5b6673"/><path d="M{cx-34} 176 q34 -44 68 0 z" fill="#5b6673"/>')
    else: s.a(f'<g filter="url(#ombre)"><rect x="{cx-50}" y="98" width="100" height="66" rx="8" fill="#fff" stroke="#8d949c" stroke-width="2"/></g><rect x="{cx-42}" y="108" width="26" height="30" rx="3" fill="#d5d9de"/><text x="{cx+16}" y="130" text-anchor="middle" font-size="18" font-weight="800" fill="{BLUE}">B1V</text><path d="M{cx-8} 152 q10 -8 20 0 t20 0" fill="none" stroke="{INK}" stroke-width="2"/>')
    s.t(cx,222,l1,11,True); s.t(cx,244,l2,10.5,False,GR)
for x in (216,420): s.a(f'<path d="M{x-8} 140 H{x+8}" stroke="{AMB}" stroke-width="4"/><polygon points="{x+6},132 {x+18},140 {x+6},148" fill="{AMB}"/>')
bande(s,300,46,["Recyclage recommandé tous les 3 ans"],12)
s.t(320,380,"L'habilitation n'est pas une compétence métier",11,True,RED)
s.ecrire("c9-habilitation.svg")

s=S("Lire un symbole : l'exemple B1V","Lire un symbole d'habilitation : B1V. La première lettre donne la tension, B basse tension, H haute tension ; le deuxième caractère le rôle, 0, 1, 2, R, S, C, E ; la lettre finale l'attribut, V au voisinage, T sous tension",640,430)
for i,(L,t,l1,l2,c) in enumerate((("B","LA TENSION","B = basse tension","H = haute tension",RED),("1","LE RÔLE","0 · 1 · 2","R · S · C · E",BLUE),("V","L'ATTRIBUT","V = au voisinage","T = sous tension",GRN))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250)
    s.a(f'<rect x="{cx-40}" y="60" width="80" height="80" rx="14" fill="{c}"/><text x="{cx}" y="118" text-anchor="middle" font-size="52" font-weight="800" fill="#fff">{L}</text>')
    s.t(cx,176,t,12.5,True,c); s.t(cx,214,l1,11.5); s.t(cx,240,l2,11.5)
bande(s,310,46,["B1V : basse tension · exécutant · au voisinage"],12)
s.t(320,390,"On lit caractère par caractère, de gauche à droite",11,False,GR)
s.ecrire("c9-symbole.svg")

s=S("Les habilitations qu'on croise le plus","Habilitations courantes : B0, non-électricien, travaux non électriques ; BS, intervention élémentaire hors tension ; BR, intervention générale, dépannage et mesures ; BC, chargé de consignation",640,410)
for r,(b,t,d,c) in enumerate((("B0","non-électricien","travaux non électriques, sans toucher aux ouvrages",GR),("BS","intervention élémentaire","hors tension, remplacement à l'identique",GRN),("BR","intervention générale","dépannage, recherche de panne, mesures",BLUE),("BC","chargé de consignation","met l'installation en sécurité pour les autres",AMB))):
    y=44+r*88; carte(s,16,y,608,80)
    s.a(f'<rect x="32" y="{y+14}" width="80" height="52" rx="10" fill="{c}"/><text x="72" y="{y+49}" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">{b}</text>')
    s.t(132,y+34,t,13,True,INK,"start"); s.t(132,y+58,d,10.5,False,GR,"start")
s.ecrire("c9-titres.svg")

s=S("La consignation : 4 étapes, dans cet ordre","La consignation en quatre étapes : 1, séparer l'ouvrage de toute source ; 2, condamner en position ouverte avec un cadenas et une pancarte ; 3, identifier le bon ouvrage ; 4, vérifier l'absence de tension avec un vérificateur dédié",640,420)
for r,(t,l1,l2) in enumerate((("1 · SÉPARER","isoler l'ouvrage de toute source","ouvrir le disjoncteur, retirer les fusibles"),("2 · CONDAMNER","bloquer en position ouverte","cadenas + pancarte « ne pas manœuvrer »"),("3 · IDENTIFIER","être sûr du bon ouvrage","plans, repérage sur place"),("4 · VÉRIFIER","l'absence de tension (VAT)","avec un vérificateur dédié"))):
    y=44+r*90; carte(s,16,y,608,82)
    if r==0: disj(s,48,y+6,0.29,"",None,False,False)
    elif r==1: cadenas(s,68,y+32)
    elif r==2: s.a(f'<rect x="44" y="{y+16}" width="52" height="50" rx="4" fill="#fff" stroke="#8d949c" stroke-width="2"/><path d="M52 {y+30} H88 M52 {y+42} H80 M52 {y+54} H86" stroke="#aab1b9" stroke-width="3"/>')
    else: vat_ic(s,70,y+36,0.55)
    s.t(124,y+28,t,13,True,AMB,"start"); s.t(124,y+52,l1,11.5,True,INK,"start"); s.t(124,y+72,l2,10,False,GR,"start")
s.ecrire("c9-consignation.svg")

s=S("La VAT : tester, vérifier, retester","Vérification d'absence de tension en trois temps : tester le vérificateur sur une source connue ; vérifier entre tous les conducteurs et par rapport à la terre ; retester le vérificateur aussitôt après. Au plus près de la zone de travail, avec un vérificateur dédié",640,420)
for i,(t,l1,l2) in enumerate((("1 · TESTER","le vérificateur, sur","une source connue"),("2 · VÉRIFIER","entre tous les","conducteurs + la terre"),("3 · RETESTER","le vérificateur,","aussitôt après"))):
    x=16+204*i; cx=x+98; carte(s,x,44,196,250); s.t(cx,72,t,13,True,AMB)
    vat_ic(s,cx-20,150,0.85)
    if i!=1: s.a(f'<rect x="{cx+18}" y="126" width="40" height="40" rx="6" fill="#fff1c2" stroke="#e0a800" stroke-width="2"/><path d="M{cx+40} 132 l-8 14 h10 l-8 14" fill="none" stroke="#e0a800" stroke-width="2.6"/>')
    else:
        for k,c in enumerate((RED,BLUE,"vj")): fil(s,cx+10,124+k*20,40,12,c,14,6)
    s.t(cx,238,l1,11.5,True); s.t(cx,260,l2,10.5)
bande(s,310,40,["Au plus près de la zone de travail"],12)
s.t(320,388,"Un vérificateur dédié, jamais un simple multimètre",11,True,RED)
s.ecrire("c9-vat.svg")

s=S("Se protéger : individuel et collectif","Protections individuelles, les EPI : gants isolants vérifiés, écran facial, casque isolant, chaussures de sécurité, vêtements couvrants. Protections collectives : nappes isolantes, balisage de la zone, cadenas de condamnation, pancartes",640,430)
s.panneau(16,44,296,320); s.panneau(328,44,296,320)
s.t(164,72,"INDIVIDUEL (EPI)",13.5,True,AMB); s.t(476,72,"COLLECTIF",13.5,True,BLUE)
s.a('<path d="M60 150 V104 q0 -8 7 -8 q7 0 7 8 V96 q0 -8 7 -8 q7 0 7 8 v4 q0 -8 7 -8 q7 0 7 8 v10 q0 -8 7 -8 q7 0 7 8 V160 q0 18 -24 20 h-8 q-26 -2 -26 -30 Z" fill="#f2c200" stroke="#b08900" stroke-width="2"/>')
s.a('<path d="M150 136 a40 34 0 0 1 80 0 Z" fill="#f4f5f7" stroke="#8d949c" stroke-width="2"/><rect x="146" y="134" width="88" height="10" rx="4" fill="#e4e7ea" stroke="#8d949c"/><path d="M160 146 h60 v34 q-30 14 -60 0 Z" fill="#cfe3f7" opacity=".8" stroke="#7d858e"/>')
s.a('<path d="M250 150 h30 v20 h22 q8 0 8 10 v6 h-60 Z" fill="#2b3036"/>')
for k,l in enumerate(("gants isolants vérifiés","écran facial","casque isolant","chaussures de sécurité","vêtements couvrants")): s.t(164,222+k*26,l,11,False,INK)
s.a('<rect x="350" y="150" width="120" height="40" rx="4" fill="#f2c200" stroke="#b08900"/>')
for k in range(5): s.a(f'<rect x="{486+k*24}" y="110" width="12" height="70" fill="{["#d92b2b","#fff"][k%2]}" stroke="#aab1b9"/>'.replace("width=\"12\" height=\"70\"",f'width="24" height="10"').replace(f'y="110"',f'y="{120}"'))
s.a('<path d="M486 125 H606" stroke="#d92b2b" stroke-width="10" stroke-dasharray="12 12"/><path d="M486 125 H606" stroke="#fff" stroke-width="10" stroke-dasharray="12 12" stroke-dashoffset="12"/><rect x="482" y="118" width="6" height="64" fill="#5b6673"/><rect x="604" y="118" width="6" height="64" fill="#5b6673"/>')
cadenas(s,540,150)
for k,l in enumerate(("nappes isolantes","balisage de la zone","cadenas de condamnation","pancartes")): s.t(476,222+k*26,l,11,False,INK)
bande(s,378,46,["Un EPI abîmé ne protège plus : on le contrôle avant chaque usage"],10)
s.ecrire("c9-epi.svg")

s=S("Travailler en hauteur","Travail en hauteur : le pied de l'échelle s'écarte du quart de la hauteur ; une échelle n'est pas un poste de travail. Échafaudage roulant : 8 m au plus en extérieur, 12 m en intérieur",640,420)
s.panneau(16,44,296,290); s.panneau(328,44,296,290)
G=290; T=70; Hh=G-T; FX=230-Hh/4
s.a(f'<rect x="230" y="56" width="16" height="{G-56}" fill="#d5d9de"/><rect x="30" y="{G}" width="270" height="8" fill="#b9bfc6"/>')
s.a(f'<path d="M{FX} {G} L226 {T} M{FX+20} {G} L240 {T+22}" stroke="#aab1b9" stroke-width="7" stroke-linecap="round"/>')
for k in range(8):
    t=(k+1)/9; x1=FX+(226-FX)*t; y1=G-Hh*t; x2=FX+20+(240-FX-20)*t; y2=G-(Hh-22)*t
    s.a(f'<path d="M{x1:.0f} {y1:.0f} L{x2:.0f} {y2:.0f}" stroke="#7d858e" stroke-width="4"/>')
s.a(f'<path d="M140 {T} V{G}" stroke="{INK}" stroke-width="2"/><path d="M134 {T} h12 M134 {G} h12" stroke="{INK}" stroke-width="2"/>'); s.t(130,(T+G)/2+6,"H",15,True,INK,"end")
s.a(f'<path d="M{FX} {G+18} H230" stroke="{AMB}" stroke-width="2.4"/><path d="M{FX} {G+12} v12 M230 {G+12} v12" stroke="{AMB}" stroke-width="2.4"/>'); s.t((FX+230)/2,G+40,"H / 4",11,True,AMB)
s.t(26,214,"pied écarté",10,True,AMB,"start"); s.t(26,232,"du quart de",10,False,INK,"start"); s.t(26,250,"la hauteur",10,False,INK,"start")
s.a('<rect x="380" y="96" width="140" height="10" fill="#7d858e"/>')
for y in (106,166,226):
    s.a(f'<path d="M386 {y} V{y+60} M514 {y} V{y+60}" stroke="#aab1b9" stroke-width="5"/><path d="M386 {y} L514 {y+60} M514 {y} L386 {y+60}" stroke="#c5cad0" stroke-width="2.5"/><rect x="380" y="{y+56}" width="140" height="8" fill="#7d858e"/>')
for x in (392,508): s.a(f'<circle cx="{x}" cy="296" r="9" fill="#2b3036"/>')
s.a('<path d="M380 96 V70 M520 96 V70 M380 76 H520" stroke="#f2a20c" stroke-width="4"/>')
s.t(572,130,"8 m",16,True,AMB); s.t(572,152,"extérieur",10.5,False,GR); s.t(572,206,"12 m",16,True,BLUE); s.t(572,228,"intérieur",10.5,False,GR)
s.t(450,318,"échafaudage roulant",11,True)
bande(s,350,46,["Une échelle n'est pas un poste de travail"],12)
s.ecrire("c9-hauteur.svg")
print("module 9 : 7 images")

