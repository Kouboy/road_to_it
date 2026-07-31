export type ReviewQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ConceptEnrichment = {
  expansion?: string;
  mechanism: string[];
  history: string;
  fieldNotes: string[];
  related: string[];
  sources?: { label: string; url: string }[];
};

export type Memo = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  tags: string[];
  reminder: string;
  sections: {
    title: string;
    intro?: string;
    steps?: string[];
    commands?: { command: string; purpose: string }[];
    warning?: string;
  }[];
};

export const CONCEPT_ENRICHMENT: Record<string, ConceptEnrichment> = {
  ram: {
    expansion: "Random Access Memory — mémoire à accès aléatoire",
    mechanism: [
      "Le système charge en RAM les morceaux de programmes et de fichiers qu’il utilise maintenant.",
      "Le processeur y accède bien plus vite qu’au SSD. La RAM sert donc de zone de travail, pas d’archive.",
      "La DRAM courante doit être rafraîchie électriquement en permanence : sans alimentation, son contenu disparaît.",
      "Quand elle manque, Windows déplace temporairement certaines données vers le fichier d’échange du stockage, beaucoup plus lent.",
    ],
    history:
      "Les premiers ordinateurs ont utilisé plusieurs formes de mémoire, notamment les tores magnétiques. La DRAM moderne apparaît à la fin des années 1960 ; les générations DDR se succèdent depuis la fin des années 1990 pour augmenter le débit.",
    fieldNotes: [
      "Dans le Gestionnaire des tâches, distingue la quantité utilisée, disponible et la mémoire engagée.",
      "Pour diagnostiquer un démarrage, teste une barrette à la fois dans l’emplacement recommandé par la carte mère.",
      "Deux barrettes de capacités ou profils différents peuvent fonctionner, mais compliquent parfois la stabilité et les fréquences.",
    ],
    related: ["cpu", "ssd", "bios"],
  },
  cpu: {
    expansion: "Central Processing Unit — unité centrale de traitement",
    mechanism: [
      "Le processeur va chercher des instructions, les décode puis les exécute : c’est le cycle fetch–decode–execute.",
      "Ses cœurs permettent de traiter plusieurs flux ; les caches gardent au plus près les données souvent utilisées.",
      "La fréquence ne suffit pas à comparer deux processeurs : architecture, nombre de cœurs, cache et limites thermiques comptent aussi.",
    ],
    history:
      "Avant le microprocesseur, l’unité de calcul occupait de nombreuses cartes ou armoires. L’intégration du CPU sur une puce au début des années 1970 a rendu possible l’ordinateur personnel moderne.",
    fieldNotes: [
      "Une utilisation élevée n’est pas une panne en soi : identifie le processus et le contexte.",
      "Une fréquence qui chute sous forte charge peut signaler une limite thermique ou électrique.",
      "Ne change jamais de processeur avant d’avoir vérifié compatibilité du socket, du BIOS et du refroidissement.",
    ],
    related: ["ram", "task-manager", "bios"],
  },
  ssd: {
    expansion: "Solid-State Drive — unité de stockage à semi-conducteurs",
    mechanism: [
      "Les données sont conservées dans des cellules de mémoire flash NAND, sans tête de lecture ni plateau mécanique.",
      "Un contrôleur répartit les écritures, corrige certaines erreurs et présente le support au système.",
      "La commande TRIM indique au SSD quels blocs ne contiennent plus de données utiles afin de préparer leur réutilisation.",
      "SATA et NVMe décrivent des interfaces différentes ; NVMe exploite généralement le bus PCI Express.",
    ],
    history:
      "La mémoire flash est mise au point dans les années 1980. Longtemps coûteux, les SSD se diffusent largement dans les PC grand public à partir de la fin des années 2000.",
    fieldNotes: [
      "Vérifie l’espace libre, l’état SMART et le débit avant de déclarer le support défaillant.",
      "Ne lance pas une défragmentation mécanique régulière sur un SSD ; Windows utilise une optimisation adaptée.",
      "Un SSD peut tomber en panne brutalement : sa rapidité ne dispense absolument pas de sauvegarde.",
    ],
    related: ["ram", "backup", "task-manager"],
  },
  psu: {
    expansion: "Power Supply Unit — bloc d’alimentation",
    mechanism: [
      "Le bloc convertit le courant alternatif du secteur en courant continu utilisable par le PC.",
      "Dans un PC ATX, la majorité de la puissance moderne passe par le rail 12 V, puis d’autres tensions sont fournies selon les besoins.",
      "Des protections doivent limiter surtension, surintensité, court-circuit et surchauffe selon la conception du modèle.",
      "Le signal Power Good indique à la carte mère que les tensions sont suffisamment stables pour poursuivre le démarrage.",
    ],
    history:
      "Le format ATX, introduit au milieu des années 1990, a standardisé une grande partie des dimensions, connecteurs et commandes d’alimentation des PC compatibles.",
    fieldNotes: [
      "Des ventilateurs allumés prouvent seulement qu’une partie de l’alimentation fonctionne.",
      "Teste avec un bloc connu comme fonctionnel et correctement dimensionné quand c’est possible.",
      "N’ouvre jamais le boîtier du bloc : certains composants peuvent conserver une charge dangereuse après débranchement.",
    ],
    related: ["bios", "gpu", "ram"],
  },
  gpu: {
    expansion: "Graphics Processing Unit — unité de traitement graphique",
    mechanism: [
      "Le GPU exécute en parallèle de nombreux calculs nécessaires à l’affichage, à la 3D et à certains traitements généraux.",
      "Une carte dédiée possède généralement sa propre mémoire vidéo ; un GPU intégré partage souvent une partie de la RAM système.",
      "Le signal suit une chaîne : application, pilote, GPU, sortie, câble, entrée de l’écran.",
    ],
    history:
      "Les accélérateurs graphiques précèdent le PC moderne, mais le terme GPU s’impose à la fin des années 1990 quand les cartes intègrent une part croissante du pipeline 3D.",
    fieldNotes: [
      "Avec une carte dédiée, branche d’abord l’écran sur les sorties de cette carte.",
      "Un affichage en basse résolution peut fonctionner avec un pilote générique sans prouver que le pilote constructeur est sain.",
      "Avant de déposer une carte, coupe l’alimentation et libère le loquet du port PCIe.",
    ],
    related: ["video-cable", "driver", "psu"],
  },
  bios: {
    expansion: "BIOS : Basic Input/Output System · UEFI : Unified Extensible Firmware Interface",
    mechanism: [
      "Au démarrage, le micrologiciel initialise le processeur, la mémoire et les contrôleurs essentiels.",
      "Le POST vérifie que le matériel minimal peut fonctionner ; des bips ou voyants peuvent signaler l’étape bloquée.",
      "Le micrologiciel choisit ensuite une entrée de démarrage et remet la main au chargeur du système.",
      "UEFI ajoute notamment une architecture plus moderne, la prise en charge de GPT et des mécanismes comme Secure Boot.",
    ],
    history:
      "Le BIOS du PC IBM de 1981 a fixé un modèle durable. Intel a ensuite développé EFI à la fin des années 1990 ; l’UEFI Forum reprend et standardise cette évolution au milieu des années 2000.",
    fieldNotes: [
      "Photographie les réglages avant modification et change une seule option à la fois.",
      "Une mise à jour de micrologiciel interrompue peut rendre la carte inutilisable : ne la fais pas sans raison et procédure claire.",
      "Réinitialiser le CMOS efface des réglages ; ce n’est pas un remède universel.",
    ],
    related: ["ram", "ssd", "gpu"],
    sources: [{ label: "UEFI Forum", url: "https://uefi.org/specifications" }],
  },
  "video-cable": {
    expansion: "HDMI : High-Definition Multimedia Interface · DisplayPort n’est pas un acronyme",
    mechanism: [
      "Le câble transporte un flux numérique. L’écran doit écouter l’entrée réellement utilisée.",
      "L’EDID permet à l’écran d’annoncer ses résolutions et fréquences prises en charge.",
      "Une négociation peut aussi concerner le son, la protection de contenu, la profondeur de couleur ou le taux de rafraîchissement.",
      "Le connecteur seul ne garantit pas toutes les fonctions : versions, câbles et appareils doivent être compatibles.",
    ],
    history:
      "HDMI est lancé au début des années 2000 pour l’audiovisuel grand public. DisplayPort est standardisé par la VESA quelques années plus tard avec un fort usage informatique.",
    fieldNotes: [
      "Teste une résolution et une fréquence modestes si l’image disparaît seulement dans certains modes.",
      "Un adaptateur passif ne convertit pas forcément deux protocoles dans les deux sens.",
      "Étiquette les câbles connus comme fonctionnels : ce sont de précieux outils de substitution.",
    ],
    related: ["gpu", "driver", "bios"],
  },
  ip: {
    expansion: "Internet Protocol — protocole Internet",
    mechanism: [
      "Une adresse identifie une interface dans un plan d’adressage ; un préfixe indique quelle partie correspond au réseau.",
      "L’hôte compare la destination à son propre réseau. Si elle est ailleurs, il envoie le paquet vers sa passerelle.",
      "IPv4 utilise des adresses de 32 bits ; IPv6 utilise 128 bits et répond notamment à la pénurie d’adresses IPv4.",
      "Une adresse privée n’est pas directement routée sur Internet ; la box réalise souvent une traduction d’adresses.",
    ],
    history:
      "IPv4 est formalisé au début des années 1980. Sa croissance et la rareté des adresses ont mené à IPv6, conçu dans les années 1990 et progressivement déployé depuis.",
    fieldNotes: [
      "Lis ensemble adresse, masque ou préfixe, passerelle et DNS : une adresse seule ne suffit pas.",
      "169.254.0.0/16 correspond sous IPv4 à l’auto-configuration locale quand aucune autre adresse n’est obtenue.",
      "Deux machines avec la même adresse peuvent provoquer un conflit intermittent et trompeur.",
    ],
    related: ["dhcp", "gateway", "dns"],
    sources: [{ label: "RFC 791 — IPv4", url: "https://www.rfc-editor.org/rfc/rfc791" }],
  },
  dhcp: {
    expansion: "Dynamic Host Configuration Protocol — protocole de configuration dynamique des hôtes",
    mechanism: [
      "Discover : le client, qui ne connaît pas encore son réseau, diffuse une demande pour trouver un serveur.",
      "Offer : un serveur propose une adresse et d’autres paramètres disponibles.",
      "Request : le client annonce l’offre qu’il souhaite accepter.",
      "Acknowledge : le serveur confirme le bail et transmet la configuration. On résume souvent cette séquence par DORA.",
      "Le bail est temporaire : le client tente de le renouveler avant son expiration. DHCPv4 utilise UDP, ports serveur 67 et client 68.",
    ],
    history:
      "DHCP prolonge BOOTP, un protocole de 1985 conçu pour aider des machines à démarrer et se configurer sur le réseau. Une première version de DHCP est publiée en 1993 ; la spécification DHCPv4 de référence, RFC 2131, date de 1997.",
    fieldNotes: [
      "Sous Windows, ipconfig /all affiche si DHCP est activé, le serveur utilisé et les dates du bail.",
      "ipconfig /release abandonne le bail IPv4 ; ipconfig /renew en demande un nouveau. Ne les lance pas à distance sans prévoir la coupure.",
      "Une adresse 169.254.x.x suggère souvent que l’interface n’a pas obtenu de réponse DHCP, mais il faut encore chercher pourquoi.",
    ],
    related: ["ip", "gateway", "dns"],
    sources: [
      { label: "RFC 2131 — DHCP", url: "https://www.rfc-editor.org/rfc/rfc2131" },
      { label: "RFC 951 — BOOTP", url: "https://www.rfc-editor.org/rfc/rfc951" },
    ],
  },
  dns: {
    expansion: "Domain Name System — système de noms de domaine",
    mechanism: [
      "L’application demande à un résolveur de trouver un type d’information associé à un nom.",
      "Le résolveur interroge généralement un serveur récursif, qui utilise son cache ou suit la hiérarchie DNS jusqu’aux serveurs faisant autorité.",
      "Les réponses sont des enregistrements : A ou AAAA pour des adresses, MX pour le courrier, CNAME pour un alias, entre autres.",
      "Le TTL indique combien de temps une réponse peut rester en cache ; une modification n’apparaît donc pas partout instantanément.",
    ],
    history:
      "Au début d’ARPANET, un fichier central HOSTS.TXT associait noms et adresses. La croissance du réseau a rendu ce modèle impraticable. Paul Mockapetris propose un système hiérarchique et distribué au début des années 1980 ; les RFC 1034 et 1035 de 1987 restent des textes fondamentaux.",
    fieldNotes: [
      "Compare une connexion par adresse IP et une résolution de nom pour isoler la couche DNS.",
      "nslookup nom serveur permet d’interroger explicitement un serveur donné.",
      "Vider le cache local peut résoudre une donnée périmée, mais ne réparera pas un serveur inaccessible ou une zone incorrecte.",
    ],
    related: ["ip", "dhcp", "ping"],
    sources: [
      { label: "RFC 1034 — concepts DNS", url: "https://www.rfc-editor.org/rfc/rfc1034" },
      { label: "RFC 1035 — mise en œuvre DNS", url: "https://www.rfc-editor.org/rfc/rfc1035" },
    ],
  },
  gateway: {
    expansion: "Passerelle par défaut — default gateway",
    mechanism: [
      "L’hôte utilise son masque ou préfixe pour savoir si la destination appartient au réseau local.",
      "Si ce n’est pas le cas, il remet le paquet à la passerelle configurée, généralement un routeur.",
      "La route par défaut sert quand aucune route plus précise ne correspond à la destination.",
      "Sur un réseau domestique, la box cumule souvent routeur, passerelle, NAT, DHCP et relais DNS — des rôles distincts dans un seul boîtier.",
    ],
    history:
      "Le terme gateway a longtemps été employé largement pour les machines reliant des réseaux. Le vocabulaire moderne distingue plus précisément routeur, passerelle applicative et route par défaut.",
    fieldNotes: [
      "Pinger la passerelle teste le chemin local jusqu’au routeur, pas l’accès Internet complet.",
      "Une passerelle doit normalement être joignable depuis le sous-réseau de l’interface.",
      "Une mauvaise passerelle permet parfois les échanges locaux tout en coupant les destinations extérieures.",
    ],
    related: ["ip", "ping", "dhcp"],
  },
  ping: {
    expansion: "Ping n’était pas à l’origine un acronyme : le nom évoque l’impulsion d’un sonar",
    mechanism: [
      "L’outil envoie généralement un message ICMP Echo Request et attend un Echo Reply.",
      "Il mesure le délai aller-retour et signale les pertes observées pendant le test.",
      "Avec un nom de domaine, une résolution de nom a lieu avant l’envoi : l’erreur peut donc précéder le test ICMP.",
      "Un pare-feu peut bloquer ICMP alors que le service recherché fonctionne parfaitement.",
    ],
    history:
      "Mike Muuss écrit l’outil ping en 1983 pour observer un problème réseau. L’expression Packet Internet Groper est une réinterprétation ultérieure, pas l’origine du nom.",
    fieldNotes: [
      "Teste successivement l’adresse locale, la passerelle puis une destination extérieure pour localiser l’étage atteint.",
      "Une réponse prouve la joignabilité ICMP à cet instant, pas le bon fonctionnement de tous les services.",
      "Sous Windows, ping -t poursuit le test jusqu’à interruption ; utilise Ctrl+C pour obtenir le bilan.",
    ],
    related: ["ip", "gateway", "dns"],
    sources: [{ label: "RFC 792 — ICMP", url: "https://www.rfc-editor.org/rfc/rfc792" }],
  },
  driver: {
    expansion: "Pilote de périphérique — device driver",
    mechanism: [
      "Le système expose une interface commune aux applications tandis que le pilote gère les particularités du matériel.",
      "Certains pilotes fonctionnent au cœur du système : un défaut peut donc provoquer blocage, écran bleu ou périphérique invisible.",
      "Windows peut utiliser un pilote générique pour les fonctions minimales, puis un pilote constructeur pour les capacités avancées.",
    ],
    history:
      "Les pilotes sont devenus indispensables à mesure que les systèmes ont dû prendre en charge une diversité croissante de contrôleurs et périphériques sans réécrire chaque application.",
    fieldNotes: [
      "Dans le Gestionnaire de périphériques, relève l’identifiant matériel avant de chercher un pilote.",
      "Préfère Windows Update ou le constructeur du matériel aux sites de téléchargement de pilotes non vérifiés.",
      "Une mise à jour n’est pas automatiquement meilleure : conserve une possibilité de retour si le poste fonctionne avant intervention.",
    ],
    related: ["safe-mode", "gpu", "bios"],
  },
  "task-manager": {
    expansion: "Gestionnaire des tâches — Task Manager",
    mechanism: [
      "L’onglet Processus regroupe les programmes et leurs consommations instantanées.",
      "Performances montre l’évolution du CPU, de la mémoire, du disque, du réseau et du GPU.",
      "Applications de démarrage permet de limiter ce qui se lance avec la session.",
      "Les valeurs sont des indices à comparer dans le temps, pas un diagnostic automatique.",
    ],
    history:
      "Windows a proposé plusieurs gestionnaires de programmes et de tâches. Le Gestionnaire des tâches moderne vient de la famille Windows NT et s’est enrichi au fil des versions en outils de mesure et de démarrage.",
    fieldNotes: [
      "Trie par la ressource saturée, reproduis le problème, puis observe quel processus monte au même moment.",
      "Une pointe brève à 100 % peut être normale ; une saturation durable corrélée au symptôme est plus parlante.",
      "Avant de terminer un processus, identifie son rôle et vérifie si un travail non enregistré dépend de lui.",
    ],
    related: ["cpu", "ram", "ssd"],
  },
  "safe-mode": {
    expansion: "Mode sans échec — Safe Mode",
    mechanism: [
      "Windows démarre avec un ensemble réduit de pilotes, services et fonctions graphiques.",
      "La comparaison avec le démarrage normal aide à isoler un pilote, service ou logiciel tiers.",
      "Le réseau n’est activé que dans la variante prévue pour cela.",
      "Le mode ne corrige pas automatiquement la cause : il crée une condition de test plus simple.",
    ],
    history:
      "Les modes de démarrage minimal existent depuis les anciennes générations de Windows afin de pouvoir dépanner une configuration qui empêche le chargement normal.",
    fieldNotes: [
      "Note précisément si le symptôme disparaît, s’atténue ou reste identique.",
      "Un démarrage minimal réussi oriente, mais ne désigne pas à lui seul le pilote fautif.",
      "Pour une analyse plus fine des services tiers, le démarrage en mode diagnostic ou clean boot peut compléter le test.",
    ],
    related: ["driver", "task-manager", "backup"],
  },
  backup: {
    expansion: "Sauvegarde — backup",
    mechanism: [
      "Une sauvegarde crée une copie récupérable en dehors de l’emplacement de travail principal.",
      "Une sauvegarde complète copie l’ensemble ; une incrémentale ou différentielle ne copie que certaines évolutions.",
      "La règle 3-2-1 conseille trois copies, sur deux types de supports, dont une hors site.",
      "Une copie non testée reste une hypothèse : il faut vérifier régulièrement la restauration.",
    ],
    history:
      "Des cartes perforées aux bandes, disques, bibliothèques automatisées puis au cloud, la sauvegarde accompagne toute l’histoire du stockage. Les supports changent ; la nécessité de séparer les risques reste.",
    fieldNotes: [
      "Avant une intervention risquée, demande où se trouvent les données irremplaçables et quand la dernière copie a été vérifiée.",
      "La synchronisation réplique parfois aussi les suppressions et corruptions : vérifie versions et corbeille.",
      "Un disque de sauvegarde branché en permanence peut être touché par la même surtension ou le même rançongiciel.",
    ],
    related: ["ssd", "phishing", "least-privilege"],
  },
  phishing: {
    expansion: "Phishing — hameçonnage",
    mechanism: [
      "L’attaquant imite une relation de confiance et crée souvent un sentiment d’urgence ou de peur.",
      "Le lien mène vers un domaine trompeur, une fausse connexion ou un fichier malveillant.",
      "L’objectif peut être un mot de passe, un paiement, un code de validation ou simplement l’exécution d’une pièce jointe.",
      "Le canal peut être l’e-mail, le SMS, le téléphone, une messagerie ou même un QR code.",
    ],
    history:
      "Le mot phishing apparaît au milieu des années 1990 autour de fraudes visant notamment les comptes AOL. Son orthographe rappelle le vocabulaire des phreakers, qui détournaient les systèmes téléphoniques.",
    fieldNotes: [
      "Vérifie l’adresse réelle de l’expéditeur et le domaine de destination, pas seulement le nom affiché.",
      "Ouvre le service depuis ton favori ou son application plutôt que depuis le lien reçu.",
      "Après une saisie sur un faux site : change le mot de passe depuis un appareil sain, révoque les sessions et préviens le responsable adapté.",
    ],
    related: ["least-privilege", "backup", "dns"],
  },
  "least-privilege": {
    expansion: "Principe du moindre privilège — Principle of Least Privilege",
    mechanism: [
      "Chaque utilisateur, service ou programme reçoit seulement les droits nécessaires à sa tâche.",
      "La séparation des comptes limite les actions accidentelles et le rayon d’action d’un logiciel compromis.",
      "Les droits élevés sont accordés temporairement ou pour une opération identifiée, puis retirés.",
      "Le principe s’applique aussi aux partages, clés d’API, applications mobiles et comptes de service.",
    ],
    history:
      "Le principe existe dans la sécurité depuis longtemps et a été clairement formulé pour les systèmes informatiques, notamment par Jerome Saltzer et Michael Schroeder dans les années 1970.",
    fieldNotes: [
      "Utilise un compte standard au quotidien et une élévation distincte pour l’administration.",
      "Ne donne pas les droits administrateur pour contourner sans analyse un problème d’application.",
      "Révise périodiquement les droits : un accès autrefois légitime peut ne plus l’être.",
    ],
    related: ["phishing", "backup", "driver"],
  },
};

export const REVIEW_VARIANTS: Record<string, ReviewQuestion[]> = {
  ram: [
    {
      question: "Un poste a 16 Go de RAM, mais Windows indique 15,8 Go « engagés » et commence à utiliser fortement le disque. Quelle lecture est la plus juste ?",
      options: [
        "La pression mémoire peut pousser Windows à utiliser le fichier d’échange",
        "Le SSD a été transformé définitivement en RAM matérielle",
        "La quantité engagée prouve qu’une barrette est physiquement défectueuse",
      ],
      answer: 0,
      explanation: "L’engagement peut dépasser la RAM physique grâce au fichier d’échange. Il faut identifier les processus et la pression mémoire avant d’accuser le matériel.",
    },
    {
      question: "Après ajout d’une barrette, le PC ne passe plus le POST. Quel test réduit le mieux les hypothèses ?",
      options: [
        "Tester l’ancienne barrette seule dans l’emplacement précédemment fonctionnel",
        "Réinstaller Windows pour reconstruire la gestion mémoire",
        "Activer immédiatement le profil mémoire le plus rapide",
      ],
      answer: 0,
      explanation: "Revenir à la dernière configuration connue comme fonctionnelle permet de distinguer barrette, emplacement et réglage.",
    },
  ],
  cpu: [
    {
      question: "Le CPU atteint brièvement 100 % lors de l’ouverture d’une application puis retombe. Quelle conclusion est défendable ?",
      options: [
        "Le pic peut être normal ; il faut le corréler à la durée et au symptôme",
        "Le processeur est nécessairement sous-dimensionné",
        "La carte mère limite forcément la connexion réseau",
      ],
      answer: 0,
      explanation: "Un pic court est courant. Une saturation durable, reproductible et corrélée au ralentissement est plus significative.",
    },
    {
      question: "Sous charge, la fréquence CPU baisse tandis que la température atteint la limite du constructeur. Quelle hypothèse tester d’abord ?",
      options: [
        "Une limitation thermique liée au refroidissement",
        "Une corruption de la table DNS",
        "Un manque d’espace dans la corbeille Windows",
      ],
      answer: 0,
      explanation: "Température limite et baisse de fréquence forment un ensemble cohérent avec du thermal throttling.",
    },
  ],
  ssd: [
    {
      question: "Un SSD est presque plein et ralentit, mais son état SMART ne signale pas d’alerte. Quelle action est la plus raisonnable ?",
      options: [
        "Libérer de l’espace, mesurer à nouveau puis analyser les processus actifs",
        "Lancer quotidiennement une défragmentation complète",
        "Remplacer le processeur avant tout autre test",
      ],
      answer: 0,
      explanation: "Le manque d’espace peut gêner la gestion interne et le système. Il faut corriger puis remesurer sans conclure trop vite à une panne.",
    },
    {
      question: "Que permet principalement TRIM ?",
      options: [
        "Informer le SSD des blocs qui ne contiennent plus de données utiles",
        "Réordonner physiquement les fichiers comme sur un disque à plateaux",
        "Créer automatiquement une sauvegarde hors ligne",
      ],
      answer: 0,
      explanation: "TRIM aide le contrôleur du SSD à préparer la réutilisation de blocs libérés par le système.",
    },
  ],
  psu: [
    {
      question: "Les ventilateurs tournent, mais le PC redémarre dès que le GPU est sollicité. Quel élément reste raisonnablement suspect ?",
      options: [
        "Le bloc d’alimentation, malgré la présence de signes de vie",
        "Uniquement le bouton du boîtier, puisqu’il a lancé le PC",
        "Le DNS, parce qu’il intervient pendant les jeux en ligne",
      ],
      answer: 0,
      explanation: "Un bloc peut fournir assez pour démarrer mais devenir instable sous une charge plus élevée.",
    },
    {
      question: "Quelle méthode est la plus sûre pour confirmer un bloc suspect ?",
      options: [
        "Essayer un bloc connu comme fonctionnel et correctement dimensionné",
        "Ouvrir le bloc débranché pour toucher les condensateurs",
        "Court-circuiter successivement ses sorties pendant le démarrage",
      ],
      answer: 0,
      explanation: "La substitution contrôlée est informative et évite d’ouvrir un appareil pouvant conserver des tensions dangereuses.",
    },
  ],
  gpu: [
    {
      question: "Une carte graphique dédiée est installée mais l’écran est branché sur la carte mère. Pourquoi déplacer le câble est-il un bon premier test ?",
      options: [
        "Les sorties intégrées peuvent être inactives et ce test ne modifie qu’une variable",
        "La carte dédiée transforme toujours les ports USB en sorties vidéo",
        "Le déplacement force Windows à réinstaller le processeur",
      ],
      answer: 0,
      explanation: "Le test suit le chemin probable du signal et reste externe, rapide et réversible.",
    },
    {
      question: "L’image apparaît avec le pilote générique mais disparaît après installation du pilote constructeur. Quelle piste devient prioritaire ?",
      options: [
        "Un problème de pilote, de mode vidéo ou de stabilité du GPU",
        "Une panne certaine du serveur DHCP",
        "Un défaut nécessairement situé dans le clavier",
      ],
      answer: 0,
      explanation: "Le changement de comportement coïncide avec le pilote et les fonctions avancées qu’il active.",
    },
  ],
  bios: [
    {
      question: "Le PC affiche le logo constructeur puis « aucun périphérique de démarrage ». Quel sous-système a déjà fonctionné au moins partiellement ?",
      options: [
        "Le POST et l’affichage initialisés par le micrologiciel",
        "Le chargement complet de la session Windows",
        "La résolution DNS du réseau local",
      ],
      answer: 0,
      explanation: "L’affichage du logo et du message prouve que le micrologiciel a initialisé assez de matériel pour produire une sortie.",
    },
    {
      question: "Quand une réinitialisation CMOS est-elle méthodiquement défendable ?",
      options: [
        "Après un réglage UEFI instable, en ayant noté que les paramètres seront perdus",
        "Comme première action face à toute lenteur Windows",
        "Pour réparer une pièce jointe d’e-mail suspecte",
      ],
      answer: 0,
      explanation: "Elle peut rétablir des réglages par défaut, mais elle efface la configuration et ne cible pas les pannes logicielles ordinaires.",
    },
  ],
  "video-cable": [
    {
      question: "Un écran fonctionne à 60 Hz mais devient noir à 144 Hz. Quel test est le plus informatif ?",
      options: [
        "Essayer un câble et un port certifiés pour le débit requis",
        "Réinitialiser le bail DHCP de l’ordinateur",
        "Augmenter la taille du fichier d’échange",
      ],
      answer: 0,
      explanation: "Le symptôme dépend du débit vidéo demandé ; câble, port, adaptateur et compatibilité deviennent prioritaires.",
    },
    {
      question: "L’écran affiche son menu interne mais « Aucun signal ». Quelle conclusion est la plus prudente ?",
      options: [
        "La dalle est alimentée, mais la chaîne source–sortie–câble–entrée reste à tester",
        "La carte graphique est forcément morte",
        "Windows a nécessairement terminé son démarrage",
      ],
      answer: 0,
      explanation: "Le menu innocente une partie de l’écran, pas toute la chaîne vidéo ni le PC.",
    },
  ],
  ip: [
    {
      question: "Un PC a 192.168.1.42/24 et sa passerelle 192.168.2.1. Quelle incohérence vois-tu ?",
      options: [
        "La passerelle n’appartient pas au même sous-réseau /24",
        "L’adresse du PC est obligatoirement publique",
        "Le préfixe /24 désactive automatiquement le DNS",
      ],
      answer: 0,
      explanation: "Avec /24, 192.168.1.0 et 192.168.2.0 sont deux sous-réseaux distincts ; la passerelle doit normalement être joignable localement.",
    },
    {
      question: "Deux postes annoncent sporadiquement une perte réseau et possèdent la même IPv4 statique. Quelle cause est la plus probable ?",
      options: [
        "Un conflit d’adresses IP",
        "Une insuffisance de mémoire vidéo",
        "Un TTL DNS trop long pour le moniteur",
      ],
      answer: 0,
      explanation: "Deux interfaces revendiquant la même adresse peuvent provoquer des communications alternantes ou impossibles.",
    },
  ],
  dhcp: [
    {
      question: "Dans la séquence DORA, quel message indique que le client choisit une proposition ?",
      options: ["DHCPREQUEST", "DHCPOFFER", "DHCPDISCOVER"],
      answer: 0,
      explanation: "Discover cherche, Offer propose, Request sélectionne et ACK confirme le bail.",
    },
    {
      question: "Un poste reçoit 169.254.18.7 alors que DHCP est activé. Quel test vient logiquement ensuite ?",
      options: [
        "Vérifier le lien local puis si les requêtes DHCP atteignent un serveur ou relais",
        "Changer le serveur DNS avant d’examiner l’adresse",
        "Réinstaller le pilote graphique pour renouveler le bail",
      ],
      answer: 0,
      explanation: "L’adresse APIPA montre que la configuration automatique n’a pas abouti ; il faut remonter le chemin client–réseau–DHCP.",
    },
  ],
  dns: [
    {
      question: "Le ping vers 1.1.1.1 répond, mais nslookup example.com expire. Que démontre ce contraste ?",
      options: [
        "La connectivité IP extérieure existe, tandis que la résolution DNS est en échec",
        "La carte graphique ne transmet plus l’image",
        "Le serveur DHCP n’a jamais fourni d’adresse au poste",
      ],
      answer: 0,
      explanation: "Le poste atteint une adresse extérieure ; l’échec est plus précisément situé au niveau de la résolution de noms ou du serveur interrogé.",
    },
    {
      question: "Pourquoi une ancienne adresse peut-elle continuer à apparaître après une modification DNS ?",
      options: [
        "Une réponse peut rester en cache jusqu’à l’expiration de son TTL",
        "Le câble Ethernet mémorise physiquement l’ancienne adresse",
        "Le CPU doit être redémarré pour comprendre les points dans un nom",
      ],
      answer: 0,
      explanation: "Les caches réduisent le trafic et la latence, mais retardent la visibilité d’un changement selon le TTL.",
    },
  ],
  gateway: [
    {
      question: "Le poste joint les autres machines de 192.168.1.0/24 mais aucune adresse extérieure. Quelle configuration faut-il inspecter en priorité ?",
      options: [
        "La passerelle par défaut et sa joignabilité",
        "La luminosité de l’écran",
        "Le profil XMP de la mémoire",
      ],
      answer: 0,
      explanation: "Les échanges locaux fonctionnent ; la sortie vers les autres réseaux dépend notamment de la route par défaut.",
    },
    {
      question: "Que prouve un ping réussi vers la passerelle locale ?",
      options: [
        "Le chemin ICMP du poste jusqu’à cette interface du routeur répond",
        "Tous les sites Internet et tous les ports fonctionnent",
        "Le DNS public contient nécessairement des données à jour",
      ],
      answer: 0,
      explanation: "Le test valide un segment précis, pas l’ensemble de la chaîne jusqu’aux services extérieurs.",
    },
  ],
  ping: [
    {
      question: "Un serveur web répond dans le navigateur mais ne répond pas au ping. Quelle explication reste possible ?",
      options: [
        "ICMP Echo est filtré tandis que HTTPS reste autorisé",
        "L’adresse IP n’existe forcément pas",
        "Le navigateur remplace automatiquement la carte réseau",
      ],
      answer: 0,
      explanation: "Les protocoles et ports sont filtrés séparément. L’absence de réponse ICMP ne suffit pas à déclarer le service indisponible.",
    },
    {
      question: "ping nom.exemple renvoie immédiatement « hôte introuvable ». À quelle étape le test a-t-il probablement échoué ?",
      options: [
        "Avant l’Echo Request, pendant la résolution du nom",
        "Après une réponse HTTP 500 du serveur",
        "Pendant l’écriture du fichier d’échange",
      ],
      answer: 0,
      explanation: "L’outil doit d’abord obtenir une adresse. Un nom introuvable indique que le test ICMP n’a probablement pas commencé.",
    },
  ],
  driver: [
    {
      question: "Un périphérique apparaît avec un point d’exclamation après une mise à jour. Quelle action préserve le mieux le diagnostic ?",
      options: [
        "Noter le code d’erreur et l’identifiant matériel avant de modifier le pilote",
        "Installer plusieurs paquets de pilotes simultanément",
        "Supprimer tous les périphériques inconnus puis redémarrer sans note",
      ],
      answer: 0,
      explanation: "Ces informations permettent d’identifier précisément le matériel et de mesurer l’effet de l’action suivante.",
    },
    {
      question: "Pourquoi un pilote générique peut-il donner une image sans toutes les fonctions du GPU ?",
      options: [
        "Il fournit un socle compatible sans exposer toutes les capacités du constructeur",
        "Il convertit le GPU en processeur réseau",
        "Il augmente physiquement la quantité de mémoire vidéo",
      ],
      answer: 0,
      explanation: "Le pilote générique vise la compatibilité minimale ; le pilote constructeur active les fonctions spécifiques.",
    },
  ],
  "task-manager": [
    {
      question: "Le poste est lent et le disque monte à 100 %. Pourquoi trier les processus par activité disque ?",
      options: [
        "Pour corréler la saturation à un processus avant d’agir",
        "Pour réparer automatiquement tous les secteurs du support",
        "Pour augmenter la quantité de RAM installée",
      ],
      answer: 0,
      explanation: "La saturation est un symptôme ; le processus, la durée et le contexte permettent de formuler une cause.",
    },
    {
      question: "Une application utilise beaucoup de CPU uniquement pendant un export demandé par l’utilisateur. Quelle décision est la plus juste ?",
      options: [
        "Comparer avec le comportement attendu et la durée avant de conclure à une anomalie",
        "La désinstaller immédiatement parce que tout pourcentage élevé est une panne",
        "Désactiver le réseau pour réduire la température du processeur",
      ],
      answer: 0,
      explanation: "Une charge élevée peut être le travail attendu. Le diagnostic dépend du contexte et de l’impact utilisateur.",
    },
  ],
  "safe-mode": [
    {
      question: "Le problème disparaît en mode sans échec. Quelle conclusion est raisonnable ?",
      options: [
        "Un élément non chargé dans ce mode devient plus suspect, sans être encore identifié",
        "Le matériel est intégralement certifié sans défaut",
        "Windows a automatiquement supprimé la cause définitive",
      ],
      answer: 0,
      explanation: "La comparaison réduit le champ aux pilotes, services et logiciels absents du démarrage minimal, mais demande encore des tests.",
    },
    {
      question: "Le problème persiste exactement en mode sans échec. Quel effet cela a-t-il sur l’hypothèse d’un logiciel tiers au démarrage ?",
      options: [
        "Elle devient moins prioritaire, sans être totalement impossible",
        "Elle est automatiquement prouvée",
        "Cela démontre un échec DHCP",
      ],
      answer: 0,
      explanation: "Le symptôme résiste à la simplification. Il faut considérer composants encore chargés, système ou matériel.",
    },
  ],
  backup: [
    {
      question: "Un dossier est synchronisé instantanément vers le cloud. Pourquoi cela peut-il rester insuffisant comme seule sauvegarde ?",
      options: [
        "Une suppression ou corruption peut être synchronisée elle aussi",
        "La synchronisation empêche toujours la création de versions",
        "Le cloud ne peut stocker aucun fichier binaire",
      ],
      answer: 0,
      explanation: "Il faut vérifier historique de versions, corbeille, restauration et séparation réelle des risques.",
    },
    {
      question: "Quelle preuve transforme une copie en sauvegarde crédible ?",
      options: [
        "Une restauration testée d’un échantillon ou d’un système prévu",
        "La présence d’une icône verte dans l’explorateur",
        "Le fait que le support soit neuf",
      ],
      answer: 0,
      explanation: "La finalité est la récupération. Sans test, format, accès ou corruption peuvent n’apparaître qu’au pire moment.",
    },
  ],
  phishing: [
    {
      question: "Un message utilise le bon logo et HTTPS, mais le domaine est support-mondomaine-secure.example. Que faut-il vérifier ?",
      options: [
        "Le domaine réellement contrôlé et le contexte de la demande",
        "Seulement la qualité graphique du logo",
        "La quantité de RAM de l’expéditeur",
      ],
      answer: 0,
      explanation: "Un cadenas chiffre la connexion au domaine affiché ; il ne garantit pas que ce domaine appartient à l’organisation imitée.",
    },
    {
      question: "Tu as saisi un mot de passe sur un faux site. Quelle priorité est la plus utile ?",
      options: [
        "Changer le mot de passe depuis un accès sain, révoquer les sessions et signaler l’incident",
        "Répondre au message pour demander la suppression des données",
        "Attendre une semaine pour voir si le compte change",
      ],
      answer: 0,
      explanation: "Il faut réduire immédiatement la fenêtre d’exploitation et avertir les responsables ou services concernés.",
    },
  ],
  "least-privilege": [
    {
      question: "Une application ancienne exige administrateur pour écrire dans son propre dossier. Quelle réponse respecte le mieux le moindre privilège ?",
      options: [
        "Identifier précisément le droit nécessaire et corriger ce périmètre plutôt que rendre l’utilisateur administrateur",
        "Donner les droits administrateur permanents à tous les utilisateurs",
        "Désactiver les journaux de sécurité pour éviter les alertes",
      ],
      answer: 0,
      explanation: "On traite le besoin précis avec le minimum de droits, après analyse de l’application et du risque.",
    },
    {
      question: "Pourquoi utiliser un compte standard au quotidien ?",
      options: [
        "Pour limiter l’impact de certaines erreurs et exécutions malveillantes",
        "Pour rendre les sauvegardes inutiles",
        "Pour empêcher physiquement toute panne matérielle",
      ],
      answer: 0,
      explanation: "La limitation des droits réduit le rayon d’action, sans remplacer mises à jour, sauvegardes ou vigilance.",
    },
  ],
};

export const MEMOS: Memo[] = [
  {
    id: "method",
    title: "Méthode universelle de diagnostic",
    subtitle: "Passer d’un symptôme flou à une cause vérifiée",
    duration: "2 min",
    tags: ["Méthode", "Tout incident"],
    reminder: "Observer → délimiter → hypothèses → test discriminant → correction → vérification → trace.",
    sections: [
      {
        title: "Les sept gestes",
        steps: [
          "Reformuler le symptôme avec les mots de l’utilisateur, sans l’interpréter trop tôt.",
          "Déterminer le périmètre : un utilisateur, un poste, un service, un bâtiment ?",
          "Chercher ce qui fonctionne encore et ce qui a changé récemment.",
          "Classer deux ou trois hypothèses par probabilité, coût et risque.",
          "Choisir un test qui distingue réellement ces hypothèses, en ne changeant qu’une variable.",
          "Appliquer une correction réversible puis reproduire les conditions initiales.",
          "Noter symptôme, preuve, action et résultat pour le prochain humain — qui sera parfois toi demain.",
        ],
      },
      {
        title: "Questions à poser",
        steps: [
          "Depuis quand ? Est-ce permanent ou intermittent ?",
          "Qui d’autre est touché ? Qu’est-ce qui fonctionne encore ?",
          "Qu’est-ce qui a changé avant l’apparition ?",
          "Peut-on reproduire le problème sans mettre les données en danger ?",
        ],
      },
      {
        title: "Piège classique",
        warning: "Une action qui fait disparaître le symptôme n’est pas toujours une preuve de la cause. Documente ce que le test permet réellement de conclure.",
      },
    ],
  },
  {
    id: "no-display",
    title: "PC allumé, aucun affichage",
    subtitle: "Du câble au POST, sans remplacer la moitié de la machine",
    duration: "3 min",
    tags: ["Matériel", "Affichage"],
    reminder: "Écran → source → câble → bonne sortie → POST → RAM/GPU → alimentation.",
    sections: [
      {
        title: "Contrôles externes",
        steps: [
          "Vérifier alimentation et menu interne de l’écran.",
          "Sélectionner l’entrée correspondant au câble réellement branché.",
          "Tester un câble, un port ou un écran connus comme fonctionnels.",
          "Si une carte graphique dédiée existe, utiliser ses sorties.",
        ],
      },
      {
        title: "Indices de démarrage",
        steps: [
          "Noter bips, voyants de diagnostic, cycles de redémarrage et réaction du clavier.",
          "Consulter le manuel de la carte mère pour interpréter les codes.",
          "Couper et débrancher avant toute intervention interne.",
          "Revenir à une configuration minimale : une barrette de RAM, vidéo nécessaire, aucun périphérique superflu.",
        ],
      },
      {
        title: "Sécurité",
        warning: "N’ouvre jamais le bloc d’alimentation. Décharge-toi électrostatiquement et photographie les branchements avant démontage.",
      },
    ],
  },
  {
    id: "network-windows",
    title: "Diagnostic réseau sous Windows",
    subtitle: "Tester du poste vers l’extérieur, un étage après l’autre",
    duration: "4 min",
    tags: ["Réseau", "Commandes"],
    reminder: "Configuration → lien local → passerelle → IP extérieure → DNS → service.",
    sections: [
      {
        title: "Ordre de test",
        steps: [
          "Déterminer si un seul appareil ou plusieurs sont touchés.",
          "Lire adresse, préfixe, passerelle, DHCP et DNS.",
          "Tester la passerelle, puis une adresse IP extérieure, puis un nom.",
          "Comparer avec un autre poste ou une autre interface connue comme fonctionnelle.",
        ],
      },
      {
        title: "Commandes utiles",
        commands: [
          { command: "ipconfig /all", purpose: "Afficher la configuration complète des interfaces." },
          { command: "ping <passerelle>", purpose: "Tester le chemin jusqu’au routeur local." },
          { command: "ping 1.1.1.1", purpose: "Tester une joignabilité IP extérieure, sans dépendre du DNS." },
          { command: "nslookup example.com", purpose: "Interroger la résolution DNS et voir le serveur utilisé." },
          { command: "tracert example.com", purpose: "Observer les sauts qui répondent le long du chemin." },
          { command: "ipconfig /flushdns", purpose: "Vider le cache DNS client local, si une donnée périmée est suspectée." },
        ],
      },
      {
        title: "Prudence",
        warning: "ipconfig /release coupe la configuration IPv4 de l’interface. Évite cette commande sur une machine distante sans voie de retour.",
      },
    ],
  },
  {
    id: "slow-windows",
    title: "Windows est lent",
    subtitle: "Transformer « ça rame » en mesure exploitable",
    duration: "3 min",
    tags: ["Windows", "Performance"],
    reminder: "Reproduire → mesurer → corréler → isoler → corriger → mesurer encore.",
    sections: [
      {
        title: "Mesures rapides",
        steps: [
          "Noter quand la lenteur apparaît : démarrage, application précise, réseau, copie de fichiers ?",
          "Ouvrir le Gestionnaire des tâches et observer CPU, mémoire, disque et réseau pendant le symptôme.",
          "Trier par la ressource saturée pour identifier le processus corrélé.",
          "Vérifier espace libre, mises à jour en cours et applications de démarrage.",
        ],
      },
      {
        title: "Comparer",
        steps: [
          "Tester après redémarrage, puis dans une session propre si possible.",
          "Utiliser le mode sans échec ou un démarrage minimal pour isoler pilotes et services tiers.",
          "Consulter le Moniteur de fiabilité et les journaux autour de l’heure du problème.",
        ],
      },
      {
        title: "À éviter",
        warning: "Ne lance pas un nettoyeur de registre ni une rafale d’optimisations avant d’avoir une mesure de départ. Sinon tu modifies la scène de crime et tu appelles ça de la maintenance.",
      },
    ],
  },
  {
    id: "before-intervention",
    title: "Avant toute intervention",
    subtitle: "Protéger les données, l’utilisateur et ton propre diagnostic",
    duration: "2 min",
    tags: ["Sécurité", "Procédure"],
    reminder: "Autorisation → sauvegarde → état initial → réversibilité → fenêtre de retour.",
    sections: [
      {
        title: "Checklist",
        steps: [
          "Confirmer le périmètre demandé et ce que tu as le droit de modifier.",
          "Identifier les données irremplaçables et vérifier une sauvegarde récupérable.",
          "Noter ou photographier l’état initial : branchements, réglages, versions, messages exacts.",
          "Préparer pilotes, support de démarrage, alimentation et accès nécessaires avant la coupure.",
          "Définir comment revenir en arrière si la modification échoue.",
          "Informer l’utilisateur des interruptions et du résultat attendu.",
        ],
      },
      {
        title: "Principe",
        warning: "Le technicien n’est pas payé pour avoir l’air actif. Une minute de préparation peut éviter une heure de restauration et trois cafés de mauvaise foi.",
      },
    ],
  },
];
