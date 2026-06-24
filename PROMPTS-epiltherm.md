# KIT DE PROMPTS — ÉPILTHERM (méthode AZZAGENCY)

Tout est prêt à copier-coller. Ordre : **1)** Partie 1 dans Claude Code (base du site) → **2)** Partie 2 dans Higgsfield (keyframes + vidéos) → **3)** montage ffmpeg → frames → la base les consomme.

**Le concept hero (1 seule idée, du hero au footer) :** « Le filament & l'étincelle ». Macro hyper-réaliste, registre pub d'horlogerie (Rolex / Cartier) : la micro-aiguille de précision d'Épiltherm s'éveille, une étincelle d'énergie rose-or (les 27 MHz) la parcourt, atteint la pointe et éclôt en lumière. La précision qui devient libération — le parcours de Saira, de l'ombre vers la lumière. 3 actes = 3 clips chaînés. Aucune peau, aucun follicule, aucun corps : uniquement l'instrument et la lumière sur fond noir.

**Palette (tirée de son vrai site) :** ivoire/greige `#EBEAE4`, encre charbon `#211F1D`, rose poudré `#E7B4CD` → mauve `#C98AB0`, surface rose pâle `#F8EDF3`, blanc `#FFFFFF`. Hero = noir chaud profond `#14110F`.

---

# PARTIE 1 — PROMPT « BASE DU SITE » (à coller dans Claude Code)

> Construis un site **one-page immersif** pour **Épiltherm**, institut d'épilation définitive féminine par électrolyse (thermolyse) à Vaulx-en-Velin (Lyon). **Vanilla HTML/CSS/JS**, aucun framework, aucun localStorage. `lang="fr"`. Toutes les libs depuis **JSDELIVR uniquement** (jamais cdnjs) : GSAP 3.13 + ScrollTrigger + SplitText + Lenis 1.0.42. Versionne les scripts (`?v=1`). Git commit à chaque étape. Teste avec `python3 -m http.server 8765`, onglet actif au premier plan.
>
> ## DIRECTION ARTISTIQUE
> Registre éditorial, féminin, premium, clinique-doux. Variables CSS :
> `--bg:#EBEAE4` (ivoire/greige), `--ink:#211F1D` (charbon), `--rose:#E7B4CD`, `--mauve:#C98AB0`, `--rose-50:#F8EDF3`, `--white:#FFF`, `--noir:#14110F` (le hero). Accent = dégradé `--rose → --mauve`. Cartes blanches/rose pâle, grands rayons (~22-28px), ombres très douces, beaucoup de blanc.
> **Typo** (Google Fonts, jamais Inter/Roboto/Poppins) : **Fraunces** (serif display + italiques pour les mots accentués), **Hanken Grotesk** (UI/corps), **JetBrains Mono** (kickers type `[ MÉTHODE ]`). Échelle en `clamp()`. **Typo FR** : espaces fines insécables avant `; : ! ?`, guillemets `«　»`, apostrophes typographiques `'`.
> Le **hero est sombre** (`--noir`) et héberge la séquence cinématique ; tout le reste du site est **clair** (ivoire). Logo = `é` minuscule italique serif + `therm` en grotesque, et une petite initiale `é` dans un cercle dégradé rose→mauve.
>
> ## HERO IMMERSIF (technique Apple — canvas scrubé, PAS de <video>)
> Hero **pinné** au ScrollTrigger (~550-650vh). On scrube une **séquence d'images** sur un `<canvas>`, deux jeux : `frames/desktop/frame_###.jpg` (paysage) et `frames/mobile/frame_###.jpg` (portrait). Constante `FRAME_COUNT = 122` (frames déjà générées dans `frames/desktop/` et `frames/mobile/`, format `frame_%03d.jpg`). Détection device (largeur < 768 ou userAgent → mobile). **Préchargement de toutes les frames + loader branché dessus** (préchargeur plein écran avec la marque + % + barre). Progression scroll 0→1 mappée sur l'index de frame, `scrub:0.8`, `devicePixelRatio` géré, redraw au `resize`.
> **PIÈGES À CODER D'EMBLÉE :**
> - **FAILSAFE de déverrouillage** armé tout en HAUT du script hero : `setTimeout(()=>document.documentElement.classList.remove('is-locked'),7000)`. Le `<html>` démarre en `.is-locked` (overfl:hidden) ; on retire la classe une fois les frames prêtes OU au failsafe, quoi qu'il arrive.
> - Gardes : `if(!canvas){unlock();return;}`, `if(!ctx){unlock();return;}`, `if(!cue)return;` dans toute fonction appelée par frame.
> - `invalidateOnRefresh:true` sur le ScrollTrigger du hero + `ScrollTrigger.refresh()` au resize.
> - Overlays texte du hero synchronisés par **fenêtres de progression** (0-0.33 / 0.33-0.66 / 0.66-1). Titre : « L'épilation électrique par *thermolyse* » (le mot *thermolyse* en italique serif, dégradé rose). Sous-titre : « La seule méthode reconnue comme 100 % définitive. » CTA « Prendre rendez-vous ». Indice « Défiler ».
>
> ## SMOOTH SCROLL + ANIMATIONS
> Lenis branché à ScrollTrigger (`lenis.on('scroll',ScrollTrigger.update)` + `gsap.ticker.add(t=>lenis.raf(t*1000))` + `lagSmoothing(0)`), boucle de retry bornée (~40 essais), `ScrollTrigger.refresh()` après branchement.
> **Sous le hero pinné**, les count-up et reveals critiques sont pilotés par **IntersectionObserver / rAF auto-arrêté** (PAS ScrollTrigger, à cause du pin). Textes : **SplitText line-reveal** masqué (overflow hidden, translateY, stagger), **UNE seule courbe signature** (ex. `cubic-bezier(.22,1,.36,1)`). `transform/opacity` only, 60fps. **`prefers-reduced-motion` sur CHAQUE animation.**
> Nav flottante qui apparaît après le hero + menu plein écran mobile. FAQ en accordéon `<details>`. Avis en **marquee** double ligne sens opposés. Footer avec « épiltherm » géant en outline qui se **remplit au scroll**.
>
> ## STRUCTURE (one-page longue et enrichie, dans cet ordre)
> 1. **Préchargeur** → 2. **Nav** (Méthode, Services, Tarifs, Histoire, FAQ + CTA Planity) → 3. **Hero** (canvas) → 4. **Méthode / manifeste** (« La thermolyse traite chaque poil individuellement, grâce à un courant haute fréquence qui cible le follicule et neutralise les cellules de la repousse. ») + bande de stats (count-up **27 MHz**, **100 % définitive**, « Poil par poil », « Usage unique ») → 5. **Pourquoi** (6 atouts : Résultats durables · Méthode précise · Adaptée à toutes les zones · Réduction progressive · Tous types de peau · Traitement professionnel) → 6. **Services** (3 cartes : Épilation thermique / Électrolyse · Consultation & diagnostic personnalisé · Confort & sécurité) → 7. **Le parcours** (01 La première consultation · 02 La séance · 03 Le suivi, avec les 3 vraies photos) → 8. **L'appareil** (Apilus, 27 MHz, micro-filament, vraie photo) → 9. **Tarifs** (panneau rose, 9 lignes) → 10. **Histoire de Saira & Épiltherm** (4 chapitres SOPK) → 11. **Citation fondatrice** pleine largeur → 12. **Nos engagements** (3 cartes) → 13. **Avis** (marquee, 5 avis réels « janvier 2026 ») → 14. **FAQ** (7 questions) → 15. **CTA finale + Footer**.
>
> ## CONTENU RÉEL (à utiliser tel quel, ne rien inventer)
> **CTA / RDV (partout) :** https://www.planity.com/electrolyse-thermolyse-epiltherm-69120-vaulx-en-velin — **Instagram :** https://www.instagram.com/epiltherm/ — **Lieu :** Vaulx-en-Velin (69120), métropole de Lyon. **Concept :** « De la résilience personnelle à l'excellence clinique. » **Appareil :** Apilus XCell Pro, 27 MHz. **Soin inclus :** Vitaphase (luminothérapie, cataphorèse, micro-vibrations).
>
> **Manifeste :** « La thermolyse consiste à traiter chaque poil individuellement grâce à un courant de haute fréquence qui cible le follicule pileux et détruit les cellules responsables de la repousse. Au fil des séances, le poil s'affine puis cesse progressivement de repousser. Adaptée à tous les types de peau et aux zones sensibles du visage comme du corps. »
>
> **6 atouts :** *Résultats durables* — agit à la racine pour freiner durablement la repousse, résultats progressifs. *Méthode précise* — chaque poil traité individuellement, même les zones délicates. *Adaptée à toutes les zones* — corps et visage, y compris zones sensibles. *Réduction progressive* — le poil s'affine, ralentit, disparaît. *Tous types de peau* — toutes carnations, poils clairs/fins/résistants. *Traitement professionnel* — protocoles d'hygiène stricts, accompagnement personnalisé.
>
> **3 services :** *Épilation thermique / Électrolyse* — la seule méthode réellement définitive ; Visage (lèvre, menton, joues, sourcils), Corps (aisselles, bras, jambes, dos, torse), Zones sensibles (bikini, intimes) ; équipement Apilus XCell Pro. *Consultation & diagnostic personnalisé* — évaluation des zones, conseils, planification. *Confort & sécurité* — micro-filaments stériles à usage unique, réglages personnalisés, soin Vitaphase.
>
> **Parcours 01/02/03 :** *01 La première consultation* — recueil d'antécédents, analyse peau/pilosité, vérification des contre-indications, explication du protocole, test sur petite zone (filament stérile à usage unique) ; déductible si poursuite directe par une séance. *02 La séance* — nettoyage/désinfection, traitement ciblé follicule par follicule, matériel stérile ; soin Vitaphase inclus en fin de séance. *03 Le suivi* — désinfecter (sans alcool) + hydrater, SPF 50 et éviter soleil/chaleur 24-48 h, ne pas gratter, pas de maquillage 24-48 h, arrêter toute autre épilation.
>
> **Appareil :** « L'Apilus est une référence mondiale de l'épilation électrique par thermolyse. Sa technologie 27 MHz diffuse l'énergie de façon extrêmement rapide et maîtrisée : plus d'efficacité, plus de confort, respect de l'équilibre de la peau. Le micro-filament suit le trajet du poil jusqu'à la racine ; l'énergie est délivrée de manière ciblée ; les cellules responsables de la repousse sont neutralisées progressivement. Action strictement localisée au poil traité. »
>
> **Tarifs (par séance) :** 10 min — 20 € · 15 min — 26 € · 20 min — 32 € · 30 min — 44 € · 40 min — 56 € · 50 min — 65 € · 1 h — 80 € · 1 h 30 — 115 € · 2 h — 145 €.
>
> **Histoire de Saira (4 chapitres) :** *Le diagnostic : le SOPK* — « Mettre un nom sur mes symptômes a été un soulagement, mais aussi le début d'un nouveau combat. Le SOPK n'est pas qu'un trouble hormonal ; c'est un bouleversement qui se lit sur le visage et le corps, par une pilosité non désirée. » *L'échec du laser* — « Pour mon type de pilosité hormonale, ce fut un échec coûteux et décourageant. Les poils revenaient, parfois plus nombreux. » *La quête de la vérité* — « J'ai découvert l'électrolyse, la seule méthode reconnue comme 100 % définitive. En vivant moi-même le traitement, j'ai vu ma vie changer. » *La naissance d'Épiltherm* — « Je me suis formée aux standards les plus élevés pour offrir une expertise, une technologie sans compromis, et une empathie sincère née d'un parcours identique au vôtre. »
>
> **Citation fondatrice (pleine largeur, mot « seules » en accent) :** « Je ne voulais pas seulement résoudre mon problème, je voulais aider les autres à ne plus jamais se sentir seules. » — Saira, fondatrice.
>
> **3 engagements :** *Technologie Apilus* — « Parce que j'ai connu les limites du laser, j'ai choisi l'excellence d'Apilus. Une précision poil par poil. » *Hygiène & sécurité* — « J'impose une rigueur chirurgicale : aiguilles à usage unique et stérilisation systématique. » *Accompagnement SOPK* — « Une écoute sans jugement. Vous êtes ici en sécurité, comprise et écoutée. »
>
> **5 avis réels (janvier 2026, marquee) :** (1) « Premier rdv validé. Praticienne passionnée, à l'écoute, qui sait mettre en confiance. Je recommande vivement. » (2) « Je fais l'électrolyse chez Saira depuis plusieurs séances pour le visage, les résultats sont impressionnants. Douce, pro et rassurante. » (3) « Praticienne en thermolyse exceptionnelle : douce, patiente, très claire. Bilan complet, travail avec passion et cœur. » (4) « Je fais 1 h de route depuis Mâcon pour voir Saira. Elle met très à l'aise, même sur les gros complexes, et inspire une vraie confiance. » (5) « Saira est une perle. Après un an d'électrolyse ailleurs, j'ai enfin vu la différence. La repousse a nettement diminué. »
>
> **FAQ (7) :** *Combien de séances ?* — le poil pousse par cycles, plusieurs séances sur quelques mois ; dépend de la zone, de la densité, du contexte hormonal ; plan défini en consultation. *Ça fait mal ?* — sensation variable, réduite par l'Apilus 27 MHz et des réglages personnalisés ; Vitaphase apaise ; tolérable. *Contre-indications ?* — grossesse, pacemaker, affections/infections cutanées locales, peau récemment bronzée, certains traitements ; vérifié en consultation. *Dangereux ?* — non, avec praticienne formée, filaments stériles à usage unique, hygiène stricte ; action localisée. *Bronzée ?* — l'électrolyse convient à toutes les carnations ; éviter une peau récemment bronzée. *Toutes les zones ?* — oui, visage, corps et zones sensibles/intimes. *Quel appareil ?* — Apilus, 27 MHz.
>
> **Photos réelles (hotlink HD) :** salle/cabine `https://epiltherm.com/wp-content/uploads/2026/02/salle-epilation-epiltherm.webp` · appareil/micro-filament `https://epiltherm.com/wp-content/uploads/2026/01/en-savoir-plus.webp` · parcours `https://epiltherm.com/wp-content/uploads/2026/01/image-contact-1.webp`, `...image-contact-2.webp`, `...image-contact-3.webp` · favicon `https://epiltherm.com/wp-content/uploads/2026/01/cropped-favicon-270x270.webp`. (Photos brillantes, douces, désaturées : traite-les en cohérence, voile/grain léger.)
>
> ## SEO & DÉPLOIEMENT
> `<title>` et meta description réels, balises OG (image OG = la hero-image officielle), JSON-LD `HealthAndBeautyBusiness` (lieu Vaulx-en-Velin, priceRange 20€–145€, sameAs Instagram, founder Saira, ReserveAction Planity) + JSON-LD `FAQPage` (les 7 Q/R). HTML sémantique, `robots.txt`, `sitemap.xml`, `404.html` à la racine, `netlify.toml` **sans build** (`[build] publish="." command=""`) + `Cache-Control` long pour `/frames/*` et `/assets/*`. Préchargeur. Liens sociaux en icônes SVG monoline.
>
> Livre une base **complète et fonctionnelle** : si les frames du hero ne sont pas encore là, affiche un fond `--noir` avec un dégradé rose discret en fallback (le failsafe doit déverrouiller la page quoi qu'il arrive). Je déposerai ensuite `frames/desktop/` et `frames/mobile/` et j'ajusterai `FRAME_COUNT`.

---

# PARTIE 2 — PROMPTS HERO (Higgsfield) — chaînage keyframes A→B→C

**Principe (raccords invisibles) :** chaque vidéo est `start_image → end_image`. L'**end_image d'un clip = la start_image du clip suivant** (on réutilise la même image), donc transition parfaite. Modèle vidéo conseillé : **Seedance 2.0** (`start_image` + `end_image`). Génère chaque keyframe en **16:9 (desktop)** ET **9:16 (mobile)**.

## STYLE BIBLE (à mettre en tête de CHAQUE prompt image, pour la cohérence)
> Extreme macro photography, luxury watch and fine-jewelry advertising aesthetic (Rolex / Cartier campaign look). Hero subject: a single ultra-fine polished surgical-steel micro-filament, razor-sharp in focus, set against a deep warm charcoal-black void `#14110F`. Lighting: one soft key light plus delicate rose-gold and champagne specular highlights. Extremely shallow depth of field, creamy bokeh of warm light orbs, pristine reflections on the metal, fine 35mm film grain, cinematic, ultra-detailed, photoreal, high dynamic range. Palette: rose-gold, powder pink, champagne, on black. NEGATIVE — exclure absolument: no people, no skin, no faces, no hands, no body, no follicle, no text, no logo, no abstract blobs, no documentary human realism. Intimate, precise, premium.

### KEYFRAME A — début du clip 1 (« le repos »)
> [STYLE BIBLE] + The micro-filament rests in near-darkness, dormant and elegant, a single cold pinpoint of light glinting on its polished tip. Vast black negative space around it, restrained and silent — a precision instrument before it awakens. Aspect ratio 16:9. (Refais en 9:16 : filament vertical, large vide noir au-dessus et en dessous.)

### KEYFRAME B — fin du clip 1 = début du clip 2 (« l'étincelle voyage »)
> [STYLE BIBLE] + A single luminous bead of rose-gold energy has ignited and travels along the filament, caught mid-way, leaving a soft glowing trail behind it; the metal catches warm champagne reflections, tiny caustics shimmer around the moving spark. Tension, awakening, motion. Aspect ratio 16:9. (Refais en 9:16.)

### KEYFRAME C — fin du clip 2 = début du clip 3 (« la floraison »)
> [STYLE BIBLE] + The bead of energy has reached the tip of the filament and blooms into a small radiant burst of rose-gold light, soft caustics and warm glow spilling into the surrounding dark, the filament haloed in luminous champagne-pink. Radiant, hopeful, opening. Aspect ratio 16:9. (Refais en 9:16.)

### (OPTION) KEYFRAME D — fin du clip 3 (« la libération »)
> [STYLE BIBLE] + The burst of light disperses from the tip into a soft, glowing field of powdery rose and champagne luminescence that gently fills the frame, the filament dissolving into the radiance — like dawn breaking toward bright, calm light. Airy, serene, resolved. Aspect ratio 16:9. (Refais en 9:16.)

## VIDÉOS (Seedance 2.0 — `start_image` + `end_image`)
> Termine TOUJOURS le prompt vidéo par : « one single continuous take, no cuts, seamless ».

### VIDÉO 1 — A → B (`start_image = A`, `end_image = B`)
> Start on the dormant micro-filament in darkness; a single bead of rose-gold energy ignites at one end and travels slowly along the filament, leaving a soft glowing trail, tiny caustics shimmering. Extremely slow, precise, hypnotic. Subtle macro camera push-in along the filament, shallow depth of field. Luxury watch advertisement on deep charcoal black. One single continuous take, no cuts, seamless. ~5 s.

### VIDÉO 2 — B → C (`start_image = B`, `end_image = C`)
> The travelling bead of energy reaches the tip of the filament and blooms into a small radiant burst of rose-gold light, warm caustics spilling softly into the dark, the metal haloed in champagne-pink glow. Extremely slow, elegant, continuous. Camera eases back slightly to reveal the bloom. One single continuous take, no cuts, seamless. ~5 s.

### (OPTION) VIDÉO 3 — C → D (`start_image = C`, `end_image = D`)
> The radiant burst at the tip softly disperses into an airy field of powdery rose and champagne light filling the frame, the filament dissolving into the glow, like a slow dawn toward bright calm. Very slow, weightless, resolving. Gentle continued pull-back. One single continuous take, no cuts, seamless. ~5 s.

## MONTAGE → FRAMES (Terminal, une fois les vidéos téléchargées)
```bash
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\nfile 'clip3.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -preset slow -crf 18 -an master.mp4
mkdir -p frames/desktop frames/mobile
ffmpeg -i master.mp4 -vf "fps=12,scale=1920:-2" -q:v 4 frames/desktop/frame_%03d.jpg
ffmpeg -i master.mp4 -vf "fps=12,crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=828:1472" -q:v 5 frames/mobile/frame_%03d.jpg
```
Budget : fps 12, viser < ~280 frames. Compte les fichiers obtenus → mets ce nombre dans `FRAME_COUNT`. Optimisation finale : passe les frames en WebP, dossier total < 40 Mo.

---

## ORDRE D'EXÉCUTION
1. **Partie 1** dans Claude Code → la base du site (hero en fallback noir+rose).
2. Génère **Keyframe A** (16:9 + 9:16).
3. Génère **Keyframe B**, puis **Vidéo 1** (A→B).
4. Génère **Keyframe C**, puis **Vidéo 2** (B→C, start = B réutilisée).
5. (Option) **Keyframe D** + **Vidéo 3** (C→D).
6. **Montage ffmpeg** → `frames/desktop` + `frames/mobile` → règle `FRAME_COUNT` → la base scrube la séquence.
